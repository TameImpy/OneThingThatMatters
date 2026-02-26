import { NextRequest, NextResponse } from 'next/server'
import { getTodayItems } from '@/lib/supabase'
import type { AiNewsTop5 } from '@/lib/types'

export async function GET(_req: NextRequest) {
  try {
    const items = await getTodayItems<AiNewsTop5>('ai_news_top5')
    return NextResponse.json({ success: true, data: items })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
