import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const AUTH_COOKIE = 'editor-session'

async function makeToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? 'dev-secret'
  const password = process.env.EDITOR_PASSWORD ?? 'password'
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(password))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  const expected = await makeToken()

  if (token !== expected) {
    const { pathname } = request.nextUrl
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/today/:path*',
    '/newsletter/:path*',
    '/analytics/:path*',
    '/api/pick',
    '/api/today/:path*',
    '/api/newsletter/:path*',
    '/api/analytics',
    '/api/instagram/:path*',
  ],
}
