'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import CandidateCard from '@/components/CandidateCard'
import CategorySection from '@/components/CategorySection'
import NewsletterPreview from '@/components/NewsletterPreview'
import type {
  WatchCandidate,
  AiNewsTop5,
  AiPaperCandidate,
  StoryOfPastCandidate,
  NewsletterDailyArt,
  CategoryTable,
} from '@/lib/types'

const DISPLAY = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif"
const BODY = "Georgia, 'Times New Roman', serif"

interface Picks {
  watch: WatchCandidate | null
  news: AiNewsTop5 | null
  research: AiPaperCandidate | null
  story: StoryOfPastCandidate | null
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function TodayDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const today = searchParams.get('date') ?? getTodayDate()

  const [watches, setWatches] = useState<WatchCandidate[]>([])
  const [news, setNews] = useState<AiNewsTop5[]>([])
  const [research, setResearch] = useState<AiPaperCandidate[]>([])
  const [stories, setStories] = useState<StoryOfPastCandidate[]>([])
  const [art, setArt] = useState<NewsletterDailyArt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [picks, setPicks] = useState<Picks>({
    watch: null,
    news: null,
    research: null,
    story: null,
  })

  useEffect(() => {
    async function fetchAll() {
      try {
        const qs = `?date=${today}`
        const [wRes, nRes, rRes, sRes, aRes] = await Promise.all([
          fetch(`/api/today/watch${qs}`),
          fetch(`/api/today/news${qs}`),
          fetch(`/api/today/research${qs}`),
          fetch(`/api/today/story${qs}`),
          fetch(`/api/today/art${qs}`),
        ])
        const [wData, nData, rData, sData, aData] = await Promise.all([
          wRes.json(), nRes.json(), rRes.json(), sRes.json(), aRes.json(),
        ])
        if (wData.success) setWatches(wData.data)
        if (nData.success) setNews(nData.data)
        else setError(`News: ${nData.error}`)
        if (rData.success) setResearch(rData.data)
        if (sData.success) setStories(sData.data)
        if (aData.success) setArt(aData.data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load content')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handlePick = useCallback(async (
    table: CategoryTable,
    id: string,
    category: keyof Picks,
    item: WatchCandidate | AiNewsTop5 | AiPaperCandidate | StoryOfPastCandidate
  ) => {
    setPicks(prev => ({ ...prev, [category]: item }))
    try {
      const res = await fetch('/api/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, id }),
      })
      if (!res.ok) {
        setPicks(prev => ({ ...prev, [category]: null }))
      }
    } catch {
      setPicks(prev => ({ ...prev, [category]: null }))
    }
  }, [])

  const allPicked =
    picks.watch !== null &&
    picks.news !== null &&
    picks.research !== null &&
    picks.story !== null

  return (
    <div className="min-h-screen bg-page text-primary">

      {/* Header — ink masthead matching newsletter */}
      <header className="bg-ink sticky top-0 z-10">
        <div className="mx-auto max-w-screen-2xl px-6 py-4 flex items-center justify-between">
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
              Editorial Dashboard · {today}
            </p>
          </div>
          <button
            onClick={() => router.push(`/newsletter/${today}`)}
            disabled={!allPicked}
            className={`rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              allPicked
                ? 'bg-accent text-white hover:bg-accent/90'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
            style={{ fontFamily: BODY }}
          >
            {allPicked ? 'Go to Publish →' : `Pick all 4 to publish`}
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted text-sm animate-pulse" style={{ fontFamily: BODY }}>Loading today's content…</p>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-screen-2xl px-6 py-8">
          <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700 text-sm" style={{ fontFamily: BODY }}>
            {error}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="mx-auto max-w-screen-2xl px-6 py-8 flex gap-8">

          {/* Left: editorial columns */}
          <div className="flex-1 min-w-0">

            {/* Read */}
            <CategorySection label="One Article That Matters" isComplete={picks.news !== null}>
              {news.length === 0 && (
                <p className="text-xs text-muted italic" style={{ fontFamily: BODY }}>No news candidates for today.</p>
              )}
              {news.map(n => (
                <CandidateCard
                  key={n.id}
                  id={n.id}
                  title={n.title}
                  summary={n.summary}
                  whyItMatters={n.why_it_matters}
                  score={n.fit_score}
                  isPicked={picks.news?.id === n.id}
                  isAnyPicked={picks.news !== null}
                  onPick={() => handlePick('ai_news_top5', n.id, 'news', n)}
                  url={n.url}
                  meta={n.source}
                />
              ))}
            </CategorySection>

            {/* Research */}
            <CategorySection label="One Paper That Matters" isComplete={picks.research !== null}>
              {research.length === 0 && (
                <p className="text-xs text-muted italic" style={{ fontFamily: BODY }}>No research candidates for today.</p>
              )}
              {research.map(r => (
                <CandidateCard
                  key={r.id}
                  id={r.id}
                  title={r.title}
                  summary={r.summary_llm ?? ''}
                  whyItMatters={r.why_it_matters ?? ''}
                  score={r.fit_score}
                  isPicked={picks.research?.id === r.id}
                  isAnyPicked={picks.research !== null}
                  onPick={() => handlePick('ai_paper_candidates', r.id, 'research', r)}
                  url={r.pdf_url}
                  meta={r.authors}
                />
              ))}
            </CategorySection>

            {/* Watch */}
            <CategorySection label="One Video That Matters" isComplete={picks.watch !== null}>
              {watches.length === 0 && (
                <p className="text-xs text-muted italic" style={{ fontFamily: BODY }}>No watch candidates for today.</p>
              )}
              {watches.map(w => (
                <CandidateCard
                  key={w.id}
                  id={w.id}
                  title={w.title}
                  summary={w.summary}
                  whyItMatters={w.why_it_matters}
                  score={w.fit_score}
                  isPicked={picks.watch?.id === w.id}
                  isAnyPicked={picks.watch !== null}
                  onPick={() => handlePick('watch_candidates', w.id, 'watch', w)}
                  thumbnailUrl={w.thumbnail_url}
                  url={w.url}
                  meta={w.channel_name}
                />
              ))}
            </CategorySection>

            {/* Story */}
            <CategorySection label="One Thing That Mattered In The Past" isComplete={picks.story !== null}>
              {stories.length === 0 && (
                <p className="text-xs text-muted italic" style={{ fontFamily: BODY }}>No story candidates for today.</p>
              )}
              {stories.map(s => (
                <CandidateCard
                  key={s.id}
                  id={s.id}
                  title={s.this_time_line}
                  summary={s.event_summary}
                  whyItMatters={s.why_it_mattered}
                  score={s.fit_score}
                  isPicked={picks.story?.id === s.id}
                  isAnyPicked={picks.story !== null}
                  onPick={() => handlePick('stories_of_past_candidates', s.id, 'story', s)}
                />
              ))}
            </CategorySection>

            {/* Art (auto-included) */}
            {art && (
              <section className="mb-8">
                <div className="bg-ink px-6 py-3 flex items-center justify-between mb-3">
                  <p style={{
                    fontFamily: DISPLAY,
                    fontWeight: 900,
                    fontStyle: 'italic',
                    fontSize: '22px',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    lineHeight: 1,
                    color: '#FFFFFF',
                    margin: 0,
                  }}>
                    ◆&nbsp;Daily Art
                  </p>
                  <span className="text-xs font-bold text-white/60 uppercase tracking-widest" style={{ fontFamily: BODY }}>
                    auto-included
                  </span>
                </div>
                <div className="rounded border border-border bg-surface overflow-hidden">
                  <img src={art.image_url} alt={art.caption ?? ''} className="w-full max-h-48 object-cover" />
                  {(art.caption || art.artist_name) && (
                    <div className="px-4 py-2 text-xs text-muted italic" style={{ fontFamily: BODY }}>
                      {art.caption}{art.artist_name && ` — ${art.artist_name}`}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Right: newsletter preview */}
          <div className="w-80 flex-shrink-0 xl:w-96">
            <div className="sticky top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-ink mb-3" style={{ fontFamily: BODY, letterSpacing: '0.12em' }}>
                Newsletter Preview
              </p>
              <NewsletterPreview
                issueDate={today}
                watch={picks.watch}
                news={picks.news}
                research={picks.research}
                story={picks.story}
                art={art}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TodayPage() {
  return (
    <Suspense>
      <TodayDashboard />
    </Suspense>
  )
}
