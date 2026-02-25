import { NextRequest, NextResponse } from 'next/server'
import { supabase, getActiveSubscribers } from '@/lib/supabase'
import { resend, renderNewsletterHTML } from '@/lib/resend'
import type { PublishRequest, NewsletterDailyArt } from '@/lib/types'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { issue_date, picks, art_id } = body as Partial<PublishRequest> & { art_id?: string | null }

  if (!issue_date) {
    return NextResponse.json({ success: false, error: 'Missing issue_date' }, { status: 400 })
  }
  if (!picks?.watch || !picks?.news || !picks?.research || !picks?.story) {
    return NextResponse.json(
      { success: false, error: 'All 4 picks (watch, news, research, story) are required' },
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

    // Render HTML
    const html = renderNewsletterHTML({
      issue_date,
      watch: picks.watch,
      news: picks.news,
      research: picks.research,
      story: picks.story,
      art,
    })

    // Send via Resend batch API
    const emails = subscribers.map(({ email }) => ({
      from: 'One Thing That Matters <newsletter@onethingmatters.com>',
      to: [email],
      subject: `One Thing That Matters · ${issue_date}`,
      html: html.replace(/\{\{email\}\}/g, encodeURIComponent(email)),
    }))

    await resend.batch.send(emails)

    // Save newsletter issue
    const { error: issueError } = await supabase.from('newsletter_issues').insert({
      issue_date,
      watch_id: picks.watch.id,
      news_id: picks.news.id,
      paper_id: picks.research.id,
      story_id: picks.story.id,
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
