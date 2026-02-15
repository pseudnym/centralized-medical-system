import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecords, deleteRecord, CATEGORIES } from '../api/records'

const OBSERVATION_COLUMNS = [
  'code',
  'category',
  'value_numeric',
  'value_text',
  'unit',
  'reference_low',
  'reference_high',
  'occurrence_datetime',
]

function fieldLabel(field) {
  return field.replace(/_/g, ' ')
}

function formatCellValue(value, field) {
  if (value == null || value === '') return '—'
  if (field === 'occurrence_datetime') {
    try {
      return new Date(value).toLocaleString()
    } catch {
      return String(value)
    }
  }
  return String(value)
}

/** Build rows for the entries table: use _observations when present, else one row from record. */
function getViewRows(record) {
  if (!record) return []
  const obs = record._observations
  if (obs?.length > 0) return obs
  return [
    {
      code: record.code,
      category: record.category,
      value_numeric: record.value_numeric,
      value_text: record.value_text,
      unit: record.unit,
      reference_low: record.reference_low,
      reference_high: record.reference_high,
      occurrence_datetime: record.occurrence_datetime,
    },
  ]
}

function RecordViewModal({ record, onClose }) {
  const panelRef = useRef(null)
  const rows = record ? getViewRows(record) : []

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!record) return null

  return (
    <div
      className="record-view-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-view-title"
    >
      <div
        className="record-view-modal"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="record-view-title" className="record-view-title">
          Medical Record
        </h2>
        <div className="record-view-meta">
          <span>Record ID: {record.id}</span>
          {record.patient_id != null && <span>Patient: {record.patient_id}</span>}
          {record.appointment_id != null && <span>Appointment: {record.appointment_id}</span>}
          {record.created_at && (
            <span>Created: {new Date(record.created_at).toLocaleString()}</span>
          )}
          {record.updated_at && (
            <span>Updated: {new Date(record.updated_at).toLocaleString()}</span>
          )}
        </div>
        <div className="record-view-entries-wrap">
          <table className="record-view-entries-table">
            <thead>
              <tr>
                {OBSERVATION_COLUMNS.map((col) => (
                  <th key={col} className="record-view-entries-th">
                    {fieldLabel(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id ?? i} className="record-view-entries-tr">
                  {OBSERVATION_COLUMNS.map((col) => (
                    <td key={col} className="record-view-entries-td">
                      {formatCellValue(row[col], col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {record._attachments?.length > 0 && (
          <div className="record-view-attachments">
            <strong>Attachments:</strong>{' '}
            {record._attachments.map((a, i) => a.name).join(', ')}
          </div>
        )}
        <button type="button" className="btn btn-secondary record-view-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default function Records() {
  const [records, setRecords] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewRecordId, setViewRecordId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const menuCloseRef = useRef(null)
  const navigate = useNavigate()

  function refreshList() {
    setLoading(true)
    getRecords({ category: categoryFilter || undefined })
      .then(setRecords)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshList()
  }, [categoryFilter])

  useEffect(() => {
    function handleClickOutside(e) {
      if (openMenuId != null && menuCloseRef.current && !menuCloseRef.current.contains(e.target)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openMenuId])

  const viewRecord = viewRecordId != null ? records.find((r) => r.id === viewRecordId) : null

  return (
    <section className="records-page page-placeholder">
      <div className="records-header">
        <h1 className="section-title">Records</h1>
        <button
          type="button"
          className="btn btn-primary records-add-btn"
          onClick={() => navigate('/records/new')}
        >
          Add Medical Record
        </button>
      </div>

      <div className="records-toolbar">
        <label htmlFor="records-filter" className="records-filter-label">
          Filter by type
        </label>
        <select
          id="records-filter"
          className="records-filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="records-loading">Loading records…</p>
      ) : records.length === 0 ? (
        <div className="card records-empty">
          <p>No records yet. Add one with the button above.</p>
        </div>
      ) : (
        <ul className="records-list">
          {records.map((rec) => (
            <li
              key={rec.id}
              className="card record-card"
              onClick={() => setViewRecordId(rec.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setViewRecordId(rec.id)
                }
              }}
            >
              <div className="record-card-main">
                <span className="record-card-title">{rec.title || rec.category || rec.code || 'Untitled'}</span>
                <span className="record-date">
                  {rec.occurrence_datetime || rec.created_at
                    ? new Date(rec.occurrence_datetime || rec.created_at).toLocaleDateString()
                    : '—'}
                </span>
              </div>
              {rec.value_text && (
                <p className="record-summary">{rec.value_text}</p>
              )}
              <div
                className="record-card-actions"
                ref={openMenuId === rec.id ? menuCloseRef : null}
              >
                <button
                  type="button"
                  className="record-card-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuId((prev) => (prev === rec.id ? null : rec.id))
                  }}
                  aria-label="Options"
                  aria-expanded={openMenuId === rec.id}
                  aria-haspopup="true"
                >
                  ⋮
                </button>
                {openMenuId === rec.id && (
                  <ul className="record-card-dropdown" onClick={(e) => e.stopPropagation()}>
                    <li>
                      <button
                        type="button"
                        className="record-card-dropdown-item"
                        onClick={() => {
                          setViewRecordId(rec.id)
                          setOpenMenuId(null)
                        }}
                      >
                        View
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="record-card-dropdown-item"
                        onClick={() => {
                          navigate(`/records/${rec.id}/edit`)
                          setOpenMenuId(null)
                        }}
                      >
                        Edit
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="record-card-dropdown-item"
                        disabled={deletingId === rec.id}
                        onClick={async () => {
                          setDeletingId(rec.id)
                          const { ok, error } = await deleteRecord(rec.id)
                          setDeletingId(null)
                          setOpenMenuId(null)
                          if (ok) {
                            if (viewRecordId === rec.id) setViewRecordId(null)
                            refreshList()
                            window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Record removed.' } }))
                          } else if (error?.message) {
                            window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: error.message } }))
                          }
                        }}
                      >
                        {deletingId === rec.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {viewRecord && (
        <RecordViewModal record={viewRecord} onClose={() => setViewRecordId(null)} />
      )}
    </section>
  )
}
