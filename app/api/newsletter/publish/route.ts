import { NextRequest, NextResponse } from 'next/server'
import { supabase, getActiveSubscribers } from '@/lib/supabase'
import { resend, renderNewsletterHTML } from '@/lib/resend'
import type { PublishRequest, NewsletterDailyArt, DailyQuote } from '@/lib/types'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { issue_date, picks, art_id, artCropBottom, pov, quote, noiseTitles } = body as Partial<PublishRequest> & { art_id?: string | null; artCropBottom?: number; pov?: string | null; quote?: DailyQuote | null; noiseTitles?: string[] }

  if (!issue_date) {
    return NextResponse.json({ success: false, error: 'Missing issue_date' }, { status: 400 })
  }
  if (!picks?.watch || !picks?.news || !picks?.research) {
    return NextResponse.json(
      { success: false, error: 'Watch, news, and research picks are required' },
      { status: 400 }
    )
  }

  try {
    // Fetch art if present
    let art: NewsletterDailyArt | null = null
    if (art_id) {
      const { data } = await supabase.from('newsletter_daily_art').select('*').eq('id', art_id).single()
      art = data
    }

    // Fetch subscribers
    const subscribers = await getActiveSubscribers()
    if (subscribers.length === 0) {
      return NextResponse.json({ success: false, error: 'No active subscribers' }, { status: 400 })
    }

    // Calculate issue number from weekdays since launch date (matches preview)
    function countWeekdays(start: Date, end: Date): number {
      let count = 0
      const current = new Date(start)
      while (current <= end) {
        const day = current.getDay()
        if (day !== 0 && day !== 6) count++
        current.setUTCDate(current.getUTCDate() + 1)
      }
      return count
    }
    const launchDate = process.env.NEWSLETTER_START_DATE ?? '2026-02-27'
    const issueNumber = Math.max(1, countWeekdays(
      new Date(launchDate + 'T12:00:00Z'),
      new Date(issue_date + 'T12:00:00Z')
    ))

    // Render HTML
    const html = renderNewsletterHTML({
      issue_date,
      issueNumber,
      pov: pov ?? null,
      watch: picks.watch,
      news: picks.news,
      research: picks.research,
      story: picks.story,
      art,
      artCropBottom: artCropBottom ?? undefined,
      quote: quote ?? null,
      noiseTitles: noiseTitles ?? [],
    })

    // Send via Resend batch API
    const fromAddress = process.env.RESEND_FROM ?? 'One Thing That Matters <newsletter@onethingmatters.com>'
    const emails = subscribers.map(({ email }) => ({
      from: fromAddress,
      to: [email],
      subject: `One Thing That Matters · ${issue_date}`,
      html: html.replace(/\{\{email\}\}/g, encodeURIComponent(email)),
    }))

    console.log(`[publish] Sending to ${emails.length} subscriber(s):`, subscribers.map(s => s.email))

    const { data: batchData, error: sendError } = await resend.batch.send(emails)

    console.log('[publish] Resend batch response:', JSON.stringify({ data: batchData, error: sendError }, null, 2))

    if (sendError) throw new Error(`Resend error: ${sendError.message}`)

    // Save newsletter issue
    const { error: issueError } = await supabase.from('newsletter_issues').insert({
      issue_date,
      watch_id: picks.watch.id,
      news_id: picks.news.id,
      paper_id: picks.research.id,
      story_id: picks.story?.id ?? null,
      art_id: art_id ?? null,
      sent_at: new Date().toISOString(),
      subscriber_count: subscribers.length,
    })
    if (issueError) console.error('Failed to save newsletter issue:', issueError)

    return NextResponse.json({
      success: true,
      subscriber_count: subscribers.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
