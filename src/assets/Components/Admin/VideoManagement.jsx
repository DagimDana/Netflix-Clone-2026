import { useState, useEffect, useRef, useCallback } from 'react';
import { Video, Play, Eye, Star, TrendingUp, Search, Filter, RefreshCw, Plus, MoreVertical, Check, X, ChevronDown, CreditCard as Edit2, Trash2, Archive, AlertCircle } from 'lucide-react';
import './VideoManagement.css';
import Sidebar from './Sidebar';

// const NAV_ITEMS = [
//   { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//   { id: 'video', label: 'Video Management', icon: Video },
//   { id: 'users', label: 'User Management', icon: Users },
//   { id: 'stats', label: 'Statistics', icon: BarChart2 },
// ];

const STATUS_OPTIONS = ['All Status', 'Published', 'Draft', 'Archived'];

const AGE_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

const CURRENT_YEAR = new Date().getFullYear();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const EMPTY_FORM = {
  title: '',
  synopsis: '',
  release_year: CURRENT_YEAR,
  duration_mins: 0,
  youtube_url: '',
  status: 'draft',
  age_rating: 'PG-13',
  cover_url: '',
  is_featured: false,
  is_trending: false,
};

const requestJson = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(`Cannot reach API at ${API_BASE_URL}`);
  }

  const responseText = await response.text();
  let data = null;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = { error: responseText || 'Request failed' };
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Request failed');
  }

  return data;
};

const extractYouTubeVideoId = (youtubeUrl) => {
  if (!youtubeUrl) return '';

  try {
    const parsedUrl = new URL(youtubeUrl);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      return parsedUrl.pathname.split('/').filter(Boolean)[0] || '';
    }

    if (hostname.endsWith('youtube.com')) {
      if (parsedUrl.pathname.startsWith('/shorts/')) {
        return parsedUrl.pathname.split('/').filter(Boolean)[1] || '';
      }

      if (parsedUrl.pathname.startsWith('/embed/')) {
        return parsedUrl.pathname.split('/').filter(Boolean)[1] || '';
      }

      return parsedUrl.searchParams.get('v') || '';
    }
  } catch {
    const match = youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&/]|$)/);
    return match?.[1] || '';
  }

  return '';
};

const getYouTubeThumbnailUrl = (youtubeUrl) => {
  const videoId = extractYouTubeVideoId(youtubeUrl);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
};

const clampReleaseYear = (value) => {
  const parsedYear = Number(value);
  if (!Number.isFinite(parsedYear)) return CURRENT_YEAR;
  return Math.min(Math.max(Math.trunc(parsedYear), 1900), CURRENT_YEAR);
};

const clampDurationMins = (value) => {
  const parsedDuration = Number(value);
  if (!Number.isFinite(parsedDuration)) return 0;
  return Math.max(0, Math.trunc(parsedDuration));
};

const buildVideoPayload = (data) => ({
  title: data.title.trim(),
  synopsis: data.synopsis.trim(),
  release_year: clampReleaseYear(data.release_year),
  duration_mins: clampDurationMins(data.duration_mins),
  youtube_url: data.youtube_url.trim(),
  status: data.status,
  age_rating: data.age_rating,
  cover_url: (data.cover_url || getYouTubeThumbnailUrl(data.youtube_url)).trim(),
  is_featured: Boolean(data.is_featured),
  is_trending: Boolean(data.is_trending),
});

export default function VideoManagement() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);

  const statusDropdownRef = useRef(null);
  const actionMenuRef = useRef(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await requestJson('/videos');
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      setVideos([]);
      showNotification(error.message || 'Failed to load videos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    const handler = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openAddPanel = () => {
    setEditingVideo(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setPanelOpen(true);
  };

  const openEditPanel = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      synopsis: video.synopsis || '',
      release_year: video.release_year,
      duration_mins: video.duration_mins,
      youtube_url: video.youtube_url || '',
      status: video.status,
      age_rating: video.age_rating,
      cover_url: video.cover_url || getYouTubeThumbnailUrl(video.youtube_url || ''),
      is_featured: video.is_featured,
      is_trending: video.is_trending,
    });
    setFormErrors({});
    setPanelOpen(true);
    setActionMenuOpen(null);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingVideo(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.status) errors.status = 'Status is required';
    if (formData.release_year === '' || formData.release_year === null || formData.release_year === undefined) {
      errors.release_year = 'Release year is required';
    }
    if (formData.duration_mins === '' || formData.duration_mins === null || formData.duration_mins === undefined) {
      errors.duration_mins = 'Duration is required';
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    const payload = buildVideoPayload(formData);
    try {
      if (editingVideo) {
        await requestJson(`/videos/${editingVideo.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showNotification('Video updated successfully');
      } else {
        await requestJson('/videos', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showNotification('Video added successfully');
      }
      await fetchVideos();
      closePanel();
    } catch (error) {
      showNotification(error.message || 'Failed to save video', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await requestJson(`/videos/${id}`, { method: 'DELETE' });
      showNotification('Video deleted successfully');
      await fetchVideos();
    } catch (error) {
      showNotification(error.message || 'Failed to delete video', 'error');
    }
    setDeleteConfirm(null);
    setActionMenuOpen(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await requestJson(`/videos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      showNotification(`Video ${newStatus}`);
      await fetchVideos();
    } catch (error) {
      showNotification(error.message || 'Failed to update video status', 'error');
    }
    setActionMenuOpen(null);
  };

  const filteredVideos = videos.filter((v) => {
    const matchSearch = (v.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      statusFilter === 'All Status' ||
      v.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const featuredCount = videos.filter((v) => v.is_featured).length;
  const trendingCount = videos.filter((v) => v.is_trending).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const getStatusClass = (status) => {
    if (status === 'published') return 'vm-badge vm-badge--published';
    if (status === 'draft') return 'vm-badge vm-badge--draft';
    if (status === 'archived') return 'vm-badge vm-badge--archived';
    return 'vm-badge';
  };

  return (
    <div className="vm-root">
      <Sidebar/>
      {/* <Sidebar/>
      <aside className="vm-sidebar">
        <div className="vm-sidebar__brand">Admin Panel</div>
        <nav className="vm-sidebar__nav">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`vm-nav-item ${activeNav === id ? 'vm-nav-item--active' : ''}`}
              onClick={() => setActiveNav(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button className="vm-sidebar__logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside> */}

      <main className={`vm-main ${panelOpen ? 'vm-main--shifted' : ''}`}>
        {notification && (
          <div className={`vm-notification ${notification.type === 'error' ? 'vm-notification--error' : ''}`}>
            {notification.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
            {notification.message}
          </div>
        )}

        <section className="vm-stats">
          <div className="vm-stat-card">
            <div className="vm-stat-card__header">
              <span>Total Videos</span>
              <Play size={18} className="vm-stat-card__icon" />
            </div>
            <div className="vm-stat-card__value">{videos.length}</div>
            <div className="vm-stat-card__label">All videos in the catalog</div>
          </div>
          <div className="vm-stat-card">
            <div className="vm-stat-card__header">
              <span>Total Views</span>
              <Eye size={18} className="vm-stat-card__icon" />
            </div>
            <div className="vm-stat-card__value">{totalViews}</div>
            <div className="vm-stat-card__label">Total user views across platform</div>
          </div>
          <div className="vm-stat-card">
            <div className="vm-stat-card__header">
              <span>Featured Content</span>
              <Star size={18} className="vm-stat-card__icon" />
            </div>
            <div className="vm-stat-card__value">{featuredCount}</div>
            <div className="vm-stat-card__label">Videos highlighted on homepage</div>
          </div>
          <div className="vm-stat-card">
            <div className="vm-stat-card__header">
              <span>Trending Now</span>
              <TrendingUp size={18} className="vm-stat-card__icon vm-stat-card__icon--green" />
            </div>
            <div className="vm-stat-card__value">{trendingCount}</div>
            <div className="vm-stat-card__label">Currently popular content</div>
          </div>
        </section>

        <section className="vm-library">
          <div className="vm-library__header">
            <div className="vm-library__title-block">
              <h1 className="vm-library__title">Content<br />Library</h1>
              <p className="vm-library__subtitle">Manage movies, TV shows, and streaming assets.</p>
            </div>
            <div className="vm-library__controls">
              <div className="vm-search">
                <Search size={15} className="vm-search__icon" />
                <input
                  className="vm-search__input"
                  placeholder="Search titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="vm-filter" ref={statusDropdownRef}>
                <button
                  className="vm-filter__btn"
                  onClick={() => setStatusDropdownOpen((o) => !o)}
                >
                  <Filter size={14} />
                  <span>{statusFilter}</span>
                  <ChevronDown size={14} />
                </button>
                {statusDropdownOpen && (
                  <div className="vm-filter__dropdown">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        className={`vm-filter__option ${statusFilter === opt ? 'vm-filter__option--active' : ''}`}
                        onClick={() => {
                          setStatusFilter(opt);
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {opt}
                        {statusFilter === opt && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="vm-icon-btn" onClick={fetchVideos} title="Refresh">
                <RefreshCw size={16} />
              </button>
              <button className="vm-add-btn" onClick={openAddPanel}>
                <Plus size={16} />
                Add Video
              </button>
            </div>
          </div>

          <div className="vm-table-wrapper">
            <table className="vm-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title &amp; Details</th>
                  <th>Status</th>
                  <th>Metrics</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="vm-table__empty">
                      <RefreshCw size={20} className="vm-spin" />
                      Loading...
                    </td>
                  </tr>
                ) : filteredVideos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="vm-table__empty">No videos found</td>
                  </tr>
                ) : (
                  filteredVideos.map((video) => (
                    <tr key={video.id} className="vm-table__row">
                      <td className="vm-table__cover-cell">
                        <div className="vm-cover">
                          {video.cover_url ? (
                            <img src={video.cover_url} alt={video.title} className="vm-cover__img" />
                          ) : (
                            <div className="vm-cover__placeholder">
                              <Video size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="vm-table__details-cell">
                        <div className="vm-video-title">{video.title}</div>
                        <div className="vm-video-meta">
                          <span>{video.release_year}</span>
                          <span className="vm-dot">•</span>
                          <span>{video.duration_mins}m</span>
                          <span className="vm-dot">•</span>
                          <span className="vm-rating-badge">{video.age_rating}</span>
                        </div>
                        <div className="vm-video-synopsis">{video.synopsis}</div>
                      </td>
                      <td>
                        <span className={getStatusClass(video.status)}>
                          {video.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="vm-table__metrics-cell">
                        <span>{video.views}</span>
                        <span className="vm-metrics-label"> views</span>
                      </td>
                      <td className="vm-table__date-cell">{formatDate(video.updated_at)}</td>
                      <td className="vm-table__actions-cell">
                        <div className="vm-action-menu-wrapper" ref={actionMenuOpen === video.id ? actionMenuRef : null}>
                          <button
                            className="vm-action-btn"
                            onClick={() => setActionMenuOpen(actionMenuOpen === video.id ? null : video.id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {actionMenuOpen === video.id && (
                            <div className="vm-action-dropdown">
                              <button className="vm-action-option" onClick={() => openEditPanel(video)}>
                                <Edit2 size={14} /> Edit
                              </button>
                              {video.status !== 'published' && (
                                <button className="vm-action-option" onClick={() => handleStatusChange(video.id, 'published')}>
                                  <Play size={14} /> Publish
                                </button>
                              )}
                              {video.status !== 'archived' && (
                                <button className="vm-action-option" onClick={() => handleStatusChange(video.id, 'archived')}>
                                  <Archive size={14} /> Archive
                                </button>
                              )}
                              <button
                                className="vm-action-option vm-action-option--danger"
                                onClick={() => {
                                  setDeleteConfirm(video.id);
                                  setActionMenuOpen(null);
                                }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <div className={`vm-panel-overlay ${panelOpen ? 'vm-panel-overlay--visible' : ''}`} onClick={closePanel} />
      <aside className={`vm-panel ${panelOpen ? 'vm-panel--open' : ''}`}>
        <div className="vm-panel__header">
          <div>
            <h2 className="vm-panel__title">{editingVideo ? 'Edit Title' : 'Add New Title'}</h2>
            <p className="vm-panel__subtitle">
              Fill in the details for this content. Required fields are marked with an asterisk (*).
            </p>
          </div>
          <button className="vm-panel__close" onClick={closePanel}>
            <X size={20} />
          </button>
        </div>

        <div className="vm-panel__body">
          <div className="vm-form-section">
            <h3 className="vm-form-section__title">Basic Information</h3>
            <div className="vm-form-group">
              <label className="vm-label">
                Title <span className="vm-required">*</span>
              </label>
              <input
                className={`vm-input ${formErrors.title ? 'vm-input--error' : ''}`}
                placeholder="Enter title"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              />
              {formErrors.title && <span className="vm-error-msg">{formErrors.title}</span>}
            </div>

            <div className="vm-form-group">
              <label className="vm-label">Synopsis</label>
              <textarea
                className="vm-textarea"
                placeholder="Brief description of the content..."
                value={formData.synopsis}
                onChange={(e) => setFormData((p) => ({ ...p, synopsis: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="vm-form-row">
              <div className="vm-form-group">
                <label className="vm-label">
                  Release Year <span className="vm-required">*</span>
                </label>
                <input
                  className="vm-input"
                  type="number"
                  min="1900"
                  max={CURRENT_YEAR}
                  required
                  value={formData.release_year}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, release_year: e.target.value }));
                  }}
                  onBlur={(e) => {
                    const nextValue = e.target.value;
                    setFormData((p) => ({
                      ...p,
                      release_year: nextValue === '' ? '' : clampReleaseYear(nextValue),
                    }));
                  }}
                />
                {formErrors.release_year && <span className="vm-error-msg">{formErrors.release_year}</span>}
              </div>
              <div className="vm-form-group">
                <label className="vm-label">
                  Duration (mins) <span className="vm-required">*</span>
                </label>
                <input
                  className="vm-input"
                  type="number"
                  min="0"
                  required
                  value={formData.duration_mins}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, duration_mins: e.target.value }));
                  }}
                  onBlur={(e) => {
                    const nextValue = e.target.value;
                    setFormData((p) => ({
                      ...p,
                      duration_mins: nextValue === '' ? '' : clampDurationMins(nextValue),
                    }));
                  }}
                />
                {formErrors.duration_mins && <span className="vm-error-msg">{formErrors.duration_mins}</span>}
              </div>
            </div>

            <div className="vm-form-group">
              <label className="vm-label">YouTube Video URL</label>
              <input
                className="vm-input"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.youtube_url}
                onChange={(e) => {
                  const youtubeUrl = e.target.value;
                  setFormData((p) => ({
                    ...p,
                    youtube_url: youtubeUrl,
                    cover_url: getYouTubeThumbnailUrl(youtubeUrl),
                  }));
                }}
              />
            </div>

            <div className="vm-form-row">
              <div className="vm-form-group">
                <label className="vm-label">
                  Status <span className="vm-required">*</span>
                </label>
                <select
                  className={`vm-select ${formErrors.status ? 'vm-input--error' : ''}`}
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="draft">Draft</option>

              {editingVideo?.youtube_url && (
                <div className="vm-video-link">
                  <a href={editingVideo.youtube_url} target="_blank" rel="noreferrer">
                    Open YouTube Video
                  </a>
                </div>
              )}
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="vm-form-group">
                <label className="vm-label">Age Rating</label>
                <select
                  className="vm-select"
                  value={formData.age_rating}
                  onChange={(e) => setFormData((p) => ({ ...p, age_rating: e.target.value }))}
                >
                  {AGE_RATINGS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="vm-form-section">
            <h3 className="vm-form-section__title">Media</h3>
            <div className="vm-form-group">
              <label className="vm-label">Thumbnail Preview</label>
              <input
                className="vm-input"
                placeholder="Thumbnail will be captured from the YouTube link"
                value={formData.cover_url || getYouTubeThumbnailUrl(formData.youtube_url)}
                readOnly
              />
              {(formData.cover_url || getYouTubeThumbnailUrl(formData.youtube_url)) && (
                <div className="vm-cover-preview">
                  <img
                    src={formData.cover_url || getYouTubeThumbnailUrl(formData.youtube_url)}
                    alt="YouTube thumbnail preview"
                  />
                </div>
              )}
              {!formData.youtube_url && (
                <span className="vm-helper-text">Add a YouTube link to auto-capture the thumbnail.</span>
              )}
            </div>
          </div>

          <div className="vm-form-section">
            <h3 className="vm-form-section__title">Visibility</h3>
            <div className="vm-toggle-group">
              <label className="vm-toggle-label">
                <span>Featured Content</span>
                <button
                  type="button"
                  className={`vm-toggle ${formData.is_featured ? 'vm-toggle--on' : ''}`}
                  onClick={() => setFormData((p) => ({ ...p, is_featured: !p.is_featured }))}
                >
                  <span className="vm-toggle__knob" />
                </button>
              </label>
              <label className="vm-toggle-label">
                <span>Trending</span>
                <button
                  type="button"
                  className={`vm-toggle ${formData.is_trending ? 'vm-toggle--on' : ''}`}
                  onClick={() => setFormData((p) => ({ ...p, is_trending: !p.is_trending }))}
                >
                  <span className="vm-toggle__knob" />
                </button>
              </label>
            </div>
          </div>
        </div>

        <div className="vm-panel__footer">
          <button className="vm-btn-secondary" onClick={closePanel}>Cancel</button>
          <button className="vm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editingVideo ? 'Save Changes' : 'Add Video'}
          </button>
        </div>
      </aside>

      {deleteConfirm && (
        <div className="vm-modal-overlay">
          <div className="vm-modal">
            <div className="vm-modal__icon">
              <Trash2 size={24} />
            </div>
            <h3 className="vm-modal__title">Delete Video</h3>
            <p className="vm-modal__text">
              Are you sure you want to delete this video? This action cannot be undone.
            </p>
            <div className="vm-modal__actions">
              <button className="vm-btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="vm-btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
