import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Check, Plus, MoreHorizontal, X, Eye, Pencil, Trash2, CircleUser as UserCircle } from 'lucide-react';
import Sidebar from './Sidebar'; // or correct relative path
import { requestJson } from './adminApi';
import './UserManagement.css';

const ROLES = ['All Roles', 'Admin', 'User'];
const STATUSES = ['All Status', 'Active', 'Inactive', 'Banned'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function StatusBadge({ status }) {
  const cls = `um-status-badge um-status-${status.toLowerCase()}`;
  return <span className={cls}>{status}</span>;
}

function RoleBadge({ role }) {
  return <span className="um-role-badge">{role.charAt(0).toUpperCase() + role.slice(1)}</span>;
}

function Avatar({ src, username }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="um-avatar um-avatar-fallback">
        <UserCircle size={36} color="#888" />
      </div>
    );
  }
  return (
    <img
      className="um-avatar"
      src={src}
      alt={username}
      onError={() => setError(true)}
    />
  );
}

function Dropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="um-dropdown" ref={ref}>
      <button className="um-dropdown-btn" onClick={() => setOpen((o) => !o)}>
        <span>{value}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="um-dropdown-menu">
          {options.map((opt) => (
            <div
              key={opt}
              className={`um-dropdown-item${value === opt ? ' um-dropdown-item-active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              <span>{opt}</span>
              {value === opt && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionsMenu({ user, onEdit, onDelete, onView }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="um-actions-menu" ref={ref}>
      <button className="um-actions-btn" onClick={() => setOpen((o) => !o)}>
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="um-actions-dropdown">
          <div className="um-actions-item" onClick={() => { onView(user); setOpen(false); }}>
            <Eye size={14} /> View
          </div>
          <div className="um-actions-item" onClick={() => { onEdit(user); setOpen(false); }}>
            <Pencil size={14} /> Edit
          </div>
          <div className="um-actions-item um-actions-item-danger" onClick={() => { onDelete(user); setOpen(false); }}>
            <Trash2 size={14} /> Delete
          </div>
        </div>
      )}
    </div>
  );
}

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.email.trim()) {
      setError('Username and email are required.');
      return;
    }
    setLoading(true);
    try {
      await requestJson('/users', {
        method: 'POST',
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          status: form.status,
          avatar_url: form.avatar_url.trim(),
        }),
      });
      onCreated();
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="um-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="um-modal">
        <div className="um-modal-header">
          <div>
            <h2 className="um-modal-title">Add New User</h2>
            <p className="um-modal-subtitle">Enter details to create a new user account.</p>
          </div>
          <button className="um-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="um-modal-form">
          <div className="um-form-group">
            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} placeholder="e.g. john_doe" autoComplete="off" />
          </div>
          <div className="um-form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="user@example.com" autoComplete="off" />
          </div>
          <div className="um-form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••••••••" autoComplete="new-password" />
          </div>
          <div className="um-form-row">
            <div className="um-form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="um-form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
          <div className="um-form-group">
            <label>Avatar URL (Optional)</label>
            <input name="avatar_url" value={form.avatar_url} onChange={handleChange} placeholder="https://..." />
          </div>
          {error && <p className="um-form-error">{error}</p>}
          <div className="um-modal-actions">
            <button type="button" className="um-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="um-btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar_url: user.avatar_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestJson(`/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          role: form.role,
          status: form.status,
          avatar_url: form.avatar_url.trim(),
        }),
      });
      onUpdated();
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="um-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="um-modal">
        <div className="um-modal-header">
          <div>
            <h2 className="um-modal-title">Edit User</h2>
            <p className="um-modal-subtitle">Update user account details.</p>
          </div>
          <button className="um-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="um-modal-form">
          <div className="um-form-group">
            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} />
          </div>
          <div className="um-form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="um-form-row">
            <div className="um-form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="um-form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
          <div className="um-form-group">
            <label>Avatar URL (Optional)</label>
            <input name="avatar_url" value={form.avatar_url} onChange={handleChange} placeholder="https://..." />
          </div>
          {error && <p className="um-form-error">{error}</p>}
          <div className="um-modal-actions">
            <button type="button" className="um-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="um-btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewUserModal({ user, onClose }) {
  return (
    <div className="um-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="um-modal">
        <div className="um-modal-header">
          <div>
            <h2 className="um-modal-title">User Details</h2>
            <p className="um-modal-subtitle">Viewing profile information.</p>
          </div>
          <button className="um-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="um-view-user">
          <div className="um-view-avatar-wrap">
            <Avatar src={user.avatar_url} username={user.username} />
          </div>
          <div className="um-view-row"><span>Username</span><strong>{user.username}</strong></div>
          <div className="um-view-row"><span>Email</span><strong>{user.email}</strong></div>
          <div className="um-view-row"><span>Role</span><RoleBadge role={user.role} /></div>
          <div className="um-view-row"><span>Status</span><StatusBadge status={user.status.charAt(0).toUpperCase() + user.status.slice(1)} /></div>
          <div className="um-view-row"><span>Joined</span><strong>{formatDate(user.created_at)}</strong></div>
        </div>
        <div className="um-modal-actions">
          <button type="button" className="um-btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ user, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await requestJson(`/users/${user.id}`, { method: 'DELETE' });
      onDeleted();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="um-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="um-modal um-modal-sm">
        <div className="um-modal-header">
          <h2 className="um-modal-title">Delete User</h2>
          <button className="um-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="um-delete-msg">
          Are you sure you want to delete <strong>{user.username}</strong>? This action cannot be undone.
        </p>
        <div className="um-modal-actions">
          <button type="button" className="um-btn-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="um-btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [modal, setModal] = useState(null); // null | { type, user? }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await requestJson('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      roleFilter === 'All Roles' || u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchStatus =
      statusFilter === 'All Status' || u.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="um-root">
      {/* Sidebar */}
      
        <Sidebar/>
      
      {/* Main content */}
      <main className="um-main">
        <div className="um-page-header">
          <div className="um-title-block">
            <h1 className="um-title">User<br />Management</h1>
            <p className="um-subtitle">Manage registered users, roles, and statuses.</p>
          </div>
          <div className="um-toolbar">
            <div className="um-search-wrap">
              <Search size={16} className="um-search-icon" />
              <input
                className="um-search"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Dropdown label="All Roles" options={ROLES} value={roleFilter} onChange={setRoleFilter} />
            <Dropdown label="All Status" options={STATUSES} value={statusFilter} onChange={setStatusFilter} />
            <button className="um-btn-add" onClick={() => setModal({ type: 'add' })}>
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>

        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="um-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="um-loading">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="um-loading">No users found.</td></tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="um-row">
                    <td className="um-cell-user">
                      <Avatar src={user.avatar_url} username={user.username} />
                      <div className="um-user-info">
                        <span className="um-username">{user.username}</span>
                        <span className="um-useremail">{user.email}</span>
                      </div>
                    </td>
                    <td><RoleBadge role={user.role} /></td>
                    <td>
                      <StatusBadge status={user.status.charAt(0).toUpperCase() + user.status.slice(1)} />
                    </td>
                    <td className="um-cell-date">{formatDate(user.created_at)}</td>
                    <td className="um-cell-actions">
                      <ActionsMenu
                        user={user}
                        onView={(u) => setModal({ type: 'view', user: u })}
                        onEdit={(u) => setModal({ type: 'edit', user: u })}
                        onDelete={(u) => setModal({ type: 'delete', user: u })}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modal?.type === 'add' && (
        <AddUserModal onClose={() => setModal(null)} onCreated={fetchUsers} />
      )}
      {modal?.type === 'edit' && (
        <EditUserModal user={modal.user} onClose={() => setModal(null)} onUpdated={fetchUsers} />
      )}
      {modal?.type === 'view' && (
        <ViewUserModal user={modal.user} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirmModal user={modal.user} onClose={() => setModal(null)} onDeleted={fetchUsers} />
      )}
    </div>
  );
}
