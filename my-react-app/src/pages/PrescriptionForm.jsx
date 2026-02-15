import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPrescription, createPrescription, updatePrescription } from '../api/prescriptions'

const STATUS_OPTIONS = ['Active', 'Inactive']

export default function PrescriptionForm() {
  const { id } = useParams()
  const isEdit = id != null && id !== ''
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [instructions, setInstructions] = useState('')
  const [medicalProviderId, setMedicalProviderId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quantity, setQuantity] = useState('')
  const [dosageStrength, setDosageStrength] = useState('')
  const [frequency, setFrequency] = useState('')
  const [refills, setRefills] = useState('')
  const [status, setStatus] = useState('Active')

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    setNotFound(false)
    getPrescription(id)
      .then((p) => {
        if (!p) {
          setNotFound(true)
          return
        }
        setName(p.name ?? '')
        setInstructions(p.instructions ?? '')
        setMedicalProviderId(p.medical_provider_id ?? '')
        setStartDate(p.start_date ? p.start_date.slice(0, 10) : '')
        setEndDate(p.end_date ? p.end_date.slice(0, 10) : '')
        setQuantity(p.quantity != null ? String(p.quantity) : '')
        setDosageStrength(p.dosage_strength ?? '')
        setFrequency(p.frequency ?? '')
        setRefills(p.refills != null ? String(p.refills) : '')
        setStatus(p.status ?? 'Active')
      })
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) return

    setSaveError('')
    const payload = {
      name: trimmedName,
      instructions: instructions.trim(),
      medical_provider_id: medicalProviderId.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
      quantity: quantity === '' ? null : quantity,
      dosage_strength: dosageStrength.trim(),
      frequency: frequency.trim(),
      refills: refills === '' ? null : refills,
      status,
    }

    setSaving(true)
    if (isEdit) {
      updatePrescription(id, payload)
        .then(({ data: updated, error }) => {
          if (error) {
            setSaveError(error.message || 'Failed to save')
            return
          }
          if (updated == null) {
            setNotFound(true)
            return
          }
          window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Successful!' } }))
          navigate('/prescriptions')
        })
        .finally(() => setSaving(false))
    } else {
      createPrescription(payload)
        .then(({ data, error }) => {
          if (error) {
            setSaveError(error.message || 'Failed to save')
            return
          }
          if (data) {
            window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Successful!' } }))
            navigate('/prescriptions')
          }
        })
        .finally(() => setSaving(false))
    }
  }

  if (notFound) {
    return (
      <section className="prescription-form-page page-placeholder">
        <h1 className="section-title">Prescription not found</h1>
        <p>The prescription may have been removed or the link is invalid.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/prescriptions')}>
          Back to Prescriptions
        </button>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="prescription-form-page page-placeholder">
        <p className="prescriptions-loading">Loading prescription…</p>
      </section>
    )
  }

  return (
    <section className="prescription-form-page page-placeholder">
      <div className="prescription-form-header">
        <h1 className="section-title">{isEdit ? 'Edit Prescription' : 'Add Prescription'}</h1>
        <div className="prescription-form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/prescriptions')}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? (isEdit ? 'Updating…' : 'Saving…') : isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="auth-error" role="alert" style={{ marginBottom: '1rem' }}>
          {saveError}
        </div>
      )}

      <div className="prescription-form-layout card">
        <div className="prescription-form-grid">
          <div className="prescription-form-field prescription-form-field-full">
            <label htmlFor="prescription-name" className="prescription-form-label">
              Prescription name *
            </label>
            <input
              id="prescription-name"
              type="text"
              className="prescription-form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Medication name"
            />
          </div>

          <div className="prescription-form-field prescription-form-field-full">
            <label htmlFor="prescription-instructions" className="prescription-form-label">
              Instructions
            </label>
            <textarea
              id="prescription-instructions"
              className="prescription-form-input prescription-form-textarea"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Dosing and usage instructions"
              rows={3}
            />
          </div>

          <div className="prescription-form-field">
            <label htmlFor="prescription-provider-id" className="prescription-form-label">
              Medical provider ID
            </label>
            <input
              id="prescription-provider-id"
              type="number"
              min="0"
              className="prescription-form-input"
              value={medicalProviderId}
              onChange={(e) => setMedicalProviderId(e.target.value)}
              placeholder="Provider ID"
            />
          </div>

          <div className="prescription-form-field">
            <label htmlFor="prescription-status" className="prescription-form-label">
              Status
            </label>
            <select
              id="prescription-status"
              className="prescription-form-input prescription-form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="prescription-form-field">
            <label htmlFor="prescription-start-date" className="prescription-form-label">
              Prescription start date
            </label>
            <input
              id="prescription-start-date"
              type="date"
              className="prescription-form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="prescription-form-field">
            <label htmlFor="prescription-end-date" className="prescription-form-label">
              Prescription end date
            </label>
            <input
              id="prescription-end-date"
              type="date"
              className="prescription-form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="prescription-form-field">
            <label htmlFor="prescription-quantity" className="prescription-form-label">
              Quantity
            </label>
            <input
              id="prescription-quantity"
              type="number"
              min="0"
              className="prescription-form-input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="prescription-form-field">
            <label htmlFor="prescription-dosage" className="prescription-form-label">
              Dosage strength
            </label>
            <input
              id="prescription-dosage"
              type="number"
              min="0"
              className="prescription-form-input"
              value={dosageStrength}
              onChange={(e) => setDosageStrength(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="prescription-form-field">
            <label htmlFor="prescription-frequency" className="prescription-form-label">
              Frequency
            </label>
            <input
              id="prescription-frequency"
              type="number"
              min="0"
              className="prescription-form-input"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="prescription-form-field">
            <label htmlFor="prescription-refills" className="prescription-form-label">
              Refills
            </label>
            <input
              id="prescription-refills"
              type="number"
              min="0"
              className="prescription-form-input"
              value={refills}
              onChange={(e) => setRefills(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
