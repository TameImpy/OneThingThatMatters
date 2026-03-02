import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const AUTH_COOKIE = 'editor-session'

function makeToken(): string {
  const secret = process.env.AUTH_SECRET ?? 'dev-secret'
  const password = process.env.EDITOR_PASSWORD ?? 'password'
  return createHmac('sha256', secret).update(password).digest('hex')
}

export async function POST(request: Request) {
  const body = await request.json() as { password?: string }
  const expected = process.env.EDITOR_PASSWORD ?? 'password'

  if (!body.password || body.password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = makeToken()
  const response = NextResponse.json({ success: true })
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return response
}
