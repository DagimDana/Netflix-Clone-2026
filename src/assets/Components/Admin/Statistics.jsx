import { useState, useRef, useEffect } from 'react';
import { Users, Clock, UserPlus, Play, Calendar, Download, ChevronDown, TrendingUp, ChevronLeft, ChevronRight, Eye, LayoutDashboard, Video, BarChart2, LogOut } from 'lucide-react';
import './Statistics.css';
import Sidebar from './Sidebar';

const PLATFORMS = ['All Platforms', 'Web Browser', 'Mobile App', 'Smart TV'];
const CONTENT_TYPES = ['All Content', 'Movies', 'TV Series'];
const METRICS = ['Total Views', 'Watch Time'];

const TOP_CONTENT = [
  { rank: 1, title: 'The Quantum Escape', trending: true, year: 2023, rating: 'PG13', views: 2, watchTime: '0h 23m' },
  { rank: 2, title: 'Hearts Across Oceans', trending: false, year: 2023, rating: 'PG13', views: 2, watchTime: '3h 32m' },
  { rank: 3, title: 'Midnight Conspiracy', trending: true, year: 2024, rating: 'R', views: 2, watchTime: '1h 27m' },
  { rank: 4, title: 'Laughter Under the Stars', trending: false, year: 2023, rating: 'PG', views: 2, watchTime: '3h 37m' },
  { rank: 5, title: 'The Last Guardian', trending: true, year: 2024, rating: 'PG13', views: 2, watchTime: '1h 50m' },
  { rank: 6, title: 'Echoes of the Forgotten', trending: false, year: 2023, rating: 'R', views: 2, watchTime: '1h 44m' },
];

function generateActivityData(startDate, days) {
  const data = [];
  const d = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const date = new Date(d);
    date.setDate(d.getDate() + i);
    data.push({
      date,
      label: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      activeUsers: Math.floor(Math.random() * 10) + 8,
      newRegistrations: Math.floor(Math.random() * 8) + 5,
      watchTime: parseFloat((Math.random() * 5 + 1).toFixed(2)),
    });
  }
  return data;
}

const DEFAULT_START = new Date(2026, 2, 10);
const DEFAULT_END = new Date(2026, 3, 9);

