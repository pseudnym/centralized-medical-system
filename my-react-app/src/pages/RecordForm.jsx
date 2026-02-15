import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createRecords, getRecord, updateRecord } from '../api/records'

const ROW_FIELDS = [
  'appointment_id',
  'code',
  'category',
  'value_numeric',
  'value_text',
  'unit',
  'reference_low',
  'reference_high',
  'occurrence_datetime',
]

const CATEGORY_OPTIONS = ['', 'Physical', 'Lab Report', 'Imaging']

const RECORD_TEMPLATES = [
  { label: 'Sports Physical', category: 'Physical' },
  { label: 'Lab Report', category: 'Lab Report' },
  { label: 'Imaging', category: 'Imaging' },
]

function emptyRow() {
  return {
    patient_id: '',
    appointment_id: '',
    code: '',
    category: '',
    value_numeric: '',
    value_text: '',
    unit: '',
    reference_low: '',
    reference_high: '',
    occurrence_datetime: '',
  }
}

function recordToRow(record) {
  if (!record) return emptyRow()
  return {
    patient_id: record.patient_id ?? '',
    appointment_id: record.appointment_id ?? '',
    code: record.code ?? '',
    category: record.category ?? '',
    value_numeric: record.value_numeric ?? '',
    value_text: record.value_text ?? '',
    unit: record.unit ?? '',
    reference_low: record.reference_low ?? '',
    reference_high: record.reference_high ?? '',
    occurrence_datetime: record.occurrence_datetime ? record.occurrence_datetime.slice(0, 16) : '',
  }
}

function parseRow(row) {
  return {
    patient_id: row.patient_id ? Number(row.patient_id) : null,
    appointment_id: row.appointment_id ? Number(row.appointment_id) : null,
    code: String(row.code ?? ''),
    category: String(row.category ?? ''),
    value_numeric: row.value_numeric !== '' ? Number(row.value_numeric) : null,
    value_text: String(row.value_text ?? ''),
    unit: String(row.unit ?? ''),
    reference_low: row.reference_low !== '' ? Number(row.reference_low) : null,
    reference_high: row.reference_high !== '' ? Number(row.reference_high) : null,
    occurrence_datetime: String(row.occurrence_datetime ?? ''),
  }
}

