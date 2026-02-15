/**
 * Prescriptions API — Supabase. Table: prescription.
 * Columns: id, patient_id, prescription_name, instructions, medical_provider_id,
 * when_prescribed, prescription_startdate, prescription_enddate, quantity,
 * dosage_strength, frequency, refills, status, created_at, updated_at, user_id.
 */

import { supabase, getSession, getCurrentPatientId } from './auth'

function now() {
  return new Date().toISOString()
}

function toNum(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function dateForDb(v) {
  if (!v || typeof v !== 'string') return null
  const s = v.trim()
  return s || null
}

/** Map DB row to frontend shape (snake_case keys the UI expects). */
function mapRow(row) {
  if (!row) return null
  const start = row.prescription_startdate
  const end = row.prescription_enddate
  return {
    id: row.id,
    name: row.prescription_name ?? '',
    instructions: row.instructions ?? '',
    medical_provider_id: row.medical_provider_id ?? '',
    start_date: start ? String(start).slice(0, 10) : '',
    end_date: end ? String(end).slice(0, 10) : '',
    quantity: row.quantity ?? null,
    dosage_strength: row.dosage_strength != null ? String(row.dosage_strength) : '',
    frequency: row.frequency != null ? String(row.frequency) : '',
    refills: row.refills ?? null,
    status: row.status ?? 'Active',
    created_at: row.created_at ?? '',
    updated_at: row.updated_at ?? '',
  }
}

/**
 * @param {string | number} id
 * @returns {Promise<Object | null>}
 */
export async function getPrescription(id) {
  if (!supabase) return null
  const session = await getSession()
  if (!session?.user?.id) return null
  const { data, error } = await supabase
    .from('prescription')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle()
  if (error || !data) return null
  return mapRow(data)
}

/**
 * @returns {Promise<Array<Object>>} Prescriptions sorted newest first
 */
export async function getPrescriptions() {
  if (!supabase) return []
  const session = await getSession()
  if (!session?.user?.id) return []
  const { data, error } = await supabase
    .from('prescription')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data || []).map(mapRow)
}

/**
 * @param {Partial<{ name: string, instructions: string, medical_provider_id: string | number, start_date: string, end_date: string, quantity: number | string, dosage_strength: string | number, frequency: string | number, refills: number | string, status: string }>} payload
 * @returns {Promise<{ data?: Object, error?: { message: string } }>}
 */
export async function createPrescription(payload) {
  if (!supabase) return { error: { message: 'Not configured' } }
  const session = await getSession()
  if (!session?.user?.id) return { error: { message: 'Not signed in' } }
  const patientId = await getCurrentPatientId()
  if (patientId == null) return { error: { message: 'Patient record not found' } }
  const nowStr = now()
  const row = {
    user_id: session.user.id,
    patient_id: patientId,
    prescription_name: payload.name ?? '',
    instructions: payload.instructions ?? '',
    medical_provider_id: toNum(payload.medical_provider_id),
    when_prescribed: nowStr,
    prescription_startdate: dateForDb(payload.start_date),
    prescription_enddate: dateForDb(payload.end_date),
    quantity: toNum(payload.quantity),
    dosage_strength: toNum(payload.dosage_strength),
    frequency: toNum(payload.frequency),
    refills: toNum(payload.refills),
    status: payload.status ?? 'Active',
    created_at: nowStr,
    updated_at: nowStr,
  }
  const { data, error } = await supabase.from('prescription').insert(row).select().single()
  if (error) return { error: { message: error.message } }
  return { data: mapRow(data) }
}

/**
 * @param {string | number} id
 * @param {Partial<{ name: string, instructions: string, medical_provider_id: string | number, start_date: string, end_date: string, quantity: number | string, dosage_strength: string | number, frequency: string | number, refills: number | string, status: string }>} payload
 * @returns {Promise<{ data?: Object | null, error?: { message: string } }>}
 */
export async function updatePrescription(id, payload) {
  if (!supabase) return { error: { message: 'Not configured' } }
  const session = await getSession()
  if (!session?.user?.id) return { error: { message: 'Not signed in' } }
  const updateObj = {
    prescription_name: payload.name ?? undefined,
    instructions: payload.instructions ?? undefined,
    medical_provider_id: toNum(payload.medical_provider_id),
    prescription_startdate: dateForDb(payload.start_date),
    prescription_enddate: dateForDb(payload.end_date),
    quantity: toNum(payload.quantity),
    dosage_strength: toNum(payload.dosage_strength),
    frequency: toNum(payload.frequency),
    refills: toNum(payload.refills),
    status: payload.status ?? undefined,
    updated_at: now(),
  }
  const { data, error } = await supabase
    .from('prescription')
    .update(updateObj)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .maybeSingle()
  if (error) return { error: { message: error.message } }
  return { data: data ? mapRow(data) : null }
}

/**
 * @param {string | number} id
 * @returns {Promise<{ ok: boolean, error?: { message: string } }>}
 */
export async function deletePrescription(id) {
  if (!supabase) return { ok: false, error: { message: 'Not configured' } }
  const session = await getSession()
  if (!session?.user?.id) return { ok: false, error: { message: 'Not signed in' } }
  const { error } = await supabase
    .from('prescription')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)
  if (error) return { ok: false, error: { message: error.message } }
  return { ok: true }
}
