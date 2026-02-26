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
 * Fetch rows from a table updated in the last 3 days.
 * @param dateColumn  - timestamp column to filter on (default: updated_at)
 * @param orderField  - column to sort descending; null skips ordering (default: fit_score)
 */
export async function getTodayItems<T>(
  table: CategoryTable,
  { dateColumn = 'updated_at', orderField = 'fit_score' as string | null } = {}
): Promise<T[]> {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from(table)
    .select('*')
    .gte(dateColumn, threeDaysAgo)

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
  const isArt = table === 'newsletter_daily_art'

  if (isArt) return // art is auto-included, no pick needed

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
