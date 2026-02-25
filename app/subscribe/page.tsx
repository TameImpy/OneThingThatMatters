'use client'

import { useState } from 'react'

export default function SubscribePage() {
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
        body: JSON.stringify({ email }),
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
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
            One Thing That Matters
          </p>
          <h1 className="text-2xl font-bold text-white mb-2">Daily AI Newsletter</h1>
          <p className="text-sm text-cyan-100/50">
            One video, one article, one paper, one story. Every day.
          </p>
        </div>

        {status === 'success' ? (
          <div className="rounded-lg border border-cyan-800 bg-cyan-950/20 p-6 text-center">
            <p className="text-cyan-400 font-semibold text-sm">You're subscribed!</p>
            <p className="text-cyan-100/50 text-xs mt-1">Check your inbox for tomorrow's issue.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded border border-navy-800 bg-navy-900 px-4 py-3 text-sm text-white placeholder-cyan-100/30 focus:border-cyan-400 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded bg-cyan-400 px-4 py-3 text-sm font-bold text-navy-950 hover:bg-cyan-300 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe →'}
            </button>
            {status === 'error' && (
              <p className="text-xs text-red-400 text-center">{errorMsg}</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
