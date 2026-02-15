import { useState, useEffect, useCallback } from 'react'
import { getSession } from '../api/auth'
import { fetchEstablishments, PAGE_SIZE } from '../api/establishments'
import { createAppointment, getUpcomingAppointments } from '../api/appointments'

const BUSY_LEVELS = ['Low', 'Medium', 'High']

/** Stable busy level per establishment id for display */
function getBusyLevel(id) {
  return BUSY_LEVELS[Number(id) % 3]
}

const initialForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  sex: '',
  genderIdentity: '',
  address: '',
  aptSuite: '',
  city: '',
  state: '',
  zipCode: '',
  email: '',
  phone: '',
  isMobilePhone: 'Yes',
  scheduledFor: '',
  reason: '',
}

export default function Appointments() {
  const [establishments, setEstablishments] = useState([])
  const [totalCount, setTotalCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [selectedEstablishment, setSelectedEstablishment] = useState(null)
  const [rightTab, setRightTab] = useState('book')
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [upcomingLoading, setUpcomingLoading] = useState(true)
  const [upcomingError, setUpcomingError] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const loadPage = useCallback(
    async (fromOffset = 0, append = false) => {
      const isFirst = !append
      if (isFirst) setLoading(true)
      else setLoadingMore(true)
      const { data, error, totalCount: total } = await fetchEstablishments({
        offset: fromOffset,
        limit: PAGE_SIZE,
        search: searchInput.trim() || undefined,
      })
      if (error) {
        setEstablishments((prev) => (append ? prev : []))
        setTotalCount(null)
      } else {
        const withBusy = (data || []).map((e) => ({ ...e, busyLevel: getBusyLevel(e.id) }))
        if (append) {
          setEstablishments((prev) => [...prev, ...withBusy])
        } else {
          setEstablishments(withBusy)
        }
        setTotalCount(total ?? null)
      }
      setLoading(false)
      setLoadingMore(false)
    },
    [searchInput]
  )

  useEffect(() => {
    loadPage(0, false)
  }, [loadPage])

  function loadUpcoming(opts = {}) {
    setUpcomingLoading(true)
    setUpcomingError(null)
    getSession()
      .then((session) => session?.user?.id ?? null)
      .then((userId) => getUpcomingAppointments(userId, opts))
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
  }

  useEffect(() => {
    loadUpcoming()
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    loadPage(0, false)
  }

  function handleLoadMore() {
    loadPage(establishments.length, true)
  }

  function handleSelectEstablishment(est) {
    setSelectedEstablishment(est)
    setRightTab('book')
    setSaveError('')
  }

  function handleClearSelection() {
    setSelectedEstablishment(null)
    setForm(initialForm)
    setSaveError('')
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaveError('')
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    if (!selectedEstablishment) return
    const scheduledFor = form.scheduledFor?.trim()
    const reason = form.reason?.trim()
    if (!scheduledFor || !reason) {
      setSaveError('Please enter appointment date/time and reason.')
      return
    }
    setSaving(true)
    setSaveError('')
    createAppointment({
      medical_provider_id: selectedEstablishment.id,
      scheduled_for: scheduledFor.replace('T', ' '),
      reason,
    })
      .then(({ data, error }) => {
        if (error) {
          setSaveError(error.message || 'Failed to book appointment')
          return
        }
        window.dispatchEvent(
          new CustomEvent('toast', { detail: { type: 'success', message: 'Appointment booked!' } })
        )
        setForm(initialForm)
        loadUpcoming()
      })
      .finally(() => setSaving(false))
  }

  const hasMore = totalCount != null && establishments.length < totalCount

  const upcomingWidget = (
    <aside className="appointments-panel appointments-upcoming-panel">
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
  )

  return (
    <section className="appointments-page">
      <div
        className={`appointments-layout ${selectedEstablishment ? 'appointments-layout--with-selection' : ''}`}
      >
        <div className="appointments-list-wrap">
          <div className="appointments-list-header">
            <h1 className="section-title">Establishments</h1>
            <form className="appointments-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                className="appointments-search-input"
                placeholder="Search by name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search establishments"
              />
              <button type="submit" className="appointments-search-btn">
                Search
              </button>
            </form>
          </div>
          {loading ? (
            <p className="appointments-loading">Loading establishments…</p>
          ) : (
            <>
              <p className="appointments-count">
                {totalCount != null ? `Showing ${establishments.length} of ${totalCount}` : 'Establishments'}
              </p>
              <ul className="establishments-list">
                {establishments.map((est) => (
                  <li key={est.id}>
                    <button
                      type="button"
                      className={`establishment-card ${selectedEstablishment?.id === est.id ? 'establishment-card--selected' : ''}`}
                      onClick={() => handleSelectEstablishment(est)}
                    >
                      <div className="establishment-card-title">
                        {est.name}
                      </div>
                      <span className={`establishment-card-badge establishment-card-badge--${est.busyLevel.toLowerCase()}`}>
                        {est.busyLevel}
                      </span>
                      <div className="establishment-card-details">
                        {est.address ? (
                          <span className="establishment-card-detail">
                            <span className="establishment-card-icon" aria-hidden>📍</span>
                            {est.address}
                          </span>
                        ) : (
                          <span className="establishment-card-detail">
                            <span className="establishment-card-icon" aria-hidden>📍</span>
                            Address not set
                          </span>
                        )}
                        <span className="establishment-card-detail">
                          <span className="establishment-card-icon" aria-hidden>📅</span>
                          Available next 7 days: —
                        </span>
                      </div>
                      <div className="establishment-card-meta">Select to book</div>
                    </button>
                  </li>
                ))}
              </ul>
              {hasMore && (
                <button
                  type="button"
                  className="establishments-load-more"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              )}
              {selectedEstablishment && (
                <button type="button" className="appointments-back-btn" onClick={handleClearSelection}>
                  Show all
                </button>
              )}
            </>
          )}
        </div>

        <div className="appointments-right-wrap">
          {!selectedEstablishment ? (
            upcomingWidget
          ) : (
            <>
              <div className="appointments-right-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={rightTab === 'upcoming'}
                  className={`appointments-right-tab ${rightTab === 'upcoming' ? 'appointments-right-tab--active' : ''}`}
                  onClick={() => setRightTab('upcoming')}
                >
                  Upcoming appointments
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={rightTab === 'book'}
                  className={`appointments-right-tab ${rightTab === 'book' ? 'appointments-right-tab--active' : ''}`}
                  onClick={() => setRightTab('book')}
                >
                  Book appointment
                </button>
              </div>
              <div className="appointments-right-content">
                {rightTab === 'upcoming' ? (
                  upcomingWidget
                ) : (
                  <div className="appointments-form-wrap">
                    <h2 className="appointments-form-title">Book appointment – {selectedEstablishment.name}</h2>
                    <form className="booking-form" onSubmit={handleFormSubmit}>
              <fieldset className="booking-form-section">
                <legend className="booking-form-legend">Information about the person being tested</legend>
                <label className="booking-form-label">
                  First name
                  <input
                    type="text"
                    className="booking-form-input"
                    value={form.firstName}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                  />
                </label>
                <label className="booking-form-label">
                  Last name
                  <input
                    type="text"
                    className="booking-form-input"
                    value={form.lastName}
                    onChange={(e) => updateForm('lastName', e.target.value)}
                  />
                </label>
                <label className="booking-form-label">
                  Date of birth (MM/DD/YYYY)
                  <input
                    type="text"
                    className="booking-form-input"
                    placeholder="MM/DD/YYYY"
                    value={form.dateOfBirth}
                    onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                  />
                </label>
                <div className="booking-form-label">
                  Sex
                  <div className="booking-form-radio-group">
                    <label className="booking-form-radio">
                      <input
                        type="radio"
                        name="sex"
                        value="Male"
                        checked={form.sex === 'Male'}
                        onChange={(e) => updateForm('sex', e.target.value)}
                      />
                      Male
                    </label>
                    <label className="booking-form-radio">
                      <input
                        type="radio"
                        name="sex"
                        value="Female"
                        checked={form.sex === 'Female'}
                        onChange={(e) => updateForm('sex', e.target.value)}
                      />
                      Female
                    </label>
                  </div>
                </div>
                <label className="booking-form-label">
                  Gender identity
                  <input
                    type="text"
                    className="booking-form-input"
                    value={form.genderIdentity}
                    onChange={(e) => updateForm('genderIdentity', e.target.value)}
                  />
                </label>
              </fieldset>

              <fieldset className="booking-form-section">
                <legend className="booking-form-legend">Address</legend>
                <label className="booking-form-label">
                  Address
                  <input
                    type="text"
                    className="booking-form-input"
                    value={form.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                  />
                </label>
                <label className="booking-form-label">
                  Apt/Suite
                  <input
                    type="text"
                    className="booking-form-input"
                    value={form.aptSuite}
                    onChange={(e) => updateForm('aptSuite', e.target.value)}
                  />
                </label>
                <label className="booking-form-label">
                  City
                  <input
                    type="text"
                    className="booking-form-input"
                    value={form.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                  />
                </label>
                <label className="booking-form-label">
                  State
                  <input
                    type="text"
                    className="booking-form-input"
                    value={form.state}
                    onChange={(e) => updateForm('state', e.target.value)}
                  />
                </label>
                <label className="booking-form-label">
                  Zip code
                  <input
                    type="text"
                    className="booking-form-input"
                    value={form.zipCode}
                    onChange={(e) => updateForm('zipCode', e.target.value)}
                  />
                </label>
              </fieldset>

              <fieldset className="booking-form-section">
                <legend className="booking-form-legend">Contact information</legend>
                <p className="booking-form-disclaimer">
                  Our emails and texts contain limited personal information; please keep in mind that such
                  communications cannot be guaranteed 100% secure. <a href="#learn-more">Learn more</a>.
                </p>
                <label className="booking-form-label">
                  Email
                  <input
                    type="email"
                    className="booking-form-input"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                  />
                </label>
                <label className="booking-form-label">
                  Phone number
                  <input
                    type="tel"
                    className="booking-form-input"
                    placeholder="555-555-5555"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                  />
                </label>
                <div className="booking-form-label">
                  Is this a mobile phone?
                  <div className="booking-form-radio-group">
                    <label className="booking-form-radio">
                      <input
                        type="radio"
                        name="isMobilePhone"
                        value="Yes"
                        checked={form.isMobilePhone === 'Yes'}
                        onChange={(e) => updateForm('isMobilePhone', e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="booking-form-radio">
                      <input
                        type="radio"
                        name="isMobilePhone"
                        value="No"
                        checked={form.isMobilePhone === 'No'}
                        onChange={(e) => updateForm('isMobilePhone', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>
              </fieldset>

              <fieldset className="booking-form-section">
                <legend className="booking-form-legend">Appointment</legend>
                <label className="booking-form-label">
                  Date and time (required)
                  <input
                    type="datetime-local"
                    className="booking-form-input"
                    value={form.scheduledFor}
                    onChange={(e) => updateForm('scheduledFor', e.target.value)}
                    required
                  />
                </label>
                <label className="booking-form-label">
                  Reason for visit (required)
                  <input
                    type="text"
                    className="booking-form-input"
                    placeholder="e.g. Lab work, checkup"
                    value={form.reason}
                    onChange={(e) => updateForm('reason', e.target.value)}
                    required
                  />
                </label>
              </fieldset>

              {saveError && <p className="booking-form-error">{saveError}</p>}
              <div className="booking-form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Booking…' : 'Book appointment'}
                </button>
              </div>
            </form>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
