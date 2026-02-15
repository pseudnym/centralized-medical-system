import { useState, useEffect } from 'react'
import { NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import { getSession, onAuthStateChange, logout } from './api/auth'
import { UserProvider, useUser } from './contexts/UserContext'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Prescriptions from './pages/Prescriptions'
import PrescriptionForm from './pages/PrescriptionForm'
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
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    logout: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  }
  return <span className={className}>{icons[name] || null}</span>
}

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const { patientName } = useUser()

  function handleMenuToggle() {
    if (window.matchMedia('(min-width: 1025px)').matches) {
      setSidebarCollapsed((c) => !c)
    } else {
      setMenuOpen((o) => !o)
    }
  }

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
    <div className={`app ${sidebarCollapsed ? 'app-sidebar-collapsed' : ''}`}>
      {!menuOpen && (
        <button type="button" className="menu-toggle menu-toggle-mobile" onClick={handleMenuToggle} aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
      )}

      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <button type="button" className="sidebar-header" onClick={handleMenuToggle} aria-label="Toggle menu">
          <div className="sidebar-logo" aria-hidden />
          <span className="sidebar-brand">Angel</span>
        </button>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name={item.icon} className="nav-icon" />
              <span className="nav-item-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="sidebar-profile-avatar" aria-hidden />
            <span className="sidebar-profile-text">{patientName}</span>
          </div>
          <button type="button" className="sidebar-bottom-btn" aria-label="Settings">
            <Icon name="settings" className="sidebar-bottom-icon" />
            <span className="sidebar-bottom-label">Settings</span>
          </button>
          <button
            type="button"
            className="sidebar-bottom-btn"
            aria-label="Logout"
            onClick={() => setLogoutModalOpen(true)}
          >
            <Icon name="logout" className="sidebar-bottom-icon" />
            <span className="sidebar-bottom-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/prescriptions/new" element={<PrescriptionForm />} />
          <Route path="/prescriptions/:id/edit" element={<PrescriptionForm />} />
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

      {logoutModalOpen && (
        <div
          className="logout-modal-overlay"
          onClick={() => setLogoutModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Logout"
        >
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <p className="logout-modal-text">Are you sure you want to sign out?</p>
            <div className="logout-modal-actions">
              <button type="button" className="logout-modal-cancel" onClick={() => setLogoutModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="logout-modal-confirm"
                onClick={() => {
                  setLogoutModalOpen(false)
                  logout()
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast--${toast.type}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    getSession().then((s) => {
      setSession(s)
      setAuthLoading(false)
    })
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChange((_event, s) => setSession(s))
    return unsubscribe
  }, [])

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-panel-left">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="auth-brand">
              <div className="auth-logo"><span className="auth-logo-inner" /></div>
              <span className="auth-brand-name">Angel</span>
            </div>
            <p className="auth-subtitle">Loading…</p>
          </div>
        </div>
        <div className="auth-panel-right" />
      </div>
    )
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  if (isAuthPage && session) {
    return <Navigate to="/dashboard" replace />
  }
  if (!isAuthPage && !session) {
    return <Navigate to="/login" replace />
  }
  if (location.pathname === '/login') {
    return <Login />
  }
  if (location.pathname === '/signup') {
    return <Signup />
  }

  return (
    <UserProvider>
      <AppLayout />
    </UserProvider>
  )
}

export default App
