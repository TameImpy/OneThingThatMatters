import { NextRequest, NextResponse } from 'next/server'
import { getTodayItems } from '@/lib/supabase'
import type { NewsletterDailyArt } from '@/lib/types'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? undefined
  try {
    const items = await getTodayItems<NewsletterDailyArt>('newsletter_daily_art', 'issue_date', date)
    const art = items[0] ?? null
    return NextResponse.json({ success: true, data: art })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
