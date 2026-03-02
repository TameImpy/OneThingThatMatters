import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { supabase } from '@/lib/supabase'
import { resend, renderConfirmationEmailHTML } from '@/lib/resend'

const FROM = process.env.RESEND_FROM ?? 'One Thing That Matters <newsletter@onethingmatters.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://onethingmatters.com'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, name } = body as { email?: string; name?: string }

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing email' }, { status: 400 })
  }

  const normalized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalized)) {
    return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
  }

  const trimmedName = typeof name === 'string' ? name.trim() || null : null

  // Check if already subscribed and confirmed
  const { data: existing } = await supabase
    .from('subscribers')
    .select('id, active, confirmed_at')
    .eq('email', normalized)
    .maybeSingle()

  if (existing?.active && existing?.confirmed_at) {
    // Already confirmed — silently succeed (don't leak subscriber info)
    return NextResponse.json({ success: true })
  }

  const token = randomBytes(32).toString('hex')
  const confirmUrl = `${APP_URL}/api/subscribe/confirm?token=${token}`

  if (existing) {
    // Existing unconfirmed subscriber — refresh token and resend
    const { error } = await supabase
      .from('subscribers')
      .update({ name: trimmedName, confirmation_token: token, active: false })
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
  } else {
    // New subscriber — insert as inactive pending confirmation
    const { error } = await supabase.from('subscribers').insert({
      email: normalized,
      name: trimmedName,
      active: false,
      confirmation_token: token,
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
  }

  // Send confirmation email
  const { error: emailError } = await resend.emails.send({
    from: FROM,
    to: [normalized],
    subject: 'Confirm your subscription to One Thing That Matters',
    html: renderConfirmationEmailHTML(trimmedName, confirmUrl),
  })

  if (emailError) {
    console.error('Failed to send confirmation email:', emailError)
    return NextResponse.json({ success: false, error: 'Failed to send confirmation email' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email } = body as { email?: string }
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing email' }, { status: 400 })
  }

  const { error } = await supabase
    .from('subscribers')
    .update({ active: false })
    .eq('email', email.trim().toLowerCase())

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
