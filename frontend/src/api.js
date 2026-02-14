const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function handleResponse(res) {
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    throw new Error(b?.error || res.statusText)
  }
  return res.json()
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/api/v1/health`)
  return handleResponse(res)
}

export async function getEstablishments() {
  const res = await fetch(`${API_BASE}/api/v1/establishments`)
  return handleResponse(res)
}

export async function getEstablishment(id) {
  const res = await fetch(`${API_BASE}/api/v1/establishments/${id}`)
  return handleResponse(res)
}

export async function getPatients(establishmentId = null) {
  const url = establishmentId
    ? `${API_BASE}/api/v1/patients?establishment_id=${establishmentId}`
    : `${API_BASE}/api/v1/patients`
  const res = await fetch(url, establishmentId ? { headers: { 'X-Establishment-Id': String(establishmentId) } } : {})
  return handleResponse(res)
}

export async function createPatient(data) {
  const res = await fetch(`${API_BASE}/api/v1/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function getRecords(establishmentId, patientId = null) {
  const url = patientId
    ? `${API_BASE}/api/v1/establishments/${establishmentId}/records?patient_id=${patientId}`
    : `${API_BASE}/api/v1/establishments/${establishmentId}/records`
  const res = await fetch(url)
  return handleResponse(res)
}

export function getRecordFileUrl(recordId) {
  return `${API_BASE}/api/v1/records/${recordId}/file`
}

export async function uploadRecord(establishmentId, formData) {
  const res = await fetch(`${API_BASE}/api/v1/establishments/${establishmentId}/records`, {
    method: 'POST',
    body: formData,
  })
  return handleResponse(res)
}
