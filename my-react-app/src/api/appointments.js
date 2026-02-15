/**
 * Appointments API — Supabase.
 * Table: appointment — medical_provider_id, patient_id, scheduled_for, reason, user_id
 */

import { supabase, getSession, getCurrentPatientId } from './auth'

function toNum(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Create an appointment row.
 * @param {{ medical_provider_id: number | string, scheduled_for: string, reason: string }} payload
 * @returns {Promise<{ data?: unknown, error?: import('@supabase/supabase-js').PostgrestError }>}
 */
export async function createAppointment(payload) {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  const session = await getSession()
  if (!session?.user?.id) return { error: { message: 'Not authenticated' } }
  const patientId = await getCurrentPatientId()
  if (patientId == null) return { error: { message: 'Patient not found' } }
  const row = {
    medical_provider_id: toNum(payload.medical_provider_id),
    patient_id: patientId,
    scheduled_for: payload.scheduled_for ?? null,
    reason: payload.reason ?? '',
    user_id: session.user.id,
  }
  return supabase.from('appointment').insert(row).select().single()
}

/**
 * Map raw appointment row(s) to widget shape. Handles both joined (medical_provider) and non-joined rows.
 * @param {Array<{ id: number, scheduled_for: string | null, reason: string | null, medical_provider_id?: number, medical_provider?: { name?: string } | null }>} rows
 * @returns {Array<{ id: number, date: string, time: string, place: string, type: string }>}
 */
function mapAppointmentRows(rows) {
  return (rows || []).map((row) => {
    const d = row.scheduled_for ? new Date(row.scheduled_for) : null
    const dateStr = d ? d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'
    const timeStr = d ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '—'
    const place = row.medical_provider?.name ?? (row.medical_provider_id != null ? `Provider ${row.medical_provider_id}` : '—')
    return {
      id: row.id,
      date: dateStr,
      time: timeStr,
      place,
      type: row.reason ?? '—',
    }
  })
}

/**
 * Fetch appointments for a user (for the widget).
 * @param {string} [userId] - User id to filter by. If omitted, uses current session user id.
 * @param {{ futureOnly?: boolean }} [options] - futureOnly: if true (default), only return appointments with scheduled_for >= now.
 * @returns {Promise<{ data: Array<{ id: number, date: string, time: string, place: string, type: string }>, error: import('@supabase/supabase-js').PostgrestError | null }>}
 */
export async function getUpcomingAppointments(userId, options = {}) {
  const { futureOnly = true } = options
  if (!supabase) {
    return { data: [], error: { message: 'Supabase not configured' } }
  }
  const uid = userId ?? (await getSession())?.user?.id
  if (!uid) {
    return { data: [], error: { message: 'Not authenticated' } }
  }
  let query = supabase
    .from('appointment')
    .select('id, scheduled_for, reason, medical_provider_id, medical_provider(name)')
    .eq('user_id', uid)
    .order('scheduled_for', { ascending: true })
    .limit(20)
  if (futureOnly) {
    query = query.gte('scheduled_for', new Date().toISOString())
  }
  const { data: dataWithJoin, error: errorWithJoin } = await query
  if (!errorWithJoin && dataWithJoin != null) {
    return { data: mapAppointmentRows(dataWithJoin), error: null }
  }
  console.error('getUpcomingAppointments (with join)', errorWithJoin)
  const fallbackQuery = supabase
    .from('appointment')
    .select('id, scheduled_for, reason, medical_provider_id')
    .eq('user_id', uid)
    .order('scheduled_for', { ascending: true })
    .limit(20)
  const fallback = futureOnly ? fallbackQuery.gte('scheduled_for', new Date().toISOString()) : fallbackQuery
  const { data: dataFallback, error: errorFallback } = await fallback
  if (errorFallback) {
    console.error('getUpcomingAppointments (fallback)', errorFallback)
    return { data: [], error: errorFallback }
  }
  const rows = dataFallback || []
  const providerIds = [...new Set(rows.map((r) => r.medical_provider_id).filter((id) => id != null))]
  const providerNameById = new Map()
  if (providerIds.length > 0) {
    const { data: providers } = await supabase.from('medical_provider').select('id, name').in('id', providerIds)
    for (const p of providers || []) {
      if (p.id != null) providerNameById.set(p.id, p.name ?? '—')
    }
  }
  const rowsWithNames = rows.map((row) => ({
    ...row,
    medical_provider: row.medical_provider_id != null
      ? { name: providerNameById.get(row.medical_provider_id) ?? `Provider ${row.medical_provider_id}` }
      : null,
  }))
  return { data: mapAppointmentRows(rowsWithNames), error: null }
}
