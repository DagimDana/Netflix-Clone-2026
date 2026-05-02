import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, Users, BarChart2, LogOut } from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/videos', label: 'Video Management', icon: Video },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/stats', label: 'Statistics', icon: BarChart2 },
];

function Sidebar() {
  return (
    <aside className="vm-sidebar">
      
      <div className="vm-sidebar__brand">
        <span className="um-brand-dot"></span>
        <span>Admin Panel</span>
      </div>

      <nav className="vm-sidebar__nav">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `vm-nav-item ${isActive ? 'vm-nav-item--active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="vm-sidebar__logout">
        <LogOut size={18} />
        <span>Logout</span>
      </button>

    </aside>
  );
}

export default Sidebar;