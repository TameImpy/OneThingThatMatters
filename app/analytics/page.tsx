'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { NewsletterIssue } from '@/lib/types'

const DISPLAY = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif"
const BODY = "Georgia, 'Times New Roman', serif"

async function signOut(router: ReturnType<typeof useRouter>) {
  await fetch('/api/auth/logout', { method: 'POST' })
  router.push('/login')
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function pct(count: number | null, total: number | null): string {
  if (!total || !count) return '—'
  return (count / total * 100).toFixed(1) + '%'
}

function num(count: number | null): string {
  if (count === null || count === undefined) return '—'
  return count.toString()
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [issues, setIssues] = useState<NewsletterIssue[]>([])
  const [activeSubscriberCount, setActiveSubscriberCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setIssues(data.issues)
          setActiveSubscriberCount(data.activeSubscriberCount)
        } else {
          setError(data.error ?? 'Failed to load analytics')
        }
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-page text-primary">

      {/* Header */}
      <header className="bg-ink sticky top-0 z-10">
        <div className="mx-auto max-w-screen-xl px-6 py-4 flex items-center justify-between">
          <div>
            <p style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '28px',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              lineHeight: 1,
              color: '#FFFFFF',
              margin: '0 0 4px 0',
            }}>
              One Thing That Matters
            </p>
            <p style={{ fontFamily: BODY, fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
              Analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/today')}
              className="rounded px-3 py-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 transition-colors"
              style={{ fontFamily: BODY }}
            >
              ← Dashboard
            </button>
            <button
              onClick={() => signOut(router)}
              className="rounded px-3 py-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 transition-colors"
              style={{ fontFamily: BODY }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-6 py-8">

        {/* Summary card */}
        <div className="mb-8 rounded border border-border bg-surface px-6 py-5 inline-block">
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1" style={{ fontFamily: BODY, letterSpacing: '0.10em' }}>
            Active Subscribers
          </p>
          {loading ? (
            <div className="h-8 w-16 rounded bg-border animate-pulse" />
          ) : (
            <p style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: '36px',
              lineHeight: 1,
              color: 'var(--color-accent)',
              margin: 0,
            }}>
              {activeSubscriberCount.toLocaleString()}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700 text-sm mb-6" style={{ fontFamily: BODY }}>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="rounded border border-border bg-surface overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <div className="h-4 w-32 rounded bg-border animate-pulse" />
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="px-6 py-4 border-b border-border last:border-b-0 flex gap-8">
                {[1, 2, 3, 4, 5, 6].map(j => (
                  <div key={j} className="h-4 rounded bg-border animate-pulse" style={{ width: j === 1 ? '120px' : '64px' }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && issues.length === 0 && (
          <div className="rounded border border-border bg-surface px-8 py-16 text-center">
            <p className="text-muted text-sm" style={{ fontFamily: BODY }}>
              No newsletters published yet.
            </p>
          </div>
        )}

        {/* Issues table */}
        {!loading && !error && issues.length > 0 && (
          <div className="rounded border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm" style={{ fontFamily: BODY }}>
              <thead>
                <tr className="border-b border-border bg-ink/50">
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted" style={{ letterSpacing: '0.10em' }}>
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-muted" style={{ letterSpacing: '0.10em' }}>
                    Sent to
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-muted" style={{ letterSpacing: '0.10em' }}>
                    Opens
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-muted" style={{ letterSpacing: '0.10em' }}>
                    Open rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-muted" style={{ letterSpacing: '0.10em' }}>
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-muted" style={{ letterSpacing: '0.10em' }}>
                    Click rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, idx) => (
                  <tr
                    key={issue.id}
                    className={`border-b border-border last:border-b-0 ${idx % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                  >
                    <td className="px-6 py-4 text-primary">
                      {formatDate(issue.issue_date)}
                    </td>
                    <td className="px-6 py-4 text-right text-muted">
                      {num(issue.subscriber_count)}
                    </td>
                    <td className="px-6 py-4 text-right text-primary">
                      {num(issue.open_count)}
                    </td>
                    <td className="px-6 py-4 text-right text-accent">
                      {pct(issue.open_count, issue.subscriber_count)}
                    </td>
                    <td className="px-6 py-4 text-right text-primary">
                      {num(issue.click_count)}
                    </td>
                    <td className="px-6 py-4 text-right text-accent">
                      {pct(issue.click_count, issue.subscriber_count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
