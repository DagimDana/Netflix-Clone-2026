import express from 'express';
import pool from './db.js';

const router = express.Router();

export const ensureVideosTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS videos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      synopsis TEXT DEFAULT '',
      release_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
      duration_mins INTEGER NOT NULL DEFAULT 0,
      youtube_url TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      age_rating TEXT NOT NULL DEFAULT 'PG-13',
      cover_url TEXT DEFAULT '',
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      is_trending BOOLEAN NOT NULL DEFAULT FALSE,
      views INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS youtube_url TEXT DEFAULT ''`);
};

const normalizeVideo = (row) => ({
  ...row,
  synopsis: row.synopsis ?? '',
  youtube_url: row.youtube_url ?? '',
  cover_url: row.cover_url ?? '',
});

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildUpdateQuery = (body) => {
  const fields = [];
  const values = [];

  const addField = (column, value) => {
    if (value !== undefined) {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    }
  };

  addField('title', body.title !== undefined ? String(body.title).trim() : undefined);
  addField('synopsis', body.synopsis !== undefined ? String(body.synopsis) : undefined);
  addField('release_year', body.release_year !== undefined ? parseNumber(body.release_year, new Date().getFullYear()) : undefined);
  addField('duration_mins', body.duration_mins !== undefined ? parseNumber(body.duration_mins, 0) : undefined);
  addField('youtube_url', body.youtube_url !== undefined ? String(body.youtube_url) : undefined);
  addField('status', body.status !== undefined ? String(body.status).trim() : undefined);
  addField('age_rating', body.age_rating !== undefined ? String(body.age_rating).trim() : undefined);
  addField('cover_url', body.cover_url !== undefined ? String(body.cover_url) : undefined);
  addField('is_featured', body.is_featured !== undefined ? Boolean(body.is_featured) : undefined);
  addField('is_trending', body.is_trending !== undefined ? Boolean(body.is_trending) : undefined);

  fields.push(`updated_at = NOW()`);

  return { fields, values };
};

router.get('/videos', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM videos ORDER BY updated_at DESC, id DESC');
    res.json(result.rows.map(normalizeVideo));
  } catch {
    res.status(500).json({ error: 'Failed to load videos' });
  }
});

router.post('/videos', async (req, res) => {
  const { title, synopsis = '', release_year, duration_mins, youtube_url = '', status, age_rating, cover_url = '', is_featured = false, is_trending = false } = req.body;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO videos (
        title,
        synopsis,
        release_year,
        duration_mins,
        youtube_url,
        status,
        age_rating,
        cover_url,
        is_featured,
        is_trending,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *`,
      [
        String(title).trim(),
        String(synopsis),
        parseNumber(release_year, new Date().getFullYear()),
        parseNumber(duration_mins, 0),
        String(youtube_url),
        status ? String(status).trim() : 'draft',
        age_rating ? String(age_rating).trim() : 'PG-13',
        String(cover_url),
        Boolean(is_featured),
        Boolean(is_trending),
      ],
    );

    res.status(201).json(normalizeVideo(result.rows[0]));
  } catch {
    res.status(500).json({ error: 'Failed to add video' });
  }
});

router.put('/videos/:id', async (req, res) => {
  const { id } = req.params;
  const { fields, values } = buildUpdateQuery(req.body);

  if (fields.length === 1) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  try {
    values.push(id);
    const result = await pool.query(
      `UPDATE videos SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values,
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(normalizeVideo(result.rows[0]));
  } catch {
    res.status(500).json({ error: 'Failed to update video' });
  }
});

router.delete('/videos/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM videos WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;