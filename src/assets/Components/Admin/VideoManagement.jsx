import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Video, Users, BarChart2, LogOut, Play, Eye, Star, TrendingUp, Search, Filter, RefreshCw, Plus, MoreVertical, Check, X, ChevronDown, CreditCard as Edit2, Trash2, Archive, AlertCircle } from 'lucide-react';
// import { supabase } from '../lib/supabase';
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

const EMPTY_FORM = {
  title: '',
  synopsis: '',
  release_year: new Date().getFullYear(),
  duration_mins: 0,
  status: 'draft',
  age_rating: 'PG-13',
  cover_url: '',
  is_featured: false,
  is_trending: false,
};

export default function VideoManagement() {
  const [activeNav, setActiveNav] = useState('video');
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

  useEffect(() => {
    fetchVideos();
  }, []);

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

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) setVideos(data);
    setLoading(false);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
      status: video.status,
      age_rating: video.age_rating,
      cover_url: video.cover_url || '',
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
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    const payload = {
      ...formData,
      updated_at: new Date().toISOString(),
    };
    if (editingVideo) {
      const { error } = await supabase
        .from('videos')
        .update(payload)
        .eq('id', editingVideo.id);
      if (!error) {
        showNotification('Video updated successfully');
        fetchVideos();
        closePanel();
      } else {
        showNotification('Failed to update video', 'error');
      }
    } else {
      const { error } = await supabase.from('videos').insert([payload]);
      if (!error) {
        showNotification('Video added successfully');
        fetchVideos();
        closePanel();
      } else {
        showNotification('Failed to add video', 'error');
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (!error) {
      showNotification('Video deleted successfully');
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } else {
      showNotification('Failed to delete video', 'error');
    }
    setDeleteConfirm(null);
    setActionMenuOpen(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from('videos')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      showNotification(`Video ${newStatus}`);
      fetchVideos();
    }
    setActionMenuOpen(null);
  };

  const filteredVideos = videos.filter((v) => {
    const matchSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
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
                <label className="vm-label">Release Year</label>
                <input
                  className="vm-input"
                  type="number"
                  value={formData.release_year}
                  onChange={(e) => setFormData((p) => ({ ...p, release_year: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="vm-form-group">
                <label className="vm-label">Duration (mins)</label>
                <input
                  className="vm-input"
                  type="number"
                  value={formData.duration_mins}
                  onChange={(e) => setFormData((p) => ({ ...p, duration_mins: parseInt(e.target.value) || 0 }))}
                />
              </div>
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
              <label className="vm-label">Cover Image URL</label>
              <input
                className="vm-input"
                placeholder="https://..."
                value={formData.cover_url}
                onChange={(e) => setFormData((p) => ({ ...p, cover_url: e.target.value }))}
              />
              {formData.cover_url && (
                <div className="vm-cover-preview">
                  <img src={formData.cover_url} alt="Cover preview" />
                </div>
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
