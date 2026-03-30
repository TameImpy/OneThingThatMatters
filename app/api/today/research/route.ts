import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { AiPaperCandidate } from '@/lib/types'

// TODO: temporary 3-day lookback while arXiv API extract is broken.
// Revert to getTodayItems once the pipeline is fixed.
export async function GET(req: NextRequest) {
  const targetDate = req.nextUrl.searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  try {
    const start = new Date(targetDate + 'T12:00:00Z')
    start.setUTCDate(start.getUTCDate() - 2)
    const startDate = start.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('ai_paper_candidates')
      .select('*')
      .gte('run_date', startDate)
      .lte('run_date', targetDate)
      .order('fit_score', { ascending: false, nullsFirst: false })

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
