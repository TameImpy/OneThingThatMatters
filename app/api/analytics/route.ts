import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { NewsletterIssue } from '@/lib/types'

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  )
}

export async function GET() {
  try {
    const supabase = getSupabase()

    const [issuesResult, subscriberResult] = await Promise.all([
      supabase
        .from('newsletter_issues')
        .select('*')
        .order('issue_date', { ascending: false }),
      supabase
        .from('subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('active', true),
    ])

    if (issuesResult.error) {
      return NextResponse.json({ success: false, error: issuesResult.error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      issues: (issuesResult.data ?? []) as NewsletterIssue[],
      activeSubscriberCount: subscriberResult.count ?? 0,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
