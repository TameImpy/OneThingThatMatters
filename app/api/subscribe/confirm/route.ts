import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { resend, renderWelcomeEmailHTML } from '@/lib/resend'

const FROM = process.env.RESEND_FROM ?? 'One Thing That Matters <newsletter@onethingmatters.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://onethingmatters.com'

/**
 * Backwards-compat redirect. Older confirmation emails sent before the
 * scanner-safe flow point at this URL. Don't activate on GET — that would
 * let an email-security pre-fetcher burn the token. Just hand off to the
 * confirmation page, which renders a Confirm button that POSTs here.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const target = token
    ? `${APP_URL}/subscribe/confirm?token=${encodeURIComponent(token)}`
    : `${APP_URL}/subscribe/confirm?status=invalid`
  return NextResponse.redirect(target)
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, status: 'invalid' as const }, { status: 400 })
  }

  const { token } = body as { token?: string }
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ success: false, status: 'invalid' as const }, { status: 400 })
  }

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .select('id, email, name, active, confirmed_at')
    .eq('confirmation_token', token)
    .maybeSingle()

  if (error || !subscriber) {
    return NextResponse.json({ success: false, status: 'invalid' as const }, { status: 404 })
  }

  // Already confirmed — idempotent success, no duplicate welcome email.
  if (subscriber.confirmed_at) {
    return NextResponse.json({ success: true, status: 'already' as const })
  }

  // Keep the token in place so re-POSTs with the same link resolve to the
  // subscriber and report 'already' instead of 'invalid'. The confirmed_at
  // check above makes activation idempotent and prevents duplicate welcomes.
  const { error: updateError } = await supabase
    .from('subscribers')
    .update({
      active: true,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', subscriber.id)

  if (updateError) {
    return NextResponse.json({ success: false, status: 'invalid' as const }, { status: 500 })
  }

  resend.emails.send({
    from: FROM,
    to: [subscriber.email],
    subject: 'Welcome to One Thing That Matters',
    html: renderWelcomeEmailHTML(subscriber.name ?? null),
  }).catch(err => console.error('Failed to send welcome email:', err))

  return NextResponse.json({ success: true, status: 'success' as const })
}
