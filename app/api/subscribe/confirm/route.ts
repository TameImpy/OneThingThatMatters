import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { resend, renderWelcomeEmailHTML } from '@/lib/resend'

const FROM = 'One Thing That Matters <newsletter@onethingmatters.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://onethingmatters.com'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/subscribe/confirm?status=invalid`)
  }

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .select('id, email, name, active, confirmed_at')
    .eq('confirmation_token', token)
    .single()

  if (error || !subscriber) {
    return NextResponse.redirect(`${APP_URL}/subscribe/confirm?status=invalid`)
  }

  // Already confirmed — idempotent success
  if (subscriber.confirmed_at) {
    return NextResponse.redirect(`${APP_URL}/subscribe/confirm?status=already`)
  }

  // Activate subscriber
  const { error: updateError } = await supabase
    .from('subscribers')
    .update({
      active: true,
      confirmed_at: new Date().toISOString(),
      confirmation_token: null,
    })
    .eq('id', subscriber.id)

  if (updateError) {
    return NextResponse.redirect(`${APP_URL}/subscribe/confirm?status=invalid`)
  }

  // Send welcome email (fire and forget — don't block the redirect)
  resend.emails.send({
    from: FROM,
    to: [subscriber.email],
    subject: 'Welcome to One Thing That Matters',
    html: renderWelcomeEmailHTML(subscriber.name ?? null),
  }).catch(err => console.error('Failed to send welcome email:', err))

  return NextResponse.redirect(`${APP_URL}/subscribe/confirm?status=success`)
}
