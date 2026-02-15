import { useState, useEffect } from 'react'
import { useUser } from '../contexts/UserContext'
import { getSession } from '../api/auth'
import { getUpcomingAppointments } from '../api/appointments'

const ACTIVE_MONITORING_OPTIONS = [
  'View Blood Pressure Stats',
  'View Sleep Activity',
  'View Weight loss',
  'View Heart Rate',
  'View Glucose Levels',
]

const MEDS_TODAY = { taken: 5, total: 5 }

// Placeholder: replace with Gemini API call later
async function sendToChatBot(userMessage) {
  // Simulate network delay; swap this for your Gemini API call
  await new Promise((r) => setTimeout(r, 600))
  return `This reply will come from Gemini. You said: "${userMessage}"`
}

export default function Dashboard() {
  const { patientName } = useUser()
  const [monitoringStat] = useState(() =>
    ACTIVE_MONITORING_OPTIONS[Math.floor(Math.random() * ACTIVE_MONITORING_OPTIONS.length)]
  )
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [upcomingLoading, setUpcomingLoading] = useState(true)
  const [upcomingError, setUpcomingError] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    setUpcomingLoading(true)
    setUpcomingError(null)
    getSession()
      .then((session) => session?.user?.id ?? null)
      .then((userId) => getUpcomingAppointments(userId))
      .then(({ data, error }) => {
        setUpcomingAppointments(data ?? [])
        setUpcomingError(error ? error.message || 'Could not load appointments' : null)
        setUpcomingLoading(false)
      })
      .catch((err) => {
        setUpcomingAppointments([])
        setUpcomingError(err?.message || 'Could not load appointments')
        setUpcomingLoading(false)
      })
  }, [])

  function handleMonitoringBarClick() {
    console.log('Active monitoring:', monitoringStat)
  }

  async function handleChatSend(e) {
    e.preventDefault()
    const text = chatInput.trim()
    if (!text || chatLoading) return
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: text }])
    setChatLoading(true)
    try {
      const reply = await sendToChatBot(text)
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setChatLoading(false)
    }
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
            <p className="profile-name">{patientName}</p>
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

        <section className="dashboard-chatbot card">
          <h2 className="card-title">Assistant</h2>
          <div className="chatbot-messages" role="log" aria-live="polite">
            {chatMessages.length === 0 ? (
              <p className="chatbot-placeholder">Ask a question. Replies will come from Gemini once connected.</p>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`chatbot-message chatbot-message--${msg.role}`}>
                  <span className="chatbot-message-role">{msg.role === 'user' ? 'You' : 'Assistant'}</span>
                  <p className="chatbot-message-content">{msg.content}</p>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="chatbot-message chatbot-message--assistant chatbot-message--loading">
                <span className="chatbot-message-role">Assistant</span>
                <p className="chatbot-message-content">Thinking…</p>
              </div>
            )}
          </div>
          <form className="chatbot-form" onSubmit={handleChatSend}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Type a message…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
              aria-label="Message"
            />
            <button type="submit" className="chatbot-send" disabled={chatLoading || !chatInput.trim()} aria-label="Send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </section>
      </section>

      <aside className="appointments-panel">
        <h2 className="panel-title">Upcoming Appointments</h2>
        {upcomingLoading ? (
          <p className="appointments-loading">Loading…</p>
        ) : upcomingError ? (
          <p className="appointments-upcoming-error" title={upcomingError}>
            Could not load appointments.
          </p>
        ) : upcomingAppointments.length === 0 ? (
          <p className="appointments-upcoming-empty">No upcoming appointments.</p>
        ) : (
          <ul className="appointments-list">
            {upcomingAppointments.map((apt) => (
              <li key={apt.id} className="appointment-item">
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
        )}
      </aside>
    </>
  )
}
