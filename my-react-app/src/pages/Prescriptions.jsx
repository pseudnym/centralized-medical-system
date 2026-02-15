import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPrescriptions, deletePrescription } from '../api/prescriptions'

const VIEW_FIELDS = [
  'name',
  'instructions',
  'medical_provider_id',
  'start_date',
  'end_date',
  'quantity',
  'dosage_strength',
  'frequency',
  'refills',
  'status',
]

function fieldLabel(field) {
  return field.replace(/_/g, ' ')
}

function formatValue(prescription, field) {
  const v = prescription[field]
  if (v == null || v === '') return '—'
  if (field === 'start_date' || field === 'end_date') {
    try {
      return new Date(v).toLocaleDateString()
    } catch {
      return String(v)
    }
  }
  return String(v)
}

/** Parchment / prescription document icon. */
function ParchmentIcon({ className, size = 48 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Parchment: rounded rectangle like a scroll/document */}
      <rect x="5" y="4" width="14" height="16" rx="2" ry="2" />
      {/* Lines suggesting written text */}
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="14" x2="13" y2="14" />
    </svg>
  )
}

function PrescriptionViewModal({ prescription, onClose, onEdit, onDeleted }) {
  const panelRef = useRef(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleDelete() {
    if (!prescription?.id || deleting) return
    setDeleteError('')
    setDeleting(true)
    const { ok, error } = await deletePrescription(prescription.id)
    setDeleting(false)
    if (error) {
      setDeleteError(error.message || 'Failed to delete')
      return
    }
    if (ok && onDeleted) {
      onDeleted()
    }
  }

  if (!prescription) return null

  return (
    <div
      className="prescription-view-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prescription-view-title"
    >
      <div
        className="prescription-view-modal"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="prescription-view-title" className="prescription-view-title">
          Prescription
        </h2>
        {deleteError && (
          <div className="auth-error" role="alert" style={{ marginBottom: '0.75rem' }}>
            {deleteError}
          </div>
        )}
        <table className="prescription-view-table">
          <tbody>
            {VIEW_FIELDS.map((field) => (
              <tr key={field}>
                <th className="prescription-view-th">{fieldLabel(field)}</th>
                <td className="prescription-view-td">{formatValue(prescription, field)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="prescription-view-actions">
          {onEdit && (
            <button type="button" className="btn btn-primary" onClick={() => onEdit(prescription.id)}>
              Edit
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete prescription"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
          <button type="button" className="btn btn-secondary prescription-view-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewPrescriptionId, setViewPrescriptionId] = useState(null)
  const navigate = useNavigate()

  function refreshList() {
    setLoading(true)
    getPrescriptions()
      .then(setPrescriptions)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshList()
  }, [])

  const viewPrescription =
    viewPrescriptionId != null ? prescriptions.find((p) => p.id === viewPrescriptionId) : null

  return (
    <section className="prescriptions-page page-placeholder">
      <div className="prescriptions-header">
        <h1 className="section-title">Prescriptions</h1>
        <button
          type="button"
          className="btn btn-primary prescriptions-add-btn"
          onClick={() => navigate('/prescriptions/new')}
        >
          Add Prescription
        </button>
      </div>

      {loading ? (
        <p className="prescriptions-loading">Loading prescriptions…</p>
      ) : prescriptions.length === 0 ? (
        <div className="card prescriptions-empty">
          <p>No prescriptions yet. Add one with the button above.</p>
        </div>
      ) : (
        <ul className="prescriptions-list">
          {[...prescriptions]
            .sort((a, b) => {
              const aInactive = String(a.status || 'Active').toLowerCase() === 'inactive'
              const bInactive = String(b.status || 'Active').toLowerCase() === 'inactive'
              if (aInactive && !bInactive) return 1
              if (!aInactive && bInactive) return -1
              return 0
            })
            .map((p) => (
            <li
              key={p.id}
              className="med-card card"
              onClick={() => setViewPrescriptionId(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setViewPrescriptionId(p.id)
                }
              }}
            >
              <div className="med-card-label">
                <span className="med-card-establishment" title={p.medical_provider_id ? `Provider ${p.medical_provider_id}` : undefined}>
                  {p.medical_provider_id != null && String(p.medical_provider_id).trim() !== ''
                    ? `Provider: ${p.medical_provider_id}`
                    : '—'}
                </span>
              </div>
              <div className="med-card-body">
                <ParchmentIcon className="med-card-pill-icon" size={48} />
                <span
                  className={`med-card-status ${String(p.status || 'Active').toLowerCase() === 'inactive' ? 'med-card-status--inactive' : ''}`}
                >
                  <span className="med-card-status-bullet" aria-hidden>•</span>
                  {' '}{p.status || 'Active'}
                </span>
                <h3 className="med-card-name">{p.name || 'Unnamed prescription'}</h3>
                <p className="med-card-instructions">
                  {p.instructions || 'Insert small Instructions blurb here'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {viewPrescription && (
        <PrescriptionViewModal
          prescription={viewPrescription}
          onClose={() => setViewPrescriptionId(null)}
          onEdit={(id) => {
            setViewPrescriptionId(null)
            navigate(`/prescriptions/${id}/edit`)
          }}
          onDeleted={() => {
            setViewPrescriptionId(null)
            refreshList()
            window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Prescription removed.' } }))
          }}
        />
      )}
    </section>
  )
}
