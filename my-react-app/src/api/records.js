/**
 * Records API — Supabase.
 * record: id, medical_provider_id, patient_id, appointment_id, user_id
 * observation: id, record_id, user_id, code, category, value_numeric, value_text, unit,
 *   reference_low, reference_high, occurence_datetime (and optional created_at, updated_at)
 */

import { supabase, getSession, getCurrentPatientId } from './auth'

const CATEGORIES = ['Physical', 'Lab Report', 'Imaging']

function now() {
  return new Date().toISOString()
}

function toNum(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Map observation row to form row shape */
function obsToDisplay(obs) {
  if (!obs) return null
  return {
    id: obs.id,
    code: obs.code ?? '',
    category: obs.category ?? '',
    value_numeric: obs.value_numeric ?? null,
    value_text: obs.value_text ?? '',
    unit: obs.unit ?? '',
    reference_low: obs.reference_low ?? null,
    reference_high: obs.reference_high ?? null,
    occurrence_datetime: obs.occurence_datetime ?? '',
  }
}

/**
 * Build a single "record" shape for list/view: record + first observation merged.
 * observations array is attached for form multi-row edit.
 */
function recordWithObservations(record, observations = []) {
  const first = observations[0]
  return {
    id: record.id,
    title: first?.code ?? first?.category ?? '',
    medical_provider_id: record.medical_provider_id ?? null,
    patient_id: record.patient_id ?? null,
    appointment_id: record.appointment_id ?? null,
    code: first?.code ?? '',
    category: first?.category ?? '',
    value_numeric: first?.value_numeric ?? null,
    value_text: first?.value_text ?? '',
    unit: first?.unit ?? '',
    reference_low: first?.reference_low ?? null,
    reference_high: first?.reference_high ?? null,
    occurrence_datetime: first?.occurence_datetime ?? '',
    created_at: record.created_at ?? '',
    updated_at: record.updated_at ?? '',
    _attachments: [],
    _observations: observations.map(obsToDisplay),
  }
}

/**
 * @param {string | number} id
 * @returns {Promise<Object | null>} Record with first observation merged + _observations array
 */
export async function getRecord(id) {
  if (!supabase) return null
  const session = await getSession()
  if (!session?.user?.id) return null
  const { data: rec, error: recError } = await supabase
    .from('record')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle()
  if (recError || !rec) return null
  const { data: observations, error: obsError } = await supabase
    .from('observation')
    .select('*')
    .eq('record_id', id)
    .order('id', { ascending: true })
  if (obsError) return recordWithObservations(rec, [])
  return recordWithObservations(rec, observations || [])
}

/**
 * @param {{ category?: string }} [opts]
 * @returns {Promise<Array<Object>>} List of records with first observation merged for display
 */
export async function getRecords(opts = {}) {
  if (!supabase) return []
  const session = await getSession()
  if (!session?.user?.id) return []
  const { data: records, error: recError } = await supabase
    .from('record')
    .select('*')
    .eq('user_id', session.user.id)
    .order('id', { ascending: false })
  if (recError || !records?.length) return []
  const recordIds = records.map((r) => r.id)
  const { data: allObs, error: obsError } = await supabase
    .from('observation')
    .select('*')
    .in('record_id', recordIds)
    .order('id', { ascending: true })
  if (obsError) return records.map((r) => recordWithObservations(r, []))
  const obsByRecord = {}
  for (const o of allObs || []) {
    if (!obsByRecord[o.record_id]) obsByRecord[o.record_id] = []
    obsByRecord[o.record_id].push(o)
  }
  let list = records.map((r) => recordWithObservations(r, obsByRecord[r.id] || []))
  if (opts.category) {
    list = list.filter((r) => (r.category || '') === opts.category)
  }
  list.sort((a, b) => {
    const da = a.occurrence_datetime || a.created_at || ''
    const db = b.occurrence_datetime || b.created_at || ''
    return db.localeCompare(da)
  })
  return list
}

/**
 * Insert one record + one observation.
 * @returns {Promise<{ data?: Object, error?: { message: string } }>}
 */
export async function createRecord(record, attachedFiles = []) {
  if (!supabase) return { error: { message: 'Not configured' } }
  const session = await getSession()
  if (!session?.user?.id) return { error: { message: 'Not signed in' } }
  const patientId = await getCurrentPatientId()
  if (patientId == null) return { error: { message: 'Patient record not found' } }
  const nowStr = now()
  const { data: rec, error: recError } = await supabase
    .from('record')
    .insert({
      user_id: session.user.id,
      medical_provider_id: toNum(record.medical_provider_id),
      patient_id: patientId,
      appointment_id: toNum(record.appointment_id),
    })
    .select()
    .single()
  if (recError) return { error: { message: recError.message } }
  const { data: obs, error: obsError } = await supabase
    .from('observation')
    .insert({
      record_id: rec.id,
      user_id: session.user.id,
      code: record.code ?? '',
      category: record.category ?? '',
      value_numeric: toNum(record.value_numeric),
      value_text: record.value_text ?? '',
      unit: record.unit ?? '',
      reference_low: toNum(record.reference_low),
      reference_high: toNum(record.reference_high),
      occurence_datetime: record.occurrence_datetime || null,
    })
    .select()
    .single()
  if (obsError) return { error: { message: obsError.message } }
  return { data: recordWithObservations(rec, [obs]) }
}

/**
 * Update record (header) and replace all observations for that record.
 * @param {string | number} id
 * @param {Object} record - record fields + first row fields
 * @param {Array<Object>} [allRows] - all form rows (observations); if not provided, single row from record
 * @param {Array<{ name: string }>} [attachedFiles]
 */
export async function updateRecord(id, record, attachedFiles = [], allRows = null) {
  if (!supabase) return { error: { message: 'Not configured' } }
  const session = await getSession()
  if (!session?.user?.id) return { error: { message: 'Not signed in' } }
  const patientId = await getCurrentPatientId()
  if (patientId == null) return { error: { message: 'Patient record not found' } }
  const { error: recError } = await supabase
    .from('record')
    .update({
      medical_provider_id: toNum(record.medical_provider_id),
      patient_id: patientId,
      appointment_id: toNum(record.appointment_id),
      updated_at: now(),
    })
    .eq('id', id)
    .eq('user_id', session.user.id)
  if (recError) return { error: { message: recError.message } }
  const { error: delError } = await supabase.from('observation').delete().eq('record_id', id)
  if (delError) return { error: { message: delError.message } }
  const rows = Array.isArray(allRows) && allRows.length ? allRows : [record]
  if (rows.length === 0) return { data: recordWithObservations({ id, ...record }, []) }
  const toInsert = rows.map((row) => ({
    record_id: id,
    user_id: session.user.id,
    code: row.code ?? '',
    category: row.category ?? '',
    value_numeric: toNum(row.value_numeric),
    value_text: row.value_text ?? '',
    unit: row.unit ?? '',
    reference_low: toNum(row.reference_low),
    reference_high: toNum(row.reference_high),
    occurence_datetime: row.occurrence_datetime || null,
  }))
  const { data: observations, error: obsError } = await supabase.from('observation').insert(toInsert).select()
  if (obsError) return { error: { message: obsError.message } }
  const rec = { id, patient_id: patientId, appointment_id: record.appointment_id, medical_provider_id: record.medical_provider_id, created_at: null, updated_at: now() }
  return { data: recordWithObservations(rec, observations || []) }
}

/**
 * @param {string | number} id
 * @returns {Promise<{ ok: boolean, error?: { message: string } }>}
 */
export async function deleteRecord(id) {
  if (!supabase) return { ok: false, error: { message: 'Not configured' } }
  const session = await getSession()
  if (!session?.user?.id) return { ok: false, error: { message: 'Not signed in' } }
  const { error: obsError } = await supabase.from('observation').delete().eq('record_id', id)
  if (obsError) return { ok: false, error: { message: obsError.message } }
  const { error: recError } = await supabase.from('record').delete().eq('id', id).eq('user_id', session.user.id)
  if (recError) return { ok: false, error: { message: recError.message } }
  return { ok: true }
}

/**
 * Create one record + N observations (one per row). Title is only for UI; first row drives record's patient_id/appointment_id.
 * @param {Array<Partial<Object>>} rows
 * @param {Array<{ name: string }>} [attachedFiles]
 * @param {string} [title]
 * @returns {Promise<{ data?: Array<Object>, error?: { message: string } }>}
 */
export async function createRecords(rows, attachedFiles = [], title = '') {
  if (!supabase) return { error: { message: 'Not configured' } }
  const session = await getSession()
  if (!session?.user?.id) return { error: { message: 'Not signed in' } }
  if (!rows?.length) return { error: { message: 'No rows' } }
  const patientId = await getCurrentPatientId()
  if (patientId == null) return { error: { message: 'Patient record not found' } }
  const first = rows[0]
  const { data: rec, error: recError } = await supabase
    .from('record')
    .insert({
      user_id: session.user.id,
      medical_provider_id: toNum(first.medical_provider_id),
      patient_id: patientId,
      appointment_id: toNum(first.appointment_id),
    })
    .select()
    .single()
  if (recError) return { error: { message: recError.message } }
  const toInsert = rows.map((row) => ({
    record_id: rec.id,
    user_id: session.user.id,
    code: row.code ?? '',
    category: row.category ?? '',
    value_numeric: toNum(row.value_numeric),
    value_text: row.value_text ?? '',
    unit: row.unit ?? '',
    reference_low: toNum(row.reference_low),
    reference_high: toNum(row.reference_high),
    occurence_datetime: row.occurrence_datetime || null,
  }))
  const { data: observations, error: obsError } = await supabase.from('observation').insert(toInsert).select()
  if (obsError) return { error: { message: obsError.message } }
  const synthetic = recordWithObservations(rec, observations || [])
  synthetic.title = title || synthetic.title
  return { data: [synthetic] }
}

export { CATEGORIES }
