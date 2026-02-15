/**
 * Records API — backend-ready layer.
 * Swap the mock implementation for fetch() when the backend is available.
 */

const STORAGE_KEY = 'medical_records'
const CATEGORIES = ['Physical', 'Lab Report', 'Imaging']

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (_) {}
}

function nextId(records) {
  const max = records.reduce((m, r) => (r.id > m ? r.id : m), 0)
  return max + 1
}

function now() {
  return new Date().toISOString()
}

/**
 * @param {number} id
 * @returns {Promise<Record | null>}
 */
export function getRecord(id) {
  return Promise.resolve().then(() => {
    const records = loadFromStorage()
    return records.find((r) => r.id === Number(id)) ?? null
  })
}

/**
 * @param {number} id
 * @returns {Promise<boolean>} true if deleted, false if not found
 */
export function deleteRecord(id) {
  return Promise.resolve().then(() => {
    const records = loadFromStorage()
    const index = records.findIndex((r) => r.id === Number(id))
    if (index === -1) return false
    records.splice(index, 1)
    saveToStorage(records)
    return true
  })
}

/**
 * @param {{ category?: string }} [opts]
 * @returns {Promise<Array<Record>>} Records sorted newest first
 */
export function getRecords(opts = {}) {
  return Promise.resolve().then(() => {
    const records = loadFromStorage()
    let list = [...records]
    if (opts.category) {
      list = list.filter((r) => r.category === opts.category)
    }
    list.sort((a, b) => {
      const da = a.occurrence_datetime || a.created_at || ''
      const db = b.occurrence_datetime || b.created_at || ''
      return db.localeCompare(da)
    })
    return list
  })
}

/**
 * @param {Partial<Record>} record
 * @param {Array<{ name: string, file: File }>} [attachedFiles]
 * @returns {Promise<Record>} Created record with id, created_at, updated_at
 */
export function createRecord(record, attachedFiles = []) {
  return Promise.resolve().then(() => {
    const records = loadFromStorage()
    const id = nextId(records)
    const created_at = now()
    const updated_at = now()
    const created = {
      id,
      title: record.title ?? '',
      patient_id: record.patient_id ?? null,
      appointment_id: record.appointment_id ?? null,
      code: record.code ?? '',
      category: record.category ?? '',
      value_numeric: record.value_numeric ?? null,
      value_text: record.value_text ?? '',
      unit: record.unit ?? '',
      reference_low: record.reference_low ?? null,
      reference_high: record.reference_high ?? null,
      occurrence_datetime: record.occurrence_datetime ?? '',
      created_at,
      updated_at,
      _attachments: attachedFiles.map((f) => ({ name: f.name })),
    }
    records.push(created)
    saveToStorage(records)
    return created
  })
}

/**
 * @param {number} id
 * @param {Partial<Record>} record
 * @param {Array<{ name: string, file: File }>} [attachedFiles]
 * @returns {Promise<Record | null>} Updated record or null if not found
 */
export function updateRecord(id, record, attachedFiles = []) {
  return Promise.resolve().then(() => {
    const records = loadFromStorage()
    const index = records.findIndex((r) => r.id === Number(id))
    if (index === -1) return null
    const existing = records[index]
    const updated_at = now()
    const updated = {
      ...existing,
      title: record.title ?? existing.title,
      patient_id: record.patient_id ?? existing.patient_id,
      appointment_id: record.appointment_id ?? existing.appointment_id,
      code: record.code ?? existing.code,
      category: record.category ?? existing.category,
      value_numeric: record.value_numeric ?? existing.value_numeric,
      value_text: record.value_text ?? existing.value_text,
      unit: record.unit ?? existing.unit,
      reference_low: record.reference_low ?? existing.reference_low,
      reference_high: record.reference_high ?? existing.reference_high,
      occurrence_datetime: record.occurrence_datetime ?? existing.occurrence_datetime,
      updated_at,
      _attachments: attachedFiles.length
        ? [...(existing._attachments || []), ...attachedFiles.map((f) => ({ name: f.name }))]
        : existing._attachments || [],
    }
    records[index] = updated
    saveToStorage(records)
    return updated
  })
}

/**
 * Create multiple records (one per row). Attachments and title apply to the first record only.
 * @param {Array<Partial<Record>>} rows
 * @param {Array<{ name: string, file: File }>} [attachedFiles]
 * @param {string} [title] Optional title for the first record (displayed in list).
 * @returns {Promise<Array<Record>>}
 */
export function createRecords(rows, attachedFiles = [], title = '') {
  return Promise.resolve().then(() => {
    const records = loadFromStorage()
    const created = []
    const created_at = now()
    const updated_at = now()
    rows.forEach((row, i) => {
      const id = nextId(records) + created.length
      created.push({
        id,
        title: i === 0 ? title : '',
        patient_id: row.patient_id ?? null,
        appointment_id: row.appointment_id ?? null,
        code: row.code ?? '',
        category: row.category ?? '',
        value_numeric: row.value_numeric ?? null,
        value_text: row.value_text ?? '',
        unit: row.unit ?? '',
        reference_low: row.reference_low ?? null,
        reference_high: row.reference_high ?? null,
        occurrence_datetime: row.occurrence_datetime ?? '',
        created_at,
        updated_at,
        _attachments: i === 0 ? attachedFiles.map((f) => ({ name: f.name })) : [],
      })
    })
    records.push(...created)
    saveToStorage(records)
    return created
  })
}

export { CATEGORIES }
