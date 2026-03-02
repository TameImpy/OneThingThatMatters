'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const DISPLAY = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif"
const BODY = "Georgia, 'Times New Roman', serif"

type Status = 'success' | 'already' | 'invalid' | null

function ConfirmContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status') as Status

  const content: Record<NonNullable<Status>, { diamond: string; heading: string; body: string }> = {
    success: {
      diamond: '◆',
      heading: "You're in.",
      body: "Your subscription is confirmed. You'll get your first issue next weekday morning.",
    },
    already: {
      diamond: '◆',
      heading: 'Already confirmed.',
      body: "You're already subscribed. Look out for your next issue on a weekday morning.",
    },
    invalid: {
      diamond: '◇',
      heading: 'Link expired.',
      body: 'This confirmation link is invalid or has already been used. Subscribe again to get a fresh link.',
    },
  }

  const c = status ? content[status] : null
  const isError = status === 'invalid'

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xs overflow-hidden rounded-lg shadow-sm">

        <div className="bg-ink px-8 py-6 text-center">
          <p
            className="text-white leading-none m-0 uppercase"
            style={{ fontFamily: DISPLAY, fontWeight: 900, fontStyle: 'italic', fontSize: '36px', letterSpacing: '-0.02em' }}
          >
            One Thing That Matters
          </p>
        </div>

        <div className="bg-surface px-8 py-8 border-x border-border text-center">
          {c ? (
            <>
              <p
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 900,
                  fontStyle: 'italic',
                  fontSize: '28px',
                  color: isError ? '#F87171' : '#22D3EE',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  margin: '0 0 12px 0',
                }}
              >
                {c.diamond}&nbsp;{c.heading}
              </p>
              <p className="text-muted text-sm leading-relaxed" style={{ fontFamily: BODY, margin: '0 0 16px 0' }}>
                {c.body}
              </p>
              {isError && (
                <Link
                  href="/subscribe"
                  className="inline-block rounded px-4 py-2 text-xs font-bold uppercase tracking-wider bg-accent text-white hover:bg-accent/90 transition-colors"
                  style={{ fontFamily: BODY }}
                >
                  Subscribe again
                </Link>
              )}
            </>
          ) : (
            <p className="text-muted text-sm animate-pulse" style={{ fontFamily: BODY }}>Loading…</p>
          )}
        </div>

        <div className="bg-ink px-8 py-3 text-center">
          <p className="text-muted text-xs m-0" style={{ fontFamily: BODY }}>
            Free. No spam. Unsubscribe anytime.
          </p>
        </div>

      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  )
}
