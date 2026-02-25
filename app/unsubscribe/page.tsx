'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function UnsubscribeForm() {
  const params = useSearchParams()
  const emailParam = params.get('email') ?? ''
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleUnsubscribe() {
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: decodeURIComponent(emailParam) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-6">
          One Thing That Matters
        </p>
        {status === 'done' ? (
          <div className="rounded-lg border border-navy-800 bg-navy-900 p-6">
            <p className="text-white font-semibold text-sm mb-1">You've been unsubscribed.</p>
            <p className="text-cyan-100/40 text-xs">
              {decodeURIComponent(emailParam)} will no longer receive emails.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-navy-800 bg-navy-900 p-6">
            <h1 className="text-white font-semibold text-sm mb-2">Unsubscribe</h1>
            <p className="text-cyan-100/50 text-xs mb-6">
              Remove <strong className="text-cyan-100/80">{decodeURIComponent(emailParam)}</strong> from the mailing list?
            </p>
            <button
              onClick={handleUnsubscribe}
              disabled={status === 'loading'}
              className="w-full rounded bg-red-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Processing…' : 'Yes, unsubscribe me'}
            </button>
            {status === 'error' && (
              <p className="mt-3 text-xs text-red-400">{errorMsg}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeForm />
    </Suspense>
  )
}
