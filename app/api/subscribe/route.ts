import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
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

  const normalized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalized)) {
    return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
  }

  const { error } = await supabase.from('subscribers').upsert(
    { email: normalized, active: true },
    { onConflict: 'email' }
  )

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
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
