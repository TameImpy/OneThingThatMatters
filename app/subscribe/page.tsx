'use client'

import { useState } from 'react'

const displayFont = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif"
const bodyFont = "Georgia, 'Times New Roman', serif"

export default function SubscribePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Subscription failed')
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xs overflow-hidden rounded-lg shadow-sm">

        {/* Masthead */}
        <div className="bg-ink px-8 py-6 text-center">
          <p
            className="text-white leading-none m-0 uppercase"
            style={{ fontFamily: displayFont, fontWeight: 900, fontStyle: 'italic', fontSize: '36px', letterSpacing: '-0.02em' }}
          >
            One Thing That Matters
          </p>
          <p className="text-white/70 text-sm mt-2 m-0" style={{ fontFamily: bodyFont }}>
            One signal in AI. Monday to Friday. Every angle.
          </p>
        </div>

        {/* Form / success */}
        <div className="bg-surface px-8 py-8 border-x border-border">
          {status === 'success' ? (
            <div className="text-center py-2">
              <p
                className="text-accent uppercase leading-none"
                style={{ fontFamily: displayFont, fontWeight: 900, fontStyle: 'italic', fontSize: '28px' }}
              >
                &#9670;&nbsp;Check your email.
              </p>
              <p className="text-muted text-sm mt-3" style={{ fontFamily: bodyFont }}>
                We sent you a confirmation link. Click it to activate your subscription.
              </p>
            </div>
          ) : (
            <>
              <p className="text-primary text-sm text-center leading-relaxed mb-6" style={{ fontFamily: bodyFont }}>
                One video, one article, one paper, one story.<br />Every weekday.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="First name"
                  required
                  className="w-full rounded border border-border bg-page px-4 py-3 text-sm text-primary focus:border-ink focus:outline-none transition-colors"
                  style={{ fontFamily: bodyFont }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded border border-border bg-page px-4 py-3 text-sm text-primary focus:border-ink focus:outline-none transition-colors"
                  style={{ fontFamily: bodyFont }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-accent px-4 py-3 text-white hover:opacity-90 transition-opacity disabled:opacity-50 uppercase"
                  style={{ fontFamily: displayFont, fontWeight: 900, fontStyle: 'italic', fontSize: '20px', letterSpacing: '0.01em' }}
                >
                  {status === 'loading' ? 'Subscribing…' : <><span style={{ position: 'relative', top: '-2px' }}>◆</span>&nbsp;Subscribe</>}
                </button>
                {status === 'error' && (
                  <p className="text-xs text-red-500 text-center" style={{ fontFamily: bodyFont }}>{errorMsg}</p>
                )}
              </form>
            </>
          )}
        </div>

        {/* Footer strip */}
        <div className="bg-ink px-8 py-3 text-center">
          <p className="text-muted text-xs m-0" style={{ fontFamily: bodyFont }}>
            Free. No spam. Unsubscribe anytime.
          </p>
        </div>

      </div>
    </div>
  )
}
