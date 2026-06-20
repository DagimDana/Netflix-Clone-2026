import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Video,
  Users,
  BarChart2,
  LogOut,
  Activity,
  Eye,
  UserCheck,
  Info,
  TrendingUp,
  ChevronDown,
  X,
  Eye as EyeIcon,
} from 'lucide-react';
import './AdminDashboard.css';
import Sidebar from './Sidebar';
import { requestJson } from './adminApi';

const VIEWING_TREND_DATA = [
  { date: 'Apr 03', value: 4 },
  { date: 'Apr 04', value: 6 },
  { date: 'Apr 05', value: 2 },
  { date: 'Apr 06', value: 2 },
  { date: 'Apr 07', value: 4 },
  { date: 'Apr 08', value: 2 },
  { date: 'Apr 09', value: 4 },
];

const USER_GROWTH_DATA = [
  { label: 'Jan', value: 2 },
  { label: 'Feb', value: 3 },
  { label: 'Mar', value: 5 },
  { label: 'Apr', value: 13 },
];

const USER_STATUS_DATA = [
  { label: 'Active', value: 8, color: '#4a9eff' },
  { label: 'Inactive', value: 4, color: '#6b7280' },
  { label: 'Banned', value: 1, color: '#ef4444' },
];

const ACTIVITY_DATA = [
  {
    id: '#1',
    userId: 'User 1',
    action: 'LOGIN',
    timestamp: 'Apr 07, 2026 09:55:49',
    details: 'Logged in from mobile device',
  },
  {
    id: '#2',
    userId: 'User 2',
    action: 'LOGOUT',
    timestamp: 'Apr 03, 2026 09:55:49',
    details: 'Session ended',
  },
  {
    id: '#3',
    userId: 'User 3',
    action: 'VIEW',
    timestamp: 'Apr 02, 2026 09:55:49',
    details: 'Viewed 2 videos',
  },
  {
    id: '#4',
    userId: 'User 4',
    action: 'PLAY',
    timestamp: 'Mar 30, 2026 09:55:49',
    details: 'Played video for 15 minutes',
  },
  {
    id: '#5',
    userId: 'User 5',
    action: 'SEARCH',
    timestamp: 'Mar 31, 2026 09:55:49',
    details: 'Searched for content',
  },
  {
    id: '#6',
    userId: 'User 6',
    action: 'LOGIN',
    timestamp: 'Apr 02, 2026 09:55:49',
    details: 'Logged in from desktop',
  },
  {
    id: '#7',
    userId: 'User 7',
    action: 'LOGOUT',
    timestamp: 'Mar 30, 2026 09:55:49',
    details: 'Session timeout',
  },
  {
    id: '#8',
    userId: 'User 8',
    action: 'VIEW',
    timestamp: 'Apr 07, 2026 09:55:49',
    details: 'Viewed 5 videos',
  },
  {
    id: '#9',
    userId: 'User 9',
    action: 'PLAY',
    timestamp: 'Apr 03, 2026 09:55:49',
    details: 'Played video for 30 minutes',
  },
];

const ACTION_COLORS = {
  LOGIN: '#3b82f6',
  LOGOUT: '#6b7280',
  VIEW: '#3b82f6',
  PLAY: '#3b82f6',
  SEARCH: '#6b7280',
};

function AreaChart({ data }) {
  const width = 600;
  const height = 220;
  const paddingLeft = 40;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingBottom - paddingTop;

  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = 0;

  const xStep = chartW / (data.length - 1);
  const yScale = (val) => chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  const points = data.map((d, i) => ({
    x: paddingLeft + i * xStep,
    y: paddingTop + yScale(d.value),
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ');

  const areaPath =
    linePath +
    ` L${points[points.length - 1].x},${height - paddingBottom} L${points[0].x},${height - paddingBottom} Z`;

  const gridLines = [0, 2, 4, 6, 8];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
      {gridLines.map((val) => {
        const y = paddingTop + yScale(val);
        return (
          <g key={val}>
            <line
              x1={paddingLeft}
              y1={y}
              x2={width - paddingRight}
              y2={y}
              stroke="#2a2a2a"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text x={paddingLeft - 6} y={y + 4} textAnchor="end" fill="#6b7280" fontSize="11">
              {val}
            </text>
          </g>
        );
      })}

      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ef4444" stroke="#1a1a1a" strokeWidth="2" />
      ))}

      {data.map((d, i) => (
        <text
          key={i}
          x={paddingLeft + i * xStep}
          y={height - paddingBottom + 18}
          textAnchor="middle"
          fill="#6b7280"
          fontSize="11"
        >
          {d.date}
        </text>
      ))}
    </svg>
  );
}

function BarChart({ data }) {
  const width = 300;
  const height = 200;
  const paddingLeft = 30;
  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingRight = 10;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingBottom - paddingTop;

  const maxVal = 16;
  const barW = (chartW / data.length) * 0.5;
  const gap = chartW / data.length;

  const yScale = (val) => chartH - (val / maxVal) * chartH;
  const gridLines = [0, 4, 8, 12, 16];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
      {gridLines.map((val) => {
        const y = paddingTop + yScale(val);
        return (
          <g key={val}>
            <line
              x1={paddingLeft}
              y1={y}
              x2={width - paddingRight}
              y2={y}
              stroke="#2a2a2a"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text x={paddingLeft - 5} y={y + 4} textAnchor="end" fill="#6b7280" fontSize="10">
              {val}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH;
        const x = paddingLeft + i * gap + gap / 2 - barW / 2;
        const y = paddingTop + yScale(d.value);
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="3"
              fill="#3b82f6"
            />
            <text
              x={x + barW / 2}
              y={height - paddingBottom + 16}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 80;
  const cy = 80;
  const r = 55;
  const innerR = 38;

  const slices = data.map((d, index) => {
    const prefixTotal = data.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    const cumulative = prefixTotal + d.value;
    const startAngle = (prefixTotal / total) * 2 * Math.PI - Math.PI / 2;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = d.value / total > 0.5 ? 1 : 0;
    return {
      ...d,
      path: `M${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} L${ix1},${iy1} A${innerR},${innerR} 0 ${largeArc},0 ${ix2},${iy2} Z`,
    };
  });

  return (
    <div className="donut-wrapper">
      <svg viewBox="0 0 160 160" className="donut-svg">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} />
        ))}
        <circle cx={cx} cy={cy} r={innerR - 4} fill="#1e1e1e" />
      </svg>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="donut-legend-item">
            <span className="donut-dot" style={{ background: d.color }} />
            <span className="donut-legend-label">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalVideos: 0,
    activeUsers: 0,
    totalViews: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        const data = await requestJson('/admin/summary');
        if (!cancelled) {
          setSummary((prev) => ({ ...prev, ...data }));
        }
      } catch {
        if (!cancelled) {
          setSummary({
            totalUsers: 0,
            totalVideos: 0,
            activeUsers: 0,
            totalViews: 0,
          });
        }
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const systemStats = [
    {
      label: 'Total Users',
      value: String(summary.totalUsers),
      icon: Users,
      iconColor: '#4a9eff',
      iconBg: '#1a3a5c',
    },
    {
      label: 'Total Videos',
      value: String(summary.totalVideos),
      icon: Video,
      iconColor: '#ff4444',
      iconBg: '#3a1a1a',
    },
    {
      label: 'Active Users (Today)',
      value: String(summary.activeUsers),
      icon: Activity,
      iconColor: '#22c55e',
      iconBg: '#0f2d1a',
    },
    {
      label: 'Total Views',
      value: String(summary.totalViews),
      icon: Eye,
      iconColor: '#f59e0b',
      iconBg: '#2d1f0a',
    },
  ];

  const analyticsStats = [
    {
      label: 'Total Views',
      value: String(summary.totalViews),
      sub: 'from the database',
      icon: Video,
      iconColor: '#ff4444',
    },
    {
      label: 'New Users',
      value: String(summary.totalUsers),
      sub: 'current total accounts',
      icon: Users,
      iconColor: '#4a9eff',
    },
    {
      label: 'Active Users',
      value: String(summary.activeUsers),
      sub: 'current total',
      icon: TrendingUp,
      iconColor: '#22c55e',
    },
  ];

  return (
    <div className="admin-layout">
      <Sidebar/>
      {/* <aside className="admin-sidebar">
        <div className="sidebar-brand">Admin Panel</div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeNav === id ? 'nav-item--active' : ''}`}
              onClick={() => setActiveNav(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside> */}

      <main className="admin-main">
        <section className="section">
          <div className="section-header">
            <h1 className="section-title">System Overview</h1>
            <p className="section-sub">Key performance indicators and current platform statistics.</p>
          </div>

          <div className="stats-grid stats-grid--4">
            {systemStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="stat-card">
                  <div className="stat-card-top">
                    <span className="stat-card-label">{s.label}</span>
                    <div className="stat-card-icons">
                      <span className="stat-icon-wrap" style={{ background: s.iconBg }}>
                        <Icon size={16} color={s.iconColor} />
                      </span>
                      <Info size={14} color="#4b5563" />
                    </div>
                  </div>
                  <div className="stat-card-value">{s.value}</div>
                  <div className="stat-card-footer">
                    <Activity size={12} color="#4b5563" />
                    <span>Live metrics</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="section">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Platform Analytics</h2>
              <p className="section-sub">Monitor viewing trends and user engagement</p>
            </div>
            <div className="time-range-select">
              <span className="time-range-label">Time Range:</span>
              <div className="select-wrap">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="select-input"
                >
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>
                <ChevronDown size={14} className="select-icon" />
              </div>
            </div>
          </div>

          <div className="stats-grid stats-grid--3">
            {analyticsStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="stat-card">
                  <div className="stat-card-top">
                    <span className="stat-card-label">{s.label}</span>
                    <Icon size={18} color={s.iconColor} />
                  </div>
                  <div className="stat-card-value">{s.value}</div>
                  <div className="stat-card-footer">
                    <span className="stat-sub-muted">{s.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="charts-grid">
            <div className="chart-card chart-card--wide">
              <div className="chart-card-header">
                <h3 className="chart-title">Viewing Trends</h3>
                <p className="chart-sub">Video playbacks over time</p>
              </div>
              <div className="chart-body">
                <AreaChart data={VIEWING_TREND_DATA} />
              </div>
            </div>

            <div className="chart-col">
              <div className="chart-card">
                <div className="chart-card-header">
                  <h3 className="chart-title">User Growth</h3>
                </div>
                <div className="chart-body">
                  <BarChart data={USER_GROWTH_DATA} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-card-header">
                  <h3 className="chart-title">User Status</h3>
                </div>
                <div className="chart-body chart-body--center">
                  <DonutChart data={USER_STATUS_DATA} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Recent System Activity</h2>
            <p className="section-sub">Track all user actions and platform events</p>
          </div>

          <div className="activity-table-wrapper">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITY_DATA.map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.id}</td>
                    <td>{activity.userId}</td>
                    <td>
                      <span className="action-badge" style={{ color: ACTION_COLORS[activity.action] }}>
                        {activity.action}
                      </span>
                    </td>
                    <td>{activity.timestamp}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setSelectedActivity(activity)}
                      >
                        <EyeIcon size={16} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {selectedActivity && (
        <aside className="activity-sidebar">
          <div className="sidebar-top">
            <h3 className="sidebar-title">Activity Log Details</h3>
            <button
              className="sidebar-close"
              onClick={() => setSelectedActivity(null)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="sidebar-content">
            <div className="detail-group">
              <span className="detail-label">Log ID:</span>
              <span className="detail-value">{selectedActivity.id}</span>
            </div>

            <div className="detail-group">
              <span className="detail-label">ACTION TYPE</span>
              <span
                className="detail-value detail-action"
                style={{ color: ACTION_COLORS[selectedActivity.action] }}
              >
                {selectedActivity.action}
              </span>
            </div>

            <div className="detail-group">
              <span className="detail-label">USER ID</span>
              <span className="detail-value">{selectedActivity.userId.split(' ')[1] || '1'}</span>
            </div>

            <div className="detail-group">
              <span className="detail-label">TIMESTAMP</span>
              <span className="detail-value">{selectedActivity.timestamp}</span>
            </div>

            <div className="detail-group">
              <span className="detail-label">DETAILS</span>
              <div className="detail-box">{selectedActivity.details}</div>
            </div>

            <div className="detail-group-row">
              <div className="detail-group">
                <span className="detail-label">CREATED AT</span>
                <span className="detail-value">Apr 09, 2026 09:55</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">UPDATED AT</span>
                <span className="detail-value">Apr 09, 2026 09:55</span>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