export default function Statistics() {
  const [platform, setPlatform] = useState('All Platforms');
  const [platformOpen, setPlatformOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState(DEFAULT_START);
  const [rangeEnd, setRangeEnd] = useState(DEFAULT_END);
  const [hoverDate, setHoverDate] = useState(null);
  const [calLeft, setCalLeft] = useState(new Date(2026, 2, 1));
  const [tooltip, setTooltip] = useState(null);
  const [barTooltip, setBarTooltip] = useState(null);
  const [contentType, setContentType] = useState('All Content');
  const [contentTypeOpen, setContentTypeOpen] = useState(false);
  const [metric, setMetric] = useState('Total Views');
  const [metricOpen, setMetricOpen] = useState(false);
  const calRef = useRef(null);
  const platformRef = useRef(null);
  const contentTypeRef = useRef(null);
  const metricRef = useRef(null);

  const days = Math.round((rangeEnd - rangeStart) / 86400000) + 1;
  const activityData = generateActivityData(rangeStart, Math.min(days, 30));

  const totalActiveUsers = activityData.reduce((s, d) => s + d.activeUsers, 0);
  const totalWatchTime = parseFloat(activityData.reduce((s, d) => s + d.watchTime, 0).toFixed(1));
  const totalRegistrations = activityData.reduce((s, d) => s + d.newRegistrations, 0);
  const totalViews = totalActiveUsers + Math.floor(totalActiveUsers * 0.8);

  useEffect(() => {
    function handler(e) {
      if (calRef.current && !calRef.current.contains(e.target)) setCalendarOpen(false);
      if (platformRef.current && !platformRef.current.contains(e.target)) setPlatformOpen(false);
      if (contentTypeRef.current && !contentTypeRef.current.contains(e.target)) setContentTypeOpen(false);
      if (metricRef.current && !metricRef.current.contains(e.target)) setMetricOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function formatDate(d) {
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  function handleDayClick(d) {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(d);
      setRangeEnd(null);
      setHoverDate(null);
    } else {
      if (d < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(d);
      } else {
        setRangeEnd(d);
      }
      setCalendarOpen(false);
    }
  }

  function isDayInRange(d) {
    const end = rangeEnd || hoverDate;
    if (!rangeStart || !end) return false;
    const s = rangeStart < end ? rangeStart : end;
    const e = rangeStart < end ? end : rangeStart;
    return d >= s && d <= e;
  }

  function isDayStart(d) {
    return rangeStart && d.toDateString() === rangeStart.toDateString();
  }

  function isDayEnd(d) {
    const end = rangeEnd || hoverDate;
    return end && d.toDateString() === end.toDateString();
  }

  function renderCalMonth(baseDate) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const monthName = baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return (
      <div className="cal-month">
        <div className="cal-month-title">{monthName}</div>
        <div className="cal-grid">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d} className="cal-dow">{d}</span>)}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (!day) return <span key={`e-${wi}-${di}`} />;
              const inRange = isDayInRange(day);
              const isStart = isDayStart(day);
              const isEnd = isDayEnd(day);
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <span
                  key={day.toISOString()}
                  className={`cal-day${inRange ? ' in-range' : ''}${isStart ? ' range-start' : ''}${isEnd ? ' range-end' : ''}${isToday ? ' today' : ''}`}
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => rangeStart && !rangeEnd && setHoverDate(day)}
                >
                  {day.getDate()}
                </span>
              );
            })
          )}
        </div>
      </div>
    );
  }

  const calRight = new Date(calLeft.getFullYear(), calLeft.getMonth() + 1, 1);

  // SVG Line Chart
  const chartW = 520, chartH = 220, padL = 48, padR = 16, padT = 20, padB = 40;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const maxY = Math.max(...activityData.map(d => Math.max(d.activeUsers, d.newRegistrations))) + 2;
  const yTicks = [0, 4, 8, 12, 16];

  function xPos(i) { return padL + (activityData.length === 1 ? innerW / 2 : (i / (activityData.length - 1)) * innerW); }
  function yPos(v) { return padT + innerH - (v / maxY) * innerH; }

  const auPath = activityData.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(d.activeUsers)}`).join(' ');
  const nrPath = activityData.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(d.newRegistrations)}`).join(' ');

  // SVG Bar Chart
  const barW = 520, barH = 220, bPadL = 48, bPadR = 16, bPadT = 20, bPadB = 40;
  const bInnerW = barW - bPadL - bPadR;
  const bInnerH = barH - bPadT - bPadB;
  const maxWt = Math.max(...activityData.map(d => d.watchTime));
  const wtTicks = [0, 2, 4, 6, 8];
  const barSlot = bInnerW / activityData.length;
  const barWidth = Math.min(barSlot * 0.55, 32);

  return (
    <div className="um-root">
      {/* Sidebar */}
      <Sidebar/>
      {/* Main Content */}
      <main className="um-main-content">
        <div className="stats-page">
      {/* KPI Section */}
      <section className="kpi-section">
        <h1 className="section-title">Dashboard Overview</h1>
        <p className="section-sub">Key performance indicators for the last 30 days.</p>
        <div className="kpi-grid">
          <KpiCard icon={<Users size={20} />} label="Total Active Users" value={totalActiveUsers} change={5.2} />
          <KpiCard icon={<Clock size={20} />} label="Total Watch Time (Hours)" value={totalWatchTime} change={100.0} />
          <KpiCard icon={<UserPlus size={20} />} label="New Registrations (30d)" value={totalRegistrations} change={100.0} />
          <KpiCard icon={<Play size={20} />} label="Total Views (30d)" value={totalViews} change={100.0} />
        </div>
      </section>

      {/* Platform Stats Section */}
      <section className="platform-section">
        <div className="platform-header">
          <div className="platform-title-block">
            <h2 className="platform-title">Platform Statistics</h2>
            <p className="platform-sub">Analyze user engagement and content performance over time.</p>
          </div>
          <div className="platform-controls">
            {/* Date Range Picker */}
            <div className="date-picker-wrap" ref={calRef}>
              <button className="date-picker-btn" onClick={() => setCalendarOpen(v => !v)}>
                <Calendar size={16} />
                <span>{formatDate(rangeStart)} - {rangeEnd ? formatDate(rangeEnd) : '...'}</span>
              </button>
              {calendarOpen && (
                <div className="calendar-dropdown">
                  <div className="cal-nav">
                    <button onClick={() => setCalLeft(new Date(calLeft.getFullYear(), calLeft.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>
                    <div className="cal-months-row">
                      {renderCalMonth(calLeft)}
                      {renderCalMonth(calRight)}
                    </div>
                    <button onClick={() => setCalLeft(new Date(calLeft.getFullYear(), calLeft.getMonth() + 1, 1))}><ChevronRight size={16} /></button>
                  </div>
                </div>
              )}
            </div>

            {/* Platform Dropdown */}
            <div className="platform-dropdown-wrap" ref={platformRef}>
              <button className="platform-dropdown-btn" onClick={() => setPlatformOpen(v => !v)}>
                <span>{platform}</span>
                <ChevronDown size={16} />
              </button>
              {platformOpen && (
                <div className="platform-dropdown-menu">
                  {PLATFORMS.map(p => (
                    <div
                      key={p}
                      className={`platform-option${platform === p ? ' active' : ''}`}
                      onClick={() => { setPlatform(p); setPlatformOpen(false); }}
                    >
                      {p}
                      {platform === p && <span className="check">&#10003;</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export */}
            <button className="export-btn">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Line Chart */}
          <div className="chart-card">
            <h3 className="chart-title">User Activity Trends</h3>
            <p className="chart-sub">Daily active users vs new registrations</p>
            <div className="chart-wrap" style={{ position: 'relative' }}>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height="100%" style={{ display: 'block' }}>
                {/* Grid lines */}
                {yTicks.map(t => (
                  <g key={t}>
                    <line x1={padL} y1={yPos(t)} x2={chartW - padR} y2={yPos(t)} stroke="#333" strokeDasharray="4 4" strokeWidth="1" />
                    <text x={padL - 6} y={yPos(t) + 4} textAnchor="end" fill="#888" fontSize="11">{t}</text>
                  </g>
                ))}
                {/* X labels */}
                {activityData.map((d, i) => {
                  if (activityData.length <= 8 || i % Math.ceil(activityData.length / 6) === 0 || i === activityData.length - 1)
                    return <text key={i} x={xPos(i)} y={chartH - padB + 18} textAnchor="middle" fill="#888" fontSize="11">{d.label}</text>;
                  return null;
                })}
                {/* Lines */}
                <path d={auPath} fill="none" stroke="#3b9eff" strokeWidth="2.5" strokeLinejoin="round" />
                <path d={nrPath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" />
                {/* Dots + hover */}
                {activityData.map((d, i) => (
                  <g key={i}>
                    <circle cx={xPos(i)} cy={yPos(d.activeUsers)} r="4" fill="#3b9eff" />
                    <circle cx={xPos(i)} cy={yPos(d.newRegistrations)} r="4" fill="#22c55e" />
                    <rect
                      x={xPos(i) - barSlot / 2}
                      y={padT}
                      width={activityData.length === 1 ? innerW : (innerW / (activityData.length - 1))}
                      height={innerH}
                      fill="transparent"
                      onMouseEnter={e => setTooltip({ i, x: xPos(i), y: Math.min(yPos(d.activeUsers), yPos(d.newRegistrations)) - 10, d })}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  </g>
                ))}
                {/* Tooltip crosshair */}
                {tooltip && (
                  <line x1={xPos(tooltip.i)} y1={padT} x2={xPos(tooltip.i)} y2={chartH - padB} stroke="#aaa" strokeWidth="1" strokeDasharray="3 3" />
                )}
              </svg>
              {tooltip && (
                <div className="chart-tooltip" style={{ left: Math.min(xPos(tooltip.i) / chartW * 100, 70) + '%', top: 0 }}>
                  <div className="tt-date">{tooltip.d.label}</div>
                  <div className="tt-row"><span className="tt-dot" style={{ background: '#3b9eff' }} /> Active Users: {tooltip.d.activeUsers}</div>
                  <div className="tt-row"><span className="tt-dot" style={{ background: '#22c55e' }} /> New Registrations: {tooltip.d.newRegistrations}</div>
                </div>
              )}
            </div>
            <div className="chart-legend">
              <span className="legend-item" style={{ color: '#3b9eff' }}><span className="legend-line" style={{ borderColor: '#3b9eff' }} /> Active Users</span>
              <span className="legend-item" style={{ color: '#22c55e' }}><span className="legend-line" style={{ borderColor: '#22c55e' }} /> New Registrations</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Watch Time Distribution</h3>
            <p className="chart-sub">Total viewing hours across the platform</p>
            <div className="chart-wrap" style={{ position: 'relative' }}>
              <svg viewBox={`0 0 ${barW} ${barH}`} width="100%" height="100%" style={{ display: 'block' }}>
                {wtTicks.map(t => (
                  <g key={t}>
                    <line x1={bPadL} y1={bPadT + bInnerH - (t / 8) * bInnerH} x2={barW - bPadR} y2={bPadT + bInnerH - (t / 8) * bInnerH} stroke="#333" strokeDasharray="4 4" strokeWidth="1" />
                    <text x={bPadL - 6} y={bPadT + bInnerH - (t / 8) * bInnerH + 4} textAnchor="end" fill="#888" fontSize="11">{t}h</text>
                  </g>
                ))}
                {activityData.map((d, i) => {
                  const bx = bPadL + i * barSlot + (barSlot - barWidth) / 2;
                  const bh = (d.watchTime / 8) * bInnerH;
                  const by = bPadT + bInnerH - bh;
                  return (
                    <g key={i}>
                      <rect
                        x={bx} y={by} width={barWidth} height={bh}
                        fill={barTooltip?.i === i ? '#ff4444' : '#e11d48'}
                        rx="3"
                        onMouseEnter={() => setBarTooltip({ i, d })}
                        onMouseLeave={() => setBarTooltip(null)}
                        style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
                      />
                      {(activityData.length <= 8 || i % Math.ceil(activityData.length / 6) === 0 || i === activityData.length - 1) && (
                        <text x={bx + barWidth / 2} y={barH - bPadB + 18} textAnchor="middle" fill="#888" fontSize="11">{d.label}</text>
                      )}
                    </g>
                  );
                })}
              </svg>
              {barTooltip && (
                <div className="chart-tooltip" style={{ left: Math.min((bPadL + barTooltip.i * barSlot) / barW * 100, 65) + '%', top: 0 }}>
                  <div className="tt-date">{barTooltip.d.label}</div>
                  <div className="tt-row"><span className="tt-dot" style={{ background: '#e11d48' }} /> Watch Time (Hours): {barTooltip.d.watchTime}</div>
                </div>
              )}
            </div>
            <div className="chart-legend">
              <span className="legend-item" style={{ color: '#e11d48' }}><span className="legend-bar" /> Watch Time (Hours)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Performing Content Section */}
      <section className="content-section">
        <div className="content-header">
          <div>
            <h2 className="content-title">
              <TrendingUp size={24} className="content-icon" />
              Top Performing Content
            </h2>
            <p className="content-sub">Top 10 most popular titles based on selected metrics</p>
          </div>
          <div className="content-controls">
            {/* Content Type Dropdown */}
            <div className="dropdown-wrap" ref={contentTypeRef}>
              <button className="dropdown-btn" onClick={() => setContentTypeOpen(v => !v)}>
                <span>{contentType}</span>
                <ChevronDown size={16} />
              </button>
              {contentTypeOpen && (
                <div className="dropdown-menu">
                  {CONTENT_TYPES.map(ct => (
                    <div
                      key={ct}
                      className={`dropdown-option${contentType === ct ? ' active' : ''}`}
                      onClick={() => { setContentType(ct); setContentTypeOpen(false); }}
                    >
                      {ct}
                      {contentType === ct && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metric Dropdown */}
            <div className="dropdown-wrap" ref={metricRef}>
              <button className="dropdown-btn" onClick={() => setMetricOpen(v => !v)}>
                <span>{metric}</span>
                <ChevronDown size={16} />
              </button>
              {metricOpen && (
                <div className="dropdown-menu">
                  {METRICS.map(m => (
                    <div
                      key={m}
                      className={`dropdown-option${metric === m ? ' active' : ''}`}
                      onClick={() => { setMetric(m); setMetricOpen(false); }}
                    >
                      {m}
                      {metric === m && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="content-table">
          <table>
            <thead>
              <tr>
                <th className="th-rank">Rank</th>
                <th className="th-title">Title</th>
                <th className="th-year">Release Year</th>
                <th className="th-rating">Rating</th>
                <th className="th-views">
                  <Eye size={16} />
                  Views
                </th>
                <th className="th-watch">Total Watch Time</th>
              </tr>
            </thead>
            <tbody>
              {TOP_CONTENT.map(item => (
                <tr key={item.rank}>
                  <td className="td-rank">
                    <span className={`rank-badge${item.rank <= 3 ? ' top-3' : ''}`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="td-title">
                    <div className="title-cell">
                      <span>{item.title}</span>
                      {item.trending && <span className="trending-badge">TRENDING</span>}
                    </div>
                  </td>
                  <td className="td-year">{item.year}</td>
                  <td className="td-rating">
                    <span className="rating-badge">{item.rating}</span>
                  </td>
                  <td className="td-views">{item.views}</td>
                  <td className="td-watch">{item.watchTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ icon, label, value, change }) {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-change">
        <TrendingUp size={14} />
        {change}% from last month
      </div>
    </div>
  );
}