export default function RecordForm() {
  const { id } = useParams()
  const isEdit = id != null && id !== ''
  const [title, setTitle] = useState('')
  const [rows, setRows] = useState([emptyRow()])
  const [medicalProviderId, setMedicalProviderId] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [templateSearch, setTemplateSearch] = useState('')
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [notFound, setNotFound] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [existingAttachmentNames, setExistingAttachmentNames] = useState([])
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(null) // { rowIndex, top, left } when open
  const fileInputRef = useRef(null)
  const didDragRef = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    setNotFound(false)
    getRecord(id)
      .then((record) => {
        if (!record) {
          setNotFound(true)
          return
        }
        setTitle(record.title ?? '')
        setMedicalProviderId(record.medical_provider_id != null ? String(record.medical_provider_id) : '')
        if (record._observations?.length) {
          setRows(
            record._observations.map((o) => ({
              patient_id: record.patient_id ?? '',
              appointment_id: record.appointment_id ?? '',
              code: o.code ?? '',
              category: o.category ?? '',
              value_numeric: o.value_numeric ?? '',
              value_text: o.value_text ?? '',
              unit: o.unit ?? '',
              reference_low: o.reference_low ?? '',
              reference_high: o.reference_high ?? '',
              occurrence_datetime: o.occurrence_datetime ? String(o.occurrence_datetime).slice(0, 16) : '',
            }))
          )
        } else {
          setRows([recordToRow(record)])
        }
        setExistingAttachmentNames((record._attachments || []).map((a) => a.name))
      })
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function addRowBelow(index) {
    setRows((prev) => [
      ...prev.slice(0, index + 1),
      emptyRow(),
      ...prev.slice(index + 1),
    ])
  }

  function updateRow(index, field, value) {
    setRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function moveRow(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= rows.length) return
    setRows((prev) => {
      const next = [...prev]
      const [removed] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, removed)
      return next
    })
    setDraggedIndex(null)
  }

  function deleteRow(index) {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((_, i) => i !== index))
    setDeleteMenuOpen(null)
  }

  function handleDragStart(e, index) {
    didDragRef.current = true
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e, toIndex) {
    e.preventDefault()
    const fromIndex = Number(e.dataTransfer.getData('text/plain'))
    if (Number.isNaN(fromIndex)) return
    moveRow(fromIndex, toIndex)
  }

  function handleDragEnd() {
    setDraggedIndex(null)
    setTimeout(() => { didDragRef.current = false }, 0)
  }

  useEffect(() => {
    if (deleteMenuOpen == null) return
    function handleClickOutside(e) {
      const target = e.target
      if (target.closest('.record-form-row-delete-menu') != null) return
      if (target.closest('.record-form-drag-handle') != null) return
      setDeleteMenuOpen(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [deleteMenuOpen])

  function onFileSelect(files) {
    if (!files?.length) return
    setAttachedFiles((prev) => [
      ...prev,
      ...Array.from(files).map((file) => ({ name: file.name, file })),
    ])
  }

  function removeFile(index) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function applyTemplate(template) {
    updateRow(0, 'category', template.category)
    if (!title.trim()) setTitle(template.label)
  }

  function handleSave() {
    setSaveError('')
    if (isEdit) {
      setSaving(true)
      updateRecord(id, { ...parseRow(rows[0]), title, medical_provider_id: medicalProviderId || null }, attachedFiles, rows.map(parseRow))
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
          navigate('/records')
        })
        .finally(() => setSaving(false))
      return
    }
    const payload = rows.map(parseRow).filter((r) => r.code || r.category || r.value_text)
    if (payload.length === 0) {
      payload.push(parseRow(rows[0]))
    }
    setSaving(true)
    createRecords(payload, attachedFiles, title)
      .then(({ data, error }) => {
        if (error) {
          setSaveError(error.message || 'Failed to save')
          return
        }
        if (data?.length !== undefined) {
          window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Successful!' } }))
          navigate('/records')
        }
      })
      .finally(() => setSaving(false))
  }

  if (notFound) {
    return (
      <section className="record-form-page page-placeholder">
        <h1 className="section-title">Record not found</h1>
        <p>The record may have been removed or the link is invalid.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/records')}>
          Back to Records
        </button>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="record-form-page page-placeholder">
        <p className="records-loading">Loading record…</p>
      </section>
    )
  }

  const filteredTemplates = RECORD_TEMPLATES.filter((t) =>
    t.label.toLowerCase().includes(templateSearch.toLowerCase())
  )

  return (
    <section className="record-form-page page-placeholder">
      {deleteMenuOpen != null && (
        <div
          className="record-form-row-delete-menu"
          style={{
            position: 'fixed',
            top: deleteMenuOpen.top,
            left: deleteMenuOpen.left,
            transform: 'translateX(-50%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="record-form-row-delete-btn"
            onClick={() => deleteRow(deleteMenuOpen.rowIndex)}
            disabled={rows.length <= 1}
          >
            Delete row
          </button>
        </div>
      )}
      <div className="record-form-header">
        <h1 className="section-title">{isEdit ? 'Edit Medical Record' : 'Add Medical Record'}</h1>
        <div className="record-form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/records')}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
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

      <div className="record-form-layout">
        <div className="record-form-main">
          <div className="record-form-table-wrap card">
            <table className="record-form-table">
          <thead>
            <tr>
              <th className="record-form-th-actions" aria-label="Actions" />
              {ROW_FIELDS.map((field) => (
                <th key={field} className="record-form-th">
                  {field.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={`record-form-tr ${draggedIndex === index ? 'record-form-tr-dragging' : ''}`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                <td className="record-form-td-actions">
                  <div className="record-form-td-actions-inner">
                    <span className="record-form-drag-handle-wrap">
                      <span
                        className="record-form-drag-handle"
                        aria-hidden
                        title="Drag to reorder or click for options"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (didDragRef.current) {
                            didDragRef.current = false
                            return
                          }
                          if (deleteMenuOpen?.rowIndex === index) {
                            setDeleteMenuOpen(null)
                            return
                          }
                          const rect = e.currentTarget.getBoundingClientRect()
                          setDeleteMenuOpen({
                            rowIndex: index,
                            top: rect.bottom + 6,
                            left: rect.left + rect.width / 2,
                          })
                        }}
                      >
                        ⋮⋮
                      </span>
                    </span>
                    <button
                      type="button"
                      className="record-form-btn-add"
                      onClick={() => addRowBelow(index)}
                      aria-label="Add row below"
                      title="Add row below"
                    >
                      +
                    </button>
                  </div>
                </td>
                {ROW_FIELDS.map((field) => (
                  <td key={field} className="record-form-td">
                    {field === 'category' ? (
                      <select
                        value={row[field]}
                        onChange={(e) => updateRow(index, field, e.target.value)}
                        className="record-form-input"
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt || 'blank'} value={opt}>
                            {opt || '—'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.includes('numeric') || field.includes('_id') ? 'number' : field === 'occurrence_datetime' ? 'datetime-local' : 'text'}
                        value={row[field]}
                        onChange={(e) => updateRow(index, field, e.target.value)}
                        className="record-form-input"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </div>

        <aside className="record-form-sidebar card">
          <div className="record-form-sidebar-section">
            <label htmlFor="record-form-title" className="record-form-sidebar-label">
              Title
            </label>
            <input
              id="record-form-title"
              type="text"
              className="record-form-sidebar-input"
              placeholder="Record name for list"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="record-form-sidebar-section">
            <h3 className="record-form-sidebar-heading">Entity Type</h3>
            <p className="record-form-sidebar-sub">Select from List</p>
            <select
              value={rows[0]?.category ?? ''}
              onChange={(e) => updateRow(0, 'category', e.target.value)}
              className="record-form-sidebar-input record-form-sidebar-select"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt || 'blank'} value={opt}>
                  {opt || '—'}
                </option>
              ))}
            </select>
          </div>

          <div className="record-form-sidebar-section">
            <h3 className="record-form-sidebar-heading">Record Templates</h3>
            <input
              type="search"
              className="record-form-sidebar-input"
              placeholder="Search..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              aria-label="Search templates"
            />
            <div className="record-form-templates">
              {filteredTemplates.map((t) => (
                <button
                  key={t.category}
                  type="button"
                  className="record-form-template-btn"
                  onClick={() => applyTemplate(t)}
                >
                  + {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="record-form-sidebar-section record-form-files">
            <h3 className="record-form-sidebar-heading">Attached Files</h3>
            <div
              className="record-form-dropzone"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('record-form-dropzone-active') }}
              onDragLeave={(e) => e.currentTarget.classList.remove('record-form-dropzone-active')}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('record-form-dropzone-active')
                onFileSelect(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="record-form-file-input"
                onChange={(e) => { onFileSelect(e.target.files); e.target.value = '' }}
              />
              <span className="record-form-dropzone-icon" aria-hidden>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </span>
              <span className="record-form-dropzone-text">Drag and drop or click to select files</span>
            </div>
            {(existingAttachmentNames.length > 0 || attachedFiles.length > 0) && (
              <ul className="record-form-file-list">
                {existingAttachmentNames.map((name, i) => (
                  <li key={`existing-${i}`} className="record-form-file-item record-form-file-item-existing">
                    <span>{name}</span>
                    <span className="record-form-file-badge">existing</span>
                  </li>
                ))}
                {attachedFiles.map((f, i) => (
                  <li key={i} className="record-form-file-item">
                    <span>{f.name}</span>
                    <button
                      type="button"
                      className="record-form-file-remove"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${f.name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
