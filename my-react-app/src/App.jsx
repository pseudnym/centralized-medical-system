import { useState, useEffect } from 'react'
import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import Dashboard from './pages/Dashboard'
import Prescriptions from './pages/Prescriptions'
import Records from './pages/Records'
import RecordForm from './pages/RecordForm'
import Appointments from './pages/Appointments'
import Monitoring from './pages/Monitoring'

const NAV_ITEMS = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'prescriptions', path: '/prescriptions', label: 'Prescriptions', icon: 'pill' },
  { id: 'records', path: '/records', label: 'Records', icon: 'records' },
  { id: 'appointments', path: '/appointments', label: 'Appointments', icon: 'heart' },
  { id: 'monitoring', path: '/monitoring', label: 'Monitoring', icon: 'calendar' },
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    function onToast(e) {
      const { type = 'success', message = 'Successful!' } = e.detail || {}
      setToast({ type, message })
    }
    window.addEventListener('toast', onToast)
    return () => window.removeEventListener('toast', onToast)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

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
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name={item.icon} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/records" element={<Records />} />
          <Route path="/records/new" element={<RecordForm />} />
          <Route path="/records/:id/edit" element={<RecordForm />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/monitoring" element={<Monitoring />} />
        </Routes>
      </main>

      {menuOpen && (
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} aria-hidden />
      )}

      {toast && (
        <div className={`toast toast--${toast.type}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default App
