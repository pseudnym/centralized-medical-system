import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecords, CATEGORIES } from '../api/records'

const VIEW_FIELDS = [
  'id',
  'title',
  'patient_id',
  'appointment_id',
  'code',
  'category',
  'value_numeric',
  'value_text',
  'unit',
  'reference_low',
  'reference_high',
  'occurrence_datetime',
  'created_at',
  'updated_at',
]

function fieldLabel(field) {
  return field.replace(/_/g, ' ')
}

function formatValue(record, field) {
  const v = record[field]
  if (v == null || v === '') return '—'
  if (field === 'created_at' || field === 'updated_at' || field === 'occurrence_datetime') {
    try {
      return new Date(v).toLocaleString()
    } catch {
      return String(v)
    }
  }
  return String(v)
}

function RecordViewModal({ record, onClose }) {
  const panelRef = useRef(null)

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
        <table className="record-view-table">
          <tbody>
            {VIEW_FIELDS.map((field) => (
              <tr key={field}>
                <th className="record-view-th">{fieldLabel(field)}</th>
                <td className="record-view-td">{formatValue(record, field)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
  const menuCloseRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getRecords({ category: categoryFilter || undefined })
      .then(setRecords)
      .finally(() => setLoading(false))
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
