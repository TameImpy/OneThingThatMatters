'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import NewsletterPreview from '@/components/NewsletterPreview'
import type {
  WatchCandidate,
  AiNewsTop5,
  AiPaperCandidate,
  StoryOfPastCandidate,
  NewsletterDailyArt,
} from '@/lib/types'

const DISPLAY = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif"
const BODY = "Georgia, 'Times New Roman', serif"

interface PageProps {
  params: Promise<{ date: string }>
}

interface StoredPicks {
  watch: WatchCandidate | null
  news: AiNewsTop5 | null
  research: AiPaperCandidate | null
  story: StoryOfPastCandidate | null
}

export default function NewsletterPage({ params }: PageProps) {
  const router = useRouter()
  const { date } = use(params)

  const [picks, setPicks] = useState<StoredPicks>({
    watch: null,
    news: null,
    research: null,
    story: null,
  })
  const [art, setArt] = useState<NewsletterDailyArt | null>(null)
  const [issueNumber, setIssueNumber] = useState<number>(1)
  const [pov, setPov] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        const qs = `?date=${date}`
        const [wRes, nRes, rRes, sRes, aRes, iRes] = await Promise.all([
          fetch(`/api/today/watch${qs}`),
          fetch(`/api/today/news${qs}`),
          fetch(`/api/today/research${qs}`),
          fetch(`/api/today/story${qs}`),
          fetch(`/api/today/art${qs}`),
          fetch('/api/newsletter/issue-count'),
        ])
        const [wData, nData, rData, sData, aData, iData] = await Promise.all([
          wRes.json(), nRes.json(), rRes.json(), sRes.json(), aRes.json(), iRes.json(),
        ])

        const pickedWatch = wData.data?.find((w: WatchCandidate) => w.picked) ?? null
        const pickedNews = nData.data?.find((n: AiNewsTop5) => n.picked) ?? null
        const pickedResearch = rData.data?.find((r: AiPaperCandidate) => r.picked) ?? null
        const pickedStory = sData.data?.find((s: StoryOfPastCandidate) => s.selected) ?? null

        setPicks({
          watch: pickedWatch,
          news: pickedNews,
          research: pickedResearch,
          story: pickedStory,
        })
        if (aData.success) setArt(aData.data)
        setIssueNumber((iData.count ?? 0) + 1)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [date])

  async function handlePublish() {
    setPublishing(true)
    setError(null)
    try {
      const res = await fetch('/api/newsletter/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_date: date,
          picks,
          art_id: art?.id ?? null,
          pov: pov.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Publish failed')
      setPublished(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  const allPicked = picks.watch && picks.news && picks.research && picks.story

  return (
    <div className="min-h-screen bg-page text-primary">

      {/* Header */}
      <header className="bg-ink sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
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
              Review &amp; Publish · {date}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
              style={{ fontFamily: BODY }}
            >
              ← Back
            </button>
            {!published && (
              <button
                onClick={handlePublish}
                disabled={!allPicked || publishing}
                className={`rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  allPicked && !publishing
                    ? 'bg-accent text-white hover:bg-accent/90'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
                style={{ fontFamily: BODY }}
              >
                {publishing ? 'Sending…' : 'Publish & Send →'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {loading && (
          <p className="text-muted text-sm animate-pulse text-center py-16" style={{ fontFamily: BODY }}>Loading…</p>
        )}

        {!allPicked && !loading && (
          <div className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 text-amber-800 text-sm" style={{ fontFamily: BODY }}>
            Not all categories have been picked yet. Go back and complete your selections.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-red-700 text-sm" style={{ fontFamily: BODY }}>
            {error}
          </div>
        )}

        {published && (
          <div className="mb-6 rounded border border-green-300 bg-green-50 p-4 text-green-800 text-sm font-semibold" style={{ fontFamily: BODY }}>
            ✓ Newsletter published and sent to all subscribers!
          </div>
        )}

        {!loading && (
          <>
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-ink mb-2" style={{ fontFamily: BODY, letterSpacing: '0.12em' }}>
                My POV Today
              </label>
              <textarea
                value={pov}
                onChange={e => setPov(e.target.value)}
                placeholder="Write your take on today's AI signal…"
                rows={4}
                className="w-full rounded border border-border bg-surface px-4 py-3 text-sm text-primary placeholder-muted/50 focus:outline-none focus:border-accent/60 resize-none"
                style={{ fontFamily: BODY }}
              />
            </div>
            <NewsletterPreview
              issueDate={date}
              issueNumber={issueNumber}
              pov={pov.trim() || null}
              watch={picks.watch}
              news={picks.news}
              research={picks.research}
              story={picks.story}
              art={art}
            />
          </>
        )}
      </div>
    </div>
  )
}
