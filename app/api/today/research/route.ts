import { NextRequest, NextResponse } from 'next/server'
import { getTodayItems } from '@/lib/supabase'
import type { AiPaperCandidate } from '@/lib/types'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? undefined
  try {
    const items = await getTodayItems<AiPaperCandidate>('ai_paper_candidates', 'run_date', date)
    return NextResponse.json({ success: true, data: items })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
