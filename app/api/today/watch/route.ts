import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { WatchCandidate } from '@/lib/types'

export async function GET(req: NextRequest) {
  const targetDate = req.nextUrl.searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  try {
    // Fetch candidates updated in the last 2 days so today's run is
    // supplemented by yesterday's if n8n produces fewer videos on a given day.
    const from = `${targetDate}T00:00:00.000Z`
    const yesterday = new Date(targetDate + 'T12:00:00Z')
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const fromYesterday = `${yesterday.toISOString().split('T')[0]}T00:00:00.000Z`

    const { data, error } = await supabase
      .from('watch_candidates')
      .select('*')
      .gte('updated_at', fromYesterday)
      .lt('updated_at', from.replace('T00:00:00.000Z', 'T23:59:59.999Z'))
      .order('fit_score', { ascending: false, nullsFirst: false })

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
