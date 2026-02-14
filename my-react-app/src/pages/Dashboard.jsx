import { useState } from 'react'

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

const MEDS_TODAY = { taken: 5, total: 5 }

export default function Dashboard() {
  const [monitoringStat] = useState(() =>
    ACTIVE_MONITORING_OPTIONS[Math.floor(Math.random() * ACTIVE_MONITORING_OPTIONS.length)]
  )

  function handleMonitoringBarClick() {
    console.log('Active monitoring:', monitoringStat)
  }

  const medsTaken = MEDS_TODAY.taken
  const medsTotal = MEDS_TODAY.total
  const medsPercent = medsTotal > 0 ? Math.round((medsTaken / medsTotal) * 100) : 0
  const circleRadius = 40
  const circleCircumference = 2 * Math.PI * circleRadius
  const circleOffset = circleCircumference - (medsPercent / 100) * circleCircumference

  return (
    <>
      <section className="dashboard-section">
        <h1 className="section-title">Dashboard</h1>
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
          <div className="card meds-progress-card">
            <h2 className="card-title">Medications today</h2>
            <div className="meds-progress-circle-wrap">
              <svg className="meds-progress-svg" viewBox="0 0 100 100" aria-hidden>
                <circle
                  className="meds-progress-track"
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="none"
                  strokeWidth="8"
                />
                <circle
                  className="meds-progress-fill"
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="none"
                  strokeWidth="8"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={circleOffset}
                  strokeLinecap="round"
                  transform="rotate(90 50 50)"
                />
              </svg>
              <span className="meds-progress-text">
                {medsTaken} of {medsTotal}
              </span>
            </div>
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
    </>
  )
}
