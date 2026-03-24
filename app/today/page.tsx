'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

async function signOut(router: ReturnType<typeof useRouter>) {
  await fetch('/api/auth/logout', { method: 'POST' })
  router.push('/login')
}
import CandidateCard from '@/components/CandidateCard'
import CategorySection from '@/components/CategorySection'
import NewsletterPreview from '@/components/NewsletterPreview'
import QuoteCard from '@/components/QuoteCard'
import type {
  WatchCandidate,
  AiNewsTop5,
  AiPaperCandidate,
  StoryOfPastCandidate,
  NewsletterDailyArt,
  CategoryTable,
  DailyQuote,
} from '@/lib/types'

const DISPLAY = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif"
const BODY = "Georgia, 'Times New Roman', serif"

interface Picks {
  watch: WatchCandidate | null
  news: AiNewsTop5 | null
  research: AiPaperCandidate | null
  story: StoryOfPastCandidate | null
}

interface PickOverride {
  description?: string
  whyItMatters?: string
}
type Overrides = Record<string, PickOverride>

function applyOverrides(picks: Picks, overrides: Overrides): Picks {
  return {
    watch: picks.watch && overrides[picks.watch.id]
      ? { ...picks.watch, summary: overrides[picks.watch.id].description ?? picks.watch.summary, why_it_matters: overrides[picks.watch.id].whyItMatters ?? picks.watch.why_it_matters }
      : picks.watch,
    news: picks.news && overrides[picks.news.id]
      ? { ...picks.news, summary: overrides[picks.news.id].description ?? picks.news.summary, why_it_matters: overrides[picks.news.id].whyItMatters ?? picks.news.why_it_matters }
      : picks.news,
    research: picks.research && overrides[picks.research.id]
      ? { ...picks.research, summary_llm: overrides[picks.research.id].description ?? picks.research.summary_llm, why_it_matters: overrides[picks.research.id].whyItMatters ?? picks.research.why_it_matters }
      : picks.research,
    story: picks.story && overrides[picks.story.id]
      ? { ...picks.story, event_summary: overrides[picks.story.id].description ?? picks.story.event_summary, why_it_mattered: overrides[picks.story.id].whyItMatters ?? picks.story.why_it_mattered }
      : picks.story,
  }
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
  const [issueNumber, setIssueNumber] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [picks, setPicks] = useState<Picks>({
    watch: null,
    news: null,
    research: null,
    story: null,
  })

  const [artPicked, setArtPicked] = useState(false)
  const [artCropBottom, setArtCropBottom] = useState(0)
  const [overrides, setOverrides] = useState<Overrides>({})

  const handleEdit = useCallback((id: string, field: 'description' | 'whyItMatters', value: string) => {
    setOverrides(prev => {
      const next = { ...prev, [id]: { ...prev[id], [field]: value } }
      sessionStorage.setItem(`overrides-${today}`, JSON.stringify(next))
      return next
    })
  }, [today])

  const [quotes, setQuotes] = useState<DailyQuote[]>([])
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [quotesError, setQuotesError] = useState<string | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<DailyQuote | null>(null)
  const [customQuote, setCustomQuote] = useState('')
  const [customAuthor, setCustomAuthor] = useState('')

  useEffect(() => {
    async function fetchAll() {
      try {
        const qs = `?date=${today}`
        const [wRes, nRes, rRes, sRes, aRes, iRes] = await Promise.all([
          fetch(`/api/today/watch${qs}`),
          fetch(`/api/today/news${qs}`),
          fetch(`/api/today/research${qs}`),
          fetch(`/api/today/story${qs}`),
          fetch(`/api/today/art${qs}`),
          fetch(`/api/newsletter/issue-count?date=${today}`),
        ])
        const [wData, nData, rData, sData, aData, iData] = await Promise.all([
          wRes.json(), nRes.json(), rRes.json(), sRes.json(), aRes.json(), iRes.json(),
        ])
        if (wData.success) {
          setWatches(wData.data)
          const pickedWatch = wData.data.find((w: WatchCandidate) => w.picked)
          if (pickedWatch) setPicks(prev => ({ ...prev, watch: pickedWatch }))
        }
        if (nData.success) {
          setNews(nData.data)
          const pickedNews = nData.data.find((n: AiNewsTop5) => n.picked)
          if (pickedNews) setPicks(prev => ({ ...prev, news: pickedNews }))
        } else setError(`News: ${nData.error}`)
        if (rData.success) {
          setResearch(rData.data)
          const pickedResearch = rData.data.find((r: AiPaperCandidate) => r.picked)
          if (pickedResearch) setPicks(prev => ({ ...prev, research: pickedResearch }))
        }
        if (sData.success) {
          setStories(sData.data)
          const pickedStory = sData.data.find((s: StoryOfPastCandidate) => s.selected)
          if (pickedStory) setPicks(prev => ({ ...prev, story: pickedStory }))
        }
        if (aData.success) setArt(aData.data)
        setIssueNumber(iData.issueNumber ?? 1)
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

  const handleUnpick = useCallback(async (
    table: CategoryTable,
    id: string,
    category: keyof Picks,
  ) => {
    try {
      const res = await fetch('/api/pick', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, id }),
      })
      if (res.ok) {
        setPicks(prev => ({ ...prev, [category]: null }))
      } else {
        console.error('Unpick failed:', res.status, await res.text())
      }
    } catch (e) {
      console.error('Unpick error:', e)
    }
  }, [])

  const allPicked =
    picks.watch !== null &&
    picks.news !== null &&
    picks.research !== null &&
    artPicked

  const activeQuote: DailyQuote | null = selectedQuote ?? (
    customQuote.trim()
      ? { text: customQuote, author: customAuthor, attribution: '', relevance: '' }
      : null
  )

  useEffect(() => {
    if (!allPicked) return
    if (quotes.length > 0 || quotesLoading) return
    setQuotesLoading(true)
    fetch('/api/newsletter/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        watch: picks.watch,
        news: picks.news,
        research: picks.research,
        story: picks.story,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setQuotes(data.quotes)
        else setQuotesError(data.error ?? 'Failed to generate quotes')
      })
      .catch(e => setQuotesError(e instanceof Error ? e.message : 'Failed to generate quotes'))
      .finally(() => setQuotesLoading(false))
  }, [allPicked])

  useEffect(() => {
    if (activeQuote) {
      sessionStorage.setItem(`quote-${today}`, JSON.stringify(activeQuote))
    } else {
      sessionStorage.removeItem(`quote-${today}`)
    }
  }, [activeQuote, today])

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/analytics')}
              className="rounded px-3 py-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 transition-colors"
              style={{ fontFamily: BODY }}
            >
              Analytics →
            </button>
            <button
              onClick={() => signOut(router)}
              className="rounded px-3 py-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 transition-colors"
              style={{ fontFamily: BODY }}
            >
              Sign out
            </button>
            <button
              onClick={() => router.push(`/newsletter/${today}`)}
              disabled={!allPicked || !activeQuote}
              className={`rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                allPicked && activeQuote
                  ? 'bg-accent text-white hover:bg-accent/90'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
              style={{ fontFamily: BODY }}
            >
              {!allPicked ? 'Pick watch, read, research & art to publish' : !activeQuote ? 'Select a quote to publish' : 'Go to Publish →'}
            </button>
          </div>
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
                  score={n.score}
                  isPicked={picks.news?.id === n.id}
                  isAnyPicked={picks.news !== null}
                  onPick={() => handlePick('ai_news_top5', n.id, 'news', n)}
                  onUnpick={() => handleUnpick('ai_news_top5', n.id, 'news')}
                  url={n.url}
                  meta={n.source}
                  editedDescription={overrides[n.id]?.description}
                  editedWhyItMatters={overrides[n.id]?.whyItMatters}
                  onEdit={(field, value) => handleEdit(n.id, field, value)}
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
                  onUnpick={() => handleUnpick('ai_paper_candidates', r.id, 'research')}
                  url={r.pdf_url}
                  meta={r.authors}
                  editedDescription={overrides[r.id]?.description}
                  editedWhyItMatters={overrides[r.id]?.whyItMatters}
                  onEdit={(field, value) => handleEdit(r.id, field, value)}
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
                  onUnpick={() => handleUnpick('watch_candidates', w.id, 'watch')}
                  thumbnailUrl={w.thumbnail_url}
                  url={w.url}
                  meta={w.channel_name}
                  editedDescription={overrides[w.id]?.description}
                  editedWhyItMatters={overrides[w.id]?.whyItMatters}
                  onEdit={(field, value) => handleEdit(w.id, field, value)}
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
                  onUnpick={() => handleUnpick('stories_of_past_candidates', s.id, 'story')}
                  editedDescription={overrides[s.id]?.description}
                  editedWhyItMatters={overrides[s.id]?.whyItMatters}
                  onEdit={(field, value) => handleEdit(s.id, field, value)}
                />
              ))}
            </CategorySection>

            {/* Art */}
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
                </div>
                <div className={`rounded border bg-surface overflow-hidden transition-all duration-200 ${artPicked ? 'border-accent shadow-sm' : 'border-border hover:border-accent/50'}`}>
                  <img src={art.image_url} alt={art.caption ?? ''} className="w-full object-contain" />
                  {(art.caption || art.artist_name) && (
                    <div className="px-4 py-2 text-xs text-muted italic" style={{ fontFamily: BODY }}>
                      {art.caption}{art.artist_name && ` — ${art.artist_name}`}
                    </div>
                  )}
                  <div className="px-4 py-3 border-t border-border">
                    <div className="mb-3">
                      <label className="flex items-center justify-between text-xs text-muted mb-1" style={{ fontFamily: BODY }}>
                        <span className="font-bold uppercase tracking-widest">Crop from bottom</span>
                        <span>{artCropBottom > 0 ? `${artCropBottom}%` : 'None'}</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={70}
                        step={5}
                        value={artCropBottom}
                        onChange={e => {
                          const val = Number(e.target.value)
                          setArtCropBottom(val)
                          sessionStorage.setItem(`art-crop-${today}`, String(val))
                        }}
                        className="w-full accent-accent"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (artPicked) {
                            setArtPicked(false)
                            sessionStorage.removeItem(`art-${today}`)
                          } else {
                            setArtPicked(true)
                            sessionStorage.setItem(`art-${today}`, art.id)
                          }
                        }}
                        className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                          artPicked
                            ? 'bg-accent text-white hover:bg-accent/60'
                            : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'
                        }`}
                        style={{ fontFamily: BODY }}
                      >
                        {artPicked ? '✓ Picked' : 'Pick'}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
            {/* Quote of the Day — appears once all 4 are picked */}
            {allPicked && (
              <section className="mb-8">
                <div className="bg-accent px-6 py-3 flex items-center justify-between mb-3">
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
                    ◆&nbsp;Quote of the Day
                  </p>
                </div>

                {quotesLoading && (
                  <p className="text-xs text-muted italic animate-pulse py-4 text-center" style={{ fontFamily: BODY }}>
                    Generating quotes…
                  </p>
                )}

                {!quotesLoading && quotesError && (
                  <p className="text-xs text-red-600 py-2" style={{ fontFamily: BODY }}>
                    Quote generation failed: {quotesError}
                  </p>
                )}

                {!quotesLoading && quotes.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {quotes.map((q, i) => (
                      <QuoteCard
                        key={i}
                        quote={q}
                        isPicked={selectedQuote === q}
                        isAnyPicked={selectedQuote !== null || customQuote.trim() !== ''}
                        onPick={() => {
                          setSelectedQuote(q)
                          setCustomQuote('')
                          setCustomAuthor('')
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2" style={{ fontFamily: BODY, letterSpacing: '0.10em' }}>
                    None of these? Write your own:
                  </p>
                  <textarea
                    value={customQuote}
                    onChange={e => {
                      setCustomQuote(e.target.value)
                      setSelectedQuote(null)
                    }}
                    placeholder="Quote text…"
                    rows={3}
                    className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-primary placeholder-muted/50 focus:outline-none focus:border-accent/60 resize-none mb-2"
                    style={{ fontFamily: BODY }}
                  />
                  <input
                    value={customAuthor}
                    onChange={e => setCustomAuthor(e.target.value)}
                    placeholder="Author, Role — Context/year"
                    className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-primary placeholder-muted/50 focus:outline-none focus:border-accent/60"
                    style={{ fontFamily: BODY }}
                  />
                </div>
              </section>
            )}
          </div>

          {/* Right: newsletter preview */}
          <div className="w-80 flex-shrink-0 xl:w-96">
            <div className="sticky top-24 flex flex-col" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-ink mb-3 flex-shrink-0" style={{ fontFamily: BODY, letterSpacing: '0.12em' }}>
                Newsletter Preview
              </p>
              <div className="overflow-y-auto flex-1">
              <NewsletterPreview
                issueDate={today}
                issueNumber={issueNumber}
                watch={applyOverrides(picks, overrides).watch}
                news={applyOverrides(picks, overrides).news}
                research={applyOverrides(picks, overrides).research}
                story={applyOverrides(picks, overrides).story}
                art={artPicked ? art : null}
                artCropBottom={artCropBottom}
                quote={activeQuote}
              />
              </div>
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
