'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const DISPLAY = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif"
const BODY = "Georgia, 'Times New Roman', serif"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/today'

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push(from)
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Invalid password')
      }
    } catch {
      setError('Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: '32px',
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            lineHeight: 1,
            color: '#FFFFFF',
            margin: '0 0 8px 0',
          }}>
            One Thing That Matters
          </p>
          <p style={{ fontFamily: BODY, fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Editorial Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded border border-border bg-surface p-6">
          <label
            htmlFor="password"
            className="block text-xs font-bold uppercase tracking-widest text-muted mb-2"
            style={{ fontFamily: BODY, letterSpacing: '0.10em' }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            required
            className="w-full rounded border border-border bg-page px-3 py-2 text-sm text-primary placeholder-muted/50 focus:outline-none focus:border-accent/60 mb-4"
            style={{ fontFamily: BODY }}
          />
          {error && (
            <p className="text-red-400 text-xs mb-3" style={{ fontFamily: BODY }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
            style={{ fontFamily: BODY }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
