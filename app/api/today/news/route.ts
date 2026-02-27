import { NextRequest, NextResponse } from 'next/server'
import { getTodayItems } from '@/lib/supabase'
import type { AiNewsTop5 } from '@/lib/types'

export async function GET(req: NextRequest) {
  const targetDate = req.nextUrl.searchParams.get('date') ?? undefined
  try {
    const items = await getTodayItems<AiNewsTop5>('ai_news_top5', { dateColumn: 'run_date', orderField: null, targetDate })
    return NextResponse.json({ success: true, data: items })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
