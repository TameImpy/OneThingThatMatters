import { createClient } from '@supabase/supabase-js'
import type { CategoryTable } from './types'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl) throw new Error('Missing SUPABASE_URL environment variable')
if (!supabaseServiceKey) throw new Error('Missing SUPABASE_SERVICE_KEY environment variable')

/**
 * Server-side Supabase client — service role key, never exposed to frontend.
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function previousDay(date: string): string {
  const d = new Date(date + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().split('T')[0]
}

async function fetchForDate<T>(
  table: CategoryTable,
  date: string,
  dateColumn: string,
  orderField: string | null,
  isTimestamp: boolean,
): Promise<T[]> {
  let query = supabase.from(table).select('*')

  if (isTimestamp) {
    query = query
      .gte(dateColumn, `${date}T00:00:00.000Z`)
      .lt(dateColumn, `${date}T23:59:59.999Z`)
  } else {
    query = query.eq(dateColumn, date)
  }

  if (orderField) {
    query = query.order(orderField, { ascending: false, nullsFirst: false })
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as T[]
}

/**
 * Fetch rows for a specific date (defaults to today).
 * Falls back to the previous day if today returns no results (n8n failure safety net).
 * @param dateColumn  - column to filter on
 * @param orderField  - column to sort descending; null skips ordering (default: fit_score)
 * @param targetDate  - ISO date string YYYY-MM-DD (default: today)
 * @param isTimestamp - true for timestamptz columns (uses day-range filter)
 */
export async function getTodayItems<T>(
  table: CategoryTable,
  {
    dateColumn = 'updated_at',
    orderField = 'fit_score' as string | null,
    targetDate,
    isTimestamp = false,
  }: { dateColumn?: string; orderField?: string | null; targetDate?: string; isTimestamp?: boolean } = {}
): Promise<T[]> {
  const date = targetDate ?? new Date().toISOString().split('T')[0]

  const results = await fetchForDate<T>(table, date, dateColumn, orderField, isTimestamp)
  if (results.length > 0) return results

  // Nothing for today — fall back to yesterday (guards against n8n failures)
  return fetchForDate<T>(table, previousDay(date), dateColumn, orderField, isTimestamp)
}

/**
 * Mark an item as picked, atomically clearing any prior picks in the same table.
 * One pick per category — prevents stale picks from earlier days bleeding into
 * later issues (e.g. /newsletter/[date] resolving to yesterday's video).
 *
 * Sets the new pick first and aborts on a no-op. Clearing-then-setting would
 * wipe all picks if the new id were stale or invalid.
 */
export async function pickItem(table: CategoryTable, id: string): Promise<void> {
  const isStories = table === 'stories_of_past_candidates'

  if (isStories) {
    const { data: setRows, error: setError } = await supabase
      .from(table)
      .update({ selected: true })
      .eq('id', id)
      .select('id')
    if (setError) throw new Error(setError.message)
    if (!setRows || setRows.length === 0) {
      throw new Error(`No row in ${table} matches id ${id}`)
    }

    const { error: clearError } = await supabase
      .from(table)
      .update({ selected: false })
      .eq('selected', true)
      .neq('id', id)
    if (clearError) throw new Error(clearError.message)
    return
  }

  const { data: setRows, error: setError } = await supabase
    .from(table)
    .update({ picked: true, picked_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
  if (setError) throw new Error(setError.message)
  if (!setRows || setRows.length === 0) {
    throw new Error(`No row in ${table} matches id ${id}`)
  }

  const { error: clearError } = await supabase
    .from(table)
    .update({ picked: false, picked_at: null })
    .eq('picked', true)
    .neq('id', id)
  if (clearError) throw new Error(clearError.message)
}

/** Undo a pick — reverses pickItem(). */
export async function unpickItem(table: CategoryTable, id: string): Promise<void> {
  const isStories = table === 'stories_of_past_candidates'
  const update = isStories
    ? { selected: false }
    : { picked: false }
  const { error } = await supabase.from(table).update(update).eq('id', id)
  if (error) throw new Error(error.message)
}

/** Fetch all active subscribers. */
export async function getActiveSubscribers(): Promise<Array<{ email: string }>> {
  const { data, error } = await supabase
    .from('subscribers')
    .select('email')
    .eq('active', true)
  if (error) throw new Error(error.message)
  return data ?? []
}
