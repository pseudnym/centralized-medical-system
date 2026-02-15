import { useState } from 'react'
import { useUser } from '../contexts/UserContext'

const DATA_TYPES = [
  { value: 'heart_rate', label: 'Heart Rate', unit: 'BPM' },
  { value: 'steps', label: 'Steps', unit: 'steps' },
  { value: 'blood_pressure', label: 'Blood Pressure', unit: 'e.g. 120/80' },
  { value: 'weight', label: 'Weight', unit: 'kg' },
  { value: 'sleep', label: 'Sleep', unit: 'hours' },
  { value: 'active_energy', label: 'Active Energy', unit: 'kcal' },
]

const INTEGRATIONS = [
  { id: 'apple', name: 'Apple Watch', description: 'Sync heart rate, steps, and workouts' },
  { id: 'fitbit', name: 'Fitbit', description: 'Track activity and sleep' },
  { id: 'garmin', name: 'Garmin', description: 'Connect your Garmin device' },
  { id: 'samsung', name: 'Samsung Galaxy Watch', description: 'Sync health data' },
]
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const PERIODS = ['DAY', 'WEEK', 'MONTH', 'YEAR']

const STATS = {
  height: { value: '170 cm', label: 'Height', icon: 'ruler' },
  weight: { value: '78 kg', label: 'Weight', icon: 'scale' },
  bloodType: { value: 'AB+', label: 'Blood type', icon: 'drop' },
}

const HEART_RATE_DATA = [
  { time: '00:00', bpm: 72 },
  { time: '04:00', bpm: 68 },
  { time: '08:00', bpm: 85 },
  { time: '10:00', bpm: 82 },
  { time: '12:00', bpm: 88 },
  { time: '14:00', bpm: 79 },
  { time: '16:00', bpm: 77 },
  { time: '18:00', bpm: 84 },
  { time: '20:00', bpm: 80 },
  { time: '22:00', bpm: 75 },
]

const STEPS_DATA = [
  { time: '06:00', steps: 200 },
  { time: '08:00', steps: 450 },
  { time: '10:00', steps: 600 },
  { time: '12:00', steps: 750 },
  { time: '14:00', steps: 820 },
  { time: '16:00', steps: 900 },
  { time: '18:00', steps: 950 },
  { time: '20:00', steps: 1000 },
]

const ACTIVE_ENERGY_DATA = [
  { period: '6-9', kcal: 12 },
  { period: '9-12', kcal: 8 },
  { period: '12-15', kcal: 15 },
  { period: '15-18', kcal: 41.5 },
  { period: '18-21', kcal: 22 },
]

const SLEEP = { night: 8, nap: 1.5 }

const ACTIVITIES = [
  { id: 1, name: 'Running', date: 'Dec 3, 2023', time: '09:00 AM - 10:00 AM', metrics: '10 km | 1 hours', icon: 'run' },
  { id: 2, name: 'Treadmill', date: 'Dec 2, 2023', time: '07:00 AM - 07:30 AM', metrics: '5 km | 30 minutes', icon: 'treadmill' },
  { id: 3, name: 'Cycling', date: 'Dec 1, 2023', time: '02:00 PM - 05:00 PM', metrics: '40 km | 3 hours', icon: 'cycle' },
]

function StatIcon({ name }) {
  const size = 24
  const icons = {
    ruler: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
        <path d="m14.5 12.5 2-2" />
        <path d="m11.5 9.5 2-2" />
        <path d="m8.5 6.5 2-2" />
        <path d="m17.5 15.5 2-2" />
      </svg>
    ),
    scale: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
    ),
    drop: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
      </svg>
    ),
  }
  return <span className="stat-card-icon">{icons[name] || null}</span>
}

function ActivityIcon({ name }) {
  const size = 20
  const icons = {
    run: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3Z" />
        <path d="M12 12h5" />
        <path d="M14 6 9 12l-4-2-2 3 6 4 7-6 3-6-4 2z" />
      </svg>
    ),
    treadmill: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 8h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2" />
        <path d="M22 8h-4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" />
        <path d="M6 14h12" />
        <path d="M10 18h4" />
      </svg>
    ),
    cycle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M9 17.5 14 8l4 4-3 5.5" />
        <path d="M14 8h4l-4-4 2 4" />
      </svg>
    ),
  }
  return <span className="activity-item-icon">{icons[name] || null}</span>
}

function formatGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 18) return 'Good Afternoon'
  return 'Good Evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-')
}

function AddDataModal({ onClose, onSave }) {
  const [dataType, setDataType] = useState('heart_rate')
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const selectedMeta = DATA_TYPES.find((t) => t.value === dataType) || DATA_TYPES[0]

  function handleSubmit(e) {
    e.preventDefault()
    onSave?.()
    onClose()
  }

  return (
    <div
      className="monitoring-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-data-modal-title"
    >
      <div className="monitoring-modal monitoring-add-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="add-data-modal-title" className="monitoring-modal-title">Add monitoring data</h2>
        <p className="monitoring-modal-subtitle">Enter a reading manually. Data is for display only and is not saved.</p>
        <form onSubmit={handleSubmit} className="monitoring-add-form">
          <div className="monitoring-form-field">
            <label htmlFor="add-data-type">Data type</label>
            <select
              id="add-data-type"
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              className="monitoring-form-input"
            >
              {DATA_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="monitoring-form-field">
            <label htmlFor="add-data-value">Value ({selectedMeta.unit})</label>
            <input
              id="add-data-value"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={selectedMeta.unit}
              className="monitoring-form-input"
            />
          </div>
          <div className="monitoring-form-field">
            <label htmlFor="add-data-date">Date</label>
            <input
              id="add-data-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="monitoring-form-input"
            />
          </div>
          <div className="monitoring-form-field">
            <label htmlFor="add-data-notes">Notes (optional)</label>
            <input
              id="add-data-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes"
              className="monitoring-form-input"
            />
          </div>
          <div className="monitoring-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function IntegrationsModal({ onClose }) {
  return (
    <div
      className="monitoring-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="integrations-modal-title"
    >
      <div className="monitoring-modal monitoring-integrations-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="integrations-modal-title" className="monitoring-modal-title">Connect a device</h2>
        <p className="monitoring-modal-subtitle">Link your wearable or app to sync health data. Integration is not active in this demo.</p>
        <ul className="integrations-list">
          {INTEGRATIONS.map((item) => (
            <li key={item.id} className="integration-item">
              <div className="integration-item-info">
                <span className="integration-item-name">{item.name}</span>
                <span className="integration-item-desc">{item.description}</span>
              </div>
              <button type="button" className="integration-connect-btn btn-primary" onClick={() => {}}>
                Connect
              </button>
            </li>
          ))}
        </ul>
        <div className="monitoring-modal-actions monitoring-modal-actions-single">
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function Monitoring() {
  const { patientName } = useUser()
  const [period, setPeriod] = useState('DAY')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [integrationsModalOpen, setIntegrationsModalOpen] = useState(false)

  return (
    <>
      <section className="monitoring-section">
        <div className="monitoring-header">
          <div>
            <h1 className="monitoring-greeting">{formatGreeting()}, {patientName}</h1>
            <p className="monitoring-date">{formatDate()}</p>
          </div>
          <div className="monitoring-actions">
            <button type="button" className="monitoring-action-btn btn-primary" onClick={() => setAddModalOpen(true)}>
              Add data
            </button>
            <button type="button" className="monitoring-action-btn btn-secondary" onClick={() => setIntegrationsModalOpen(true)}>
              Connect device
            </button>
          </div>
        </div>

        <div className="period-selector">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              className={`period-btn ${period === p ? 'period-btn-active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="health-stats-block">
          <div className="health-stats-header">
            <h2 className="panel-title">Health Statistics</h2>
            <button type="button" className="expand-icon-btn" aria-label="Expand">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
            </button>
          </div>

          <div className="health-stats-grid">
            <div className="card stat-card">
              <StatIcon name={STATS.height.icon} />
              <span className="stat-card-value">{STATS.height.value}</span>
              <span className="stat-card-label">{STATS.height.label}</span>
            </div>
            <div className="card stat-card">
              <StatIcon name={STATS.weight.icon} />
              <span className="stat-card-value">{STATS.weight.value}</span>
              <span className="stat-card-label">{STATS.weight.label}</span>
            </div>
            <div className="card stat-card">
              <StatIcon name={STATS.bloodType.icon} />
              <span className="stat-card-value">{STATS.bloodType.value}</span>
              <span className="stat-card-label">{STATS.bloodType.label}</span>
            </div>
          </div>

          <div className="chart-widgets-grid">
            <div className="card chart-widget chart-widget-heart">
              <h3 className="chart-widget-title">
                <span className="chart-widget-icon chart-widget-icon-heart">♥</span>
                Heart Rate
              </h3>
              <p className="chart-widget-summary">Average heart rate over the whole day is 82 BPM.</p>
              <p className="chart-widget-current">77 BPM | Normal</p>
              <div className="chart-widget-chart">
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={HEART_RATE_DATA} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} width={28} />
                    <Line type="monotone" dataKey="bpm" stroke="#dc2626" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card chart-widget chart-widget-steps">
              <h3 className="chart-widget-title">
                <span className="chart-widget-icon chart-widget-icon-steps">👟</span>
                Steps
              </h3>
              <p className="chart-widget-summary">Average steps over the whole day is 600 Steps.</p>
              <p className="chart-widget-current">1000 Steps | Normal</p>
              <div className="chart-widget-chart">
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={STEPS_DATA} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} width={32} />
                    <Line type="monotone" dataKey="steps" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card chart-widget chart-widget-energy">
              <h3 className="chart-widget-title">
                <span className="chart-widget-icon chart-widget-icon-energy">⚡</span>
                Active Energy
              </h3>
              <p className="chart-widget-summary">Average active energy over the whole day is 41.5 kcal.</p>
              <p className="chart-widget-current">41.5 kcal | Normal</p>
              <div className="chart-widget-chart">
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={ACTIVE_ENERGY_DATA} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} width={32} />
                    <Bar dataKey="kcal" fill="#0c310e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card chart-widget chart-widget-sleep">
              <h3 className="chart-widget-title">
                <span className="chart-widget-icon chart-widget-icon-sleep">🌙</span>
                Sleep Activity
              </h3>
              <p className="chart-widget-summary">Average sleep activity over the whole day is 6 Hours.</p>
              <p className="chart-widget-current">{SLEEP.night + SLEEP.nap} hours | Good</p>
              <div className="sleep-bars">
                <div className="sleep-bar-row">
                  <span className="sleep-bar-label">Sleep at Night</span>
                  <span className="sleep-bar-value">{SLEEP.night} hr(s)</span>
                  <div className="sleep-bar-track">
                    <div className="sleep-bar-fill sleep-bar-fill-night" style={{ width: `${(SLEEP.night / 10) * 100}%` }} />
                  </div>
                </div>
                <div className="sleep-bar-row">
                  <span className="sleep-bar-label">Nap</span>
                  <span className="sleep-bar-value">{SLEEP.nap} hr(s)</span>
                  <div className="sleep-bar-track">
                    <div className="sleep-bar-fill sleep-bar-fill-nap" style={{ width: `${(SLEEP.nap / 3) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="activity-panel">
        <div className="activity-panel-header">
          <h2 className="panel-title">Activity</h2>
          <button type="button" className="expand-icon-btn" aria-label="Expand">⌃</button>
        </div>
        <div className="card activity-calorie-card">
          <span className="activity-calorie-icon">🔥</span>
          <h3 className="activity-calorie-title">Calorie Burnt</h3>
          <p className="activity-calorie-summary">Average calorie burnt over all activity is 500 kcal.</p>
          <p className="activity-calorie-current">1000 kcal | Good</p>
        </div>
        <div className="activity-list-block">
          <h3 className="activity-list-title">Latest Activity</h3>
          <ul className="activity-list">
            {ACTIVITIES.map((a) => (
              <li key={a.id} className="activity-item">
                <div className="activity-item-main">
                  <ActivityIcon name={a.icon} />
                  <div className="activity-item-info">
                    <span className="activity-item-name">{a.name}</span>
                    <span className="activity-item-meta">{a.date} – {a.time}</span>
                    <span className="activity-item-metrics">{a.metrics}</span>
                  </div>
                </div>
                <div className="activity-item-map-placeholder" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {addModalOpen && (
        <AddDataModal
          onClose={() => setAddModalOpen(false)}
          onSave={() => setAddModalOpen(false)}
        />
      )}
      {integrationsModalOpen && (
        <IntegrationsModal onClose={() => setIntegrationsModalOpen(false)} />
      )}
    </>
  )
}
