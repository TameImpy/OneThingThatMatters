import { NextRequest, NextResponse } from 'next/server'
import { pickItem } from '@/lib/supabase'
import type { PickRequest, CategoryTable } from '@/lib/types'

const VALID_TABLES: CategoryTable[] = [
  'watch_candidates',
  'ai_news_top5',
  'ai_paper_candidates',
  'stories_of_past_candidates',
  'newsletter_daily_art',
]

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { table, id } = body as Partial<PickRequest>

  if (!table || !VALID_TABLES.includes(table)) {
    return NextResponse.json({ success: false, error: 'Invalid or missing table' }, { status: 400 })
  }
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid or missing id' }, { status: 400 })
  }

  try {
    await pickItem(table, id)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
