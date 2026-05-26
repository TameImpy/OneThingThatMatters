import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { WatchCandidate } from '@/lib/types'

export async function GET(req: NextRequest) {
  const targetDate = req.nextUrl.searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const daysBackRaw = Number(req.nextUrl.searchParams.get('daysBack'))
  const daysBack = Number.isFinite(daysBackRaw) && daysBackRaw > 0 ? Math.min(daysBackRaw, 30) : 1
  try {
    const lower = new Date(targetDate + 'T12:00:00Z')
    lower.setUTCDate(lower.getUTCDate() - daysBack)
    const fromLower = `${lower.toISOString().split('T')[0]}T00:00:00.000Z`
    const toUpper = `${targetDate}T23:59:59.999Z`

    const { data, error } = await supabase
      .from('watch_candidates')
      .select('*')
      .gte('updated_at', fromLower)
      .lt('updated_at', toUpper)
      .order('fit_score', { ascending: false, nullsFirst: false })

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
