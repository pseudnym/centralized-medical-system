/**
 * Establishments (medical providers) API — Supabase.
 * Fetches from medical_provider table with pagination and optional search.
 * Busy level is assigned in the frontend for display.
 */

import { supabase } from './auth'

const PAGE_SIZE = 8

/**
 * Fetch a page of establishments (medical providers).
 * @param {{ offset?: number, limit?: number, search?: string }} options
 * @returns {Promise<{ data: Array<{ id: number, name: string, address?: string }>, error: import('@supabase/supabase-js').PostgrestError | null }>}
 */
export async function fetchEstablishments({ offset = 0, limit = PAGE_SIZE, search = '' } = {}) {
  if (!supabase) {
    return { data: [], error: { message: 'Supabase not configured' } }
  }
  let query = supabase
    .from('medical_provider')
    .select('id, name, address', { count: 'exact' })
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)
  if (search && String(search).trim()) {
    query = query.ilike('name', `%${String(search).trim()}%`)
  }
  const { data, error, count } = await query
  const rows = (data || []).map((row) => ({
    id: row.id,
    name: row.name ?? '',
    address: row.address ?? undefined,
  }))
  return { data: rows, error, totalCount: count ?? null }
}

export { PAGE_SIZE }
