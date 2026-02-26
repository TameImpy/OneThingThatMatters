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

        // Use already-picked items if available
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
    <div className="min-h-screen bg-navy-950 text-cyan-100">
      <header className="border-b border-navy-800 bg-navy-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-cyan-400">
              Newsletter · {date}
            </h1>
            <p className="text-xs text-cyan-100/40 mt-0.5">Review and publish</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded px-3 py-1.5 text-xs text-cyan-400/70 hover:text-cyan-400 border border-navy-800 hover:border-cyan-400/40 transition-colors"
            >
              ← Back
            </button>
            {!published && (
              <button
                onClick={handlePublish}
                disabled={!allPicked || publishing}
                className={`rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  allPicked && !publishing
                    ? 'bg-cyan-400 text-navy-950 hover:bg-cyan-300'
                    : 'bg-navy-800 text-navy-800 cursor-not-allowed'
                }`}
              >
                {publishing ? 'Sending…' : 'Publish & Send →'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {loading && (
          <p className="text-cyan-100/40 text-sm animate-pulse text-center py-16">Loading…</p>
        )}

        {!allPicked && !loading && (
          <div className="mb-6 rounded border border-amber-800/50 bg-amber-950/20 p-4 text-amber-400 text-sm">
            Not all categories have been picked yet. Go back and complete your selections.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded border border-red-800 bg-red-950/40 p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {published && (
          <div className="mb-6 rounded border border-cyan-800 bg-cyan-950/20 p-4 text-cyan-400 text-sm font-semibold">
            ✓ Newsletter published and sent to all subscribers!
          </div>
        )}

        {!loading && (
          <NewsletterPreview
            issueDate={date}
            issueNumber={issueNumber}
            watch={picks.watch}
            news={picks.news}
            research={picks.research}
            story={picks.story}
            art={art}
          />
        )}
      </div>
    </div>
  )
}
