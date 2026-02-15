/**
 * Prescriptions API — backend-ready layer.
 * Swap the mock implementation for fetch() when the backend is available.
 */

const STORAGE_KEY = 'medical_prescriptions'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(prescriptions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions))
  } catch (_) {}
}

function nextId(prescriptions) {
  const max = prescriptions.reduce((m, p) => (p.id > m ? p.id : m), 0)
  return max + 1
}

function now() {
  return new Date().toISOString()
}

/**
 * @param {number} id
 * @returns {Promise<Object | null>}
 */
export function getPrescription(id) {
  return Promise.resolve().then(() => {
    const prescriptions = loadFromStorage()
    return prescriptions.find((p) => p.id === Number(id)) ?? null
  })
}

/**
 * @returns {Promise<Array<Object>>} Prescriptions sorted newest first
 */
export function getPrescriptions() {
  return Promise.resolve().then(() => {
    const prescriptions = loadFromStorage()
    const list = [...prescriptions]
    list.sort((a, b) => {
      const da = a.created_at || ''
      const db = b.created_at || ''
      return db.localeCompare(da)
    })
    return list
  })
}

/**
 * @param {Partial<{ name: string, instructions: string, medical_provider_id: string | number, start_date: string, end_date: string, quantity: number | string, dosage_strength: string, frequency: string, refills: number | string, status: string }>} payload
 * @returns {Promise<Object>} Created prescription with id, created_at, updated_at
 */
export function createPrescription(payload) {
  return Promise.resolve().then(() => {
    const prescriptions = loadFromStorage()
    const id = nextId(prescriptions)
    const created_at = now()
    const updated_at = now()
    const created = {
      id,
      name: payload.name ?? '',
      instructions: payload.instructions ?? '',
      medical_provider_id: payload.medical_provider_id ?? '',
      start_date: payload.start_date ?? '',
      end_date: payload.end_date ?? '',
      quantity: payload.quantity != null && payload.quantity !== '' ? Number(payload.quantity) : null,
      dosage_strength: payload.dosage_strength ?? '',
      frequency: payload.frequency ?? '',
      refills: payload.refills != null && payload.refills !== '' ? Number(payload.refills) : null,
      status: payload.status ?? 'Active',
      created_at,
      updated_at,
    }
    prescriptions.push(created)
    saveToStorage(prescriptions)
    return created
  })
}

/**
 * @param {number} id
 * @param {Partial<{ name: string, instructions: string, medical_provider_id: string | number, start_date: string, end_date: string, quantity: number | string, dosage_strength: string, frequency: string, refills: number | string, status: string }>} payload
 * @returns {Promise<Object | null>} Updated prescription or null if not found
 */
export function updatePrescription(id, payload) {
  return Promise.resolve().then(() => {
    const prescriptions = loadFromStorage()
    const index = prescriptions.findIndex((p) => p.id === Number(id))
    if (index === -1) return null
    const existing = prescriptions[index]
    const updated_at = now()
    const updated = {
      ...existing,
      name: payload.name ?? existing.name,
      instructions: payload.instructions ?? existing.instructions,
      medical_provider_id: payload.medical_provider_id ?? existing.medical_provider_id,
      start_date: payload.start_date ?? existing.start_date,
      end_date: payload.end_date ?? existing.end_date,
      quantity: payload.quantity != null && payload.quantity !== '' ? Number(payload.quantity) : existing.quantity,
      dosage_strength: payload.dosage_strength ?? existing.dosage_strength,
      frequency: payload.frequency ?? existing.frequency,
      refills: payload.refills != null && payload.refills !== '' ? Number(payload.refills) : existing.refills,
      status: payload.status ?? existing.status,
      updated_at,
    }
    prescriptions[index] = updated
    saveToStorage(prescriptions)
    return updated
  })
}
