import express from 'express';
import pool from './db.js';
import crypto from 'crypto';

const router = express.Router();

export const ensureManagedUsersTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS managed_users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'active',
      avatar_url TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

const normalizeUser = (row) => {
  const user = { ...row };
  delete user.password_hash;
  return {
    ...user,
    avatar_url: user.avatar_url ?? '',
  };
};

const hashPassword = (password) => {
  if (!password) return null;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const parseSummaryNumber = (value) => Number(value) || 0;

router.get('/users', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM managed_users ORDER BY created_at DESC, id DESC');
    res.json(result.rows.map(normalizeUser));
  } catch {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

router.post('/users', async (req, res) => {
  const { username, email, password, role = 'user', status = 'active', avatar_url = '' } = req.body;

  if (!username || !String(username).trim()) {
    return res.status(400).json({ error: 'Username is required' });
  }

  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO managed_users (
        username,
        email,
        password_hash,
        role,
        status,
        avatar_url,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [
        String(username).trim(),
        String(email).trim().toLowerCase(),
        hashPassword(password),
        String(role).trim().toLowerCase() || 'user',
        String(status).trim().toLowerCase() || 'active',
        avatar_url ? String(avatar_url).trim() : '',
      ],
    );

    res.status(201).json(normalizeUser(result.rows[0]));
  } catch (error) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to add user' });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  const addField = (column, value) => {
    if (value !== undefined) {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    }
  };

  if (req.body.username !== undefined) addField('username', String(req.body.username).trim());
  if (req.body.email !== undefined) addField('email', String(req.body.email).trim().toLowerCase());
  if (req.body.password !== undefined) addField('password_hash', hashPassword(req.body.password));
  if (req.body.role !== undefined) addField('role', String(req.body.role).trim().toLowerCase());
  if (req.body.status !== undefined) addField('status', String(req.body.status).trim().toLowerCase());
  if (req.body.avatar_url !== undefined) addField('avatar_url', String(req.body.avatar_url).trim());

  fields.push('updated_at = NOW()');

  if (fields.length === 1) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  try {
    values.push(id);
    const result = await pool.query(
      `UPDATE managed_users SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values,
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(normalizeUser(result.rows[0]));
  } catch (error) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM managed_users WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.get('/admin/summary', async (_req, res) => {
  try {
    const [usersResult, videosResult, viewsResult, featuredResult, trendingResult] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS total_users, COUNT(*) FILTER (WHERE status = 'active')::int AS active_users, COUNT(*) FILTER (WHERE status = 'inactive')::int AS inactive_users, COUNT(*) FILTER (WHERE status = 'banned')::int AS banned_users FROM managed_users"),
      pool.query("SELECT COUNT(*)::int AS total_videos, COUNT(*) FILTER (WHERE status = 'published')::int AS published_videos, COUNT(*) FILTER (WHERE status = 'draft')::int AS draft_videos, COUNT(*) FILTER (WHERE status = 'archived')::int AS archived_videos FROM videos"),
      pool.query('SELECT COALESCE(SUM(views), 0)::int AS total_views FROM videos'),
      pool.query('SELECT COUNT(*)::int AS featured_videos FROM videos WHERE is_featured = TRUE'),
      pool.query('SELECT COUNT(*)::int AS trending_videos FROM videos WHERE is_trending = TRUE'),
    ]);

    const users = usersResult.rows[0] || {};
    const videos = videosResult.rows[0] || {};
    const views = viewsResult.rows[0] || {};
    const featured = featuredResult.rows[0] || {};
    const trending = trendingResult.rows[0] || {};

    res.json({
      totalUsers: parseSummaryNumber(users.total_users),
      activeUsers: parseSummaryNumber(users.active_users),
      inactiveUsers: parseSummaryNumber(users.inactive_users),
      bannedUsers: parseSummaryNumber(users.banned_users),
      totalVideos: parseSummaryNumber(videos.total_videos),
      publishedVideos: parseSummaryNumber(videos.published_videos),
      draftVideos: parseSummaryNumber(videos.draft_videos),
      archivedVideos: parseSummaryNumber(videos.archived_videos),
      totalViews: parseSummaryNumber(views.total_views),
      featuredVideos: parseSummaryNumber(featured.featured_videos),
      trendingVideos: parseSummaryNumber(trending.trending_videos),
    });
  } catch {
    res.status(500).json({ error: 'Failed to load admin summary' });
  }
});

export default router;