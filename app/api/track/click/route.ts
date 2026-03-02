import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.redirect('https://onethingmatters.com')
  }

  // Validate URL to prevent open redirect abuse
  let destination: URL
  try {
    destination = new URL(url)
    if (!['http:', 'https:'].includes(destination.protocol)) {
      throw new Error('Invalid protocol')
    }
  } catch {
    return NextResponse.redirect('https://onethingmatters.com')
  }

  if (date) {
    // Atomic increment — fire-and-forget, don't block the redirect
    supabase.rpc('increment_click_count', { p_date: date })
      .then(({ error }) => { if (error) console.error('click track error:', error) })
  }

  return NextResponse.redirect(destination.toString())
}
