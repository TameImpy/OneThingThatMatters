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

/**
 * Fetch rows for a specific date (defaults to today).
 * @param dateColumn  - column to filter on (cast to ::date for timestamp columns)
 * @param orderField  - column to sort descending; null skips ordering (default: fit_score)
 * @param targetDate  - ISO date string YYYY-MM-DD (default: today)
 */
export async function getTodayItems<T>(
  table: CategoryTable,
  {
    dateColumn = 'updated_at',
    orderField = 'fit_score' as string | null,
    targetDate,
  }: { dateColumn?: string; orderField?: string | null; targetDate?: string } = {}
): Promise<T[]> {
  const date = targetDate ?? new Date().toISOString().split('T')[0]

  let query = supabase
    .from(table)
    .select('*')
    .filter(`${dateColumn}::date`, 'eq', date)

  if (orderField) {
    query = query.order(orderField, { ascending: false, nullsFirst: false })
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as T[]
}

/**
 * Mark an item as picked. Uses `selected = true` for stories table,
 * `picked = true, picked_at = now()` for all others.
 */
export async function pickItem(table: CategoryTable, id: string): Promise<void> {
  const isStories = table === 'stories_of_past_candidates'

  const update = isStories
    ? { selected: true }
    : { picked: true, picked_at: new Date().toISOString() }

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
