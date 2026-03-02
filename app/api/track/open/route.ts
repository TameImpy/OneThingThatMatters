import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 1x1 transparent GIF — the standard tracking pixel
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')

  if (date) {
    // Atomic increment — fire-and-forget, don't block the pixel response
    supabase.rpc('increment_open_count', { p_date: date })
      .then(({ error }) => { if (error) console.error('open track error:', error) })
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
