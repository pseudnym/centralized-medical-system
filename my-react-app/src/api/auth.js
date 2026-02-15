/**
 * Frontend auth using Supabase (email/password only).
 * Session is stored by Supabase client; use getSession() and onAuthStateChange for routing.
 */

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn(
    'Supabase env missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (with the VITE_ prefix), then restart the dev server. Requests will return 403 / "No API key found" until then.'
  )
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null

/**
 * @param {{ email: string, password: string }}
 * @returns {Promise<{ data?: { session: import('@supabase/supabase-js').Session }, error?: import('@supabase/supabase-js').AuthError }>}
 */
export async function login({ email, password }) {
  if (!supabase) return { error: { message: 'Auth not configured' } }
  return supabase.auth.signInWithPassword({ email, password })
}

/**
 * @param {{ email: string, password: string, name?: string, dateOfBirth?: string }}
 * @returns {Promise<{ data?: { user: import('@supabase/supabase-js').User }, error?: import('@supabase/supabase-js').AuthError }>}
 */
export async function signup({ email, password, name, dateOfBirth }) {
  if (!supabase) return { error: { message: 'Auth not configured' } }
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name || undefined,
        date_of_birth: dateOfBirth || undefined,
      },
    },
  })
}

/**
 * @returns {Promise<import('@supabase/supabase-js').Session | null>}
 */
export async function getSession() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * @param {(event: string, session: import('@supabase/supabase-js').Session | null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onAuthStateChange(callback) {
  if (!supabase) return () => {}
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
  return () => subscription.unsubscribe()
}

export async function logout() {
  if (!supabase) return
  await supabase.auth.signOut()
}

/**
 * Create a patient row for the given user (e.g. after signup).
 * Table: patient. Columns: user_id, name, email, dob.
 * @param {{ userId: string, name: string, email: string, dob: string }}
 * @returns {Promise<{ data?: unknown, error?: import('@supabase/supabase-js').PostgrestError }>}
 */
export async function createPatientRow({ userId, name, email, dob }) {
  if (!supabase) return { error: { message: 'Auth not configured' } }
  return supabase.from('patient').insert({
    user_id: userId,
    name,
    email,
    dob,
  }).select().single()
}

/**
 * Get the current user's name from the patient table.
 * @returns {Promise<string | null>}
 */
export async function getCurrentPatientName() {
  if (!supabase) return null
  const session = await getSession()
  if (!session?.user?.id) return null
  const { data, error } = await supabase
    .from('patient')
    .select('name')
    .eq('user_id', session.user.id)
    .maybeSingle()
  if (error || !data) return null
  return data.name ?? null
}

/**
 * Get the current user's patient id (primary key) from the patient table.
 * @returns {Promise<number | null>}
 */
export async function getCurrentPatientId() {
  if (!supabase) return null
  const session = await getSession()
  if (!session?.user?.id) return null
  const { data, error } = await supabase
    .from('patient')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle()
  if (error || data == null) return null
  return data.id != null ? Number(data.id) : null
}
