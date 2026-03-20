import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 1x1 transparent GIF — the standard tracking pixel
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  const email = req.nextUrl.searchParams.get('email')

  if (date && email) {
    // Insert into dedup table — unique constraint on (issue_date, email)
    // means subsequent opens from the same subscriber are silently ignored.
    const { error: insertError } = await supabase
      .from('newsletter_open_events')
      .insert({ issue_date: date, email })

    if (!insertError) {
      // First open from this subscriber for this issue — increment the count
      supabase.rpc('increment_open_count', { p_date: date })
        .then(({ error }) => { if (error) console.error('open track error:', error) })
    }
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
