import { useState } from 'react'
import './App.css'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'medicine', label: 'Medicine', icon: 'pill' },
  { id: 'records', label: 'Records', icon: 'records' },
  { id: 'appointments', label: 'Appointments', icon: 'heart' },
  { id: 'monitoring', label: 'Monitoring', icon: 'calendar' },
]

const SAMPLE_APPOINTMENTS = [
  { date: 'Sun, 15 Feb', time: '10:30 am', place: 'Quest Diagnostics', type: 'Blood Work' },
  { date: 'Mon, 16 Feb', time: '10:30 am', place: 'Lab Corp', type: 'Blood succas' },
  { date: 'Tue, 17 Feb', time: '10:30 am', place: 'Cho mama', type: 'this matumbo' },
  { date: 'Wed, 18 Feb', time: '10:30 am', place: 'Inova Hospital', type: 'CT Scan' },
  { date: 'Thur, 19 Feb', time: '10:30 am', place: 'Patient First', type: 'Random Checkup' },
]

const ACTIVE_MONITORING_OPTIONS = [
  'View Blood Pressure Stats',
  'View Sleep Activity',
  'View Weight loss',
  'View Heart Rate',
  'View Glucose Levels',
]

function Icon({ name, className }) {
  const size = 20
  const icons = {
    grid: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    pill: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.5" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M14.5 13.5 20 8" />
        <path d="M15 15l5 5" />
      </svg>
    ),
    records: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    heart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  }
  return <span className={className}>{icons[name] || null}</span>
}

function App() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [monitoringStat] = useState(() =>
    ACTIVE_MONITORING_OPTIONS[Math.floor(Math.random() * ACTIVE_MONITORING_OPTIONS.length)]
  )

  function handleMonitoringBarClick() {
    console.log('Active monitoring:', monitoringStat)
  }

  return (
    <div className="app">
      <button type="button" className="menu-toggle" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
        <span />
        <span />
        <span />
      </button>

      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'nav-item-active' : ''}`}
              onClick={() => {
                setActiveNav(item.id)
                setMenuOpen(false)
              }}
            >
              <Icon name={item.icon} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <section className="dashboard-section">
          <h1 className="section-title">Dashboard Grid</h1>
          <div className="dashboard-grid">
            <div className="card profile-card">
              <h2 className="card-title">Profile</h2>
              <div className="profile-avatar" aria-hidden />
              <p className="profile-name">John Doe</p>
            </div>
            <div className="card streak-card">
              <h2 className="card-title">Medicine Streak</h2>
              <div className="streak-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
              <p className="streak-value">8 Day Streak</p>
            </div>
          </div>
          <button
            type="button"
            className="active-monitoring-bar"
            onClick={handleMonitoringBarClick}
          >
            <div className="active-monitoring-bar-left">
              <span className="active-monitoring-bar-title">Active monitoring</span>
              <span className="active-monitoring-bar-subtitle">1 active metric</span>
            </div>
            <div className="active-monitoring-bar-right">
              <span className="active-monitoring-bar-cta">{monitoringStat}</span>
              <svg className="active-monitoring-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="active-monitoring-bar-more">…</span>
            </div>
          </button>
        </section>
      </main>

      <aside className="appointments-panel">
        <h2 className="panel-title">Upcoming Appointments</h2>
        <ul className="appointments-list">
          {SAMPLE_APPOINTMENTS.map((apt, i) => (
            <li key={i} className="appointment-item">
              <div className="appointment-info">
                <span className="appointment-date">{apt.date}</span>
                <span className="appointment-time">{apt.time}</span>
                <span className="appointment-place">{apt.place}</span>
                <span className="appointment-type">{apt.type}</span>
              </div>
              <button type="button" className="appointment-action" aria-label="View appointment">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {menuOpen && (
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} aria-hidden />
      )}
    </div>
  )
}

export default App
