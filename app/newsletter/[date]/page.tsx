'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'

async function signOut(router: ReturnType<typeof useRouter>) {
  await fetch('/api/auth/logout', { method: 'POST' })
  router.push('/login')
}
import NewsletterPreview from '@/components/NewsletterPreview'
import type {
  WatchCandidate,
  AiNewsTop5,
  AiPaperCandidate,
  StoryOfPastCandidate,
  NewsletterDailyArt,
  DailyQuote,
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
  const [noiseTitles, setNoiseTitles] = useState<string[]>([])
  const [art, setArt] = useState<NewsletterDailyArt | null>(null)
  const [artPicked, setArtPicked] = useState(false)
  const [issueNumber, setIssueNumber] = useState<number>(1)
  const [pov, setPov] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<DailyQuote | null>(null)
  const [questions, setQuestions] = useState<{ category: string; question: string }[]>([])
  const [questionsStatus, setQuestionsStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedQuote = sessionStorage.getItem(`quote-${date}`)
    if (storedQuote) {
      try { setSelectedQuote(JSON.parse(storedQuote) as DailyQuote) } catch { /* ignore */ }
    }
    const storedArt = sessionStorage.getItem(`art-${date}`)
    if (storedArt) setArtPicked(true)
    const storedQuestions = sessionStorage.getItem(`questions-${date}`)
    if (storedQuestions) {
      try { setQuestions(JSON.parse(storedQuestions) as { category: string; question: string }[]) } catch { /* ignore */ }
    }
  }, [date])

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
          fetch(`/api/newsletter/issue-count?date=${date}`),
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

        const noise: string[] = [
          ...(wData.data ?? []).filter((w: WatchCandidate) => !w.picked).map((w: WatchCandidate) => w.title),
          ...(nData.data ?? []).filter((n: AiNewsTop5) => !n.picked).map((n: AiNewsTop5) => n.title),
          ...(rData.data ?? []).filter((r: AiPaperCandidate) => !r.picked).map((r: AiPaperCandidate) => r.title),
          ...(sData.data ?? []).filter((s: StoryOfPastCandidate) => !s.selected).map((s: StoryOfPastCandidate) => s.event_summary),
        ]
        setNoiseTitles(noise)
        if (aData.success) setArt(aData.data)
        setIssueNumber(iData.issueNumber ?? 1)
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
          quote: selectedQuote,
          noiseTitles,
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

  async function generateQuestions() {
    setQuestionsStatus('loading')
    try {
      const res = await fetch('/api/newsletter/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(picks),
      })
      const data = await res.json() as { success: boolean; questions?: { category: string; question: string }[]; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to generate questions')
      const qs = data.questions ?? []
      setQuestions(qs)
      sessionStorage.setItem(`questions-${date}`, JSON.stringify(qs))
      setQuestionsStatus('idle')
    } catch {
      setQuestionsStatus('error')
    }
  }

  const allPicked = picks.watch && picks.news && picks.research

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
              onClick={() => signOut(router)}
              className="rounded px-3 py-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 transition-colors"
              style={{ fontFamily: BODY }}
            >
              Sign out
            </button>
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
            Not all categories have been picked yet. Go back and complete your selections (Watch, Read, and Research are required).
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
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest" style={{ color: '#22D3EE', fontFamily: BODY, letterSpacing: '0.12em' }}>
                  Key Questions
                </span>
                {questions.length > 0 && (
                  <button
                    onClick={generateQuestions}
                    disabled={questionsStatus === 'loading'}
                    className="rounded px-2.5 py-1 text-xs text-white/50 hover:text-white border border-white/15 hover:border-white/35 transition-colors disabled:opacity-40"
                    style={{ fontFamily: BODY }}
                  >
                    {questionsStatus === 'loading' ? 'Generating…' : 'Regenerate'}
                  </button>
                )}
              </div>

              {questions.length === 0 && questionsStatus !== 'loading' && (
                <button
                  onClick={generateQuestions}
                  disabled={!allPicked}
                  className={`rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    allPicked
                      ? 'bg-accent text-white hover:bg-accent/90'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  Generate Key Questions
                </button>
              )}

              {questionsStatus === 'loading' && questions.length === 0 && (
                <p className="text-muted text-sm animate-pulse" style={{ fontFamily: BODY }}>Generating…</p>
              )}

              {questionsStatus === 'error' && (
                <p className="text-red-400 text-sm" style={{ fontFamily: BODY }}>Failed to generate questions. Try again.</p>
              )}

              {questions.length > 0 && (
                <ul className="space-y-2">
                  {questions.map((q, i) => (
                    <li key={i} className="rounded px-4 py-3" style={{ background: '#111827', border: '1px solid #1E2A3A' }}>
                      <span className="text-xs font-bold uppercase mr-2" style={{ color: '#FBBF24', fontFamily: BODY }}>{q.category}</span>
                      <span className="text-sm leading-relaxed" style={{ color: '#CFFAFE', fontFamily: BODY }}>{q.question}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <NewsletterPreview
              issueDate={date}
              issueNumber={issueNumber}
              pov={pov.trim() || null}
              watch={picks.watch}
              news={picks.news}
              research={picks.research}
              story={picks.story}
              art={artPicked ? art : null}
              quote={selectedQuote}
              noiseTitles={noiseTitles}
            />
          </>
        )}
      </div>
    </div>
  )
}
