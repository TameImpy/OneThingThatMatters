'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  WatchCandidate,
  AiNewsTop5,
  AiPaperCandidate,
  StoryOfPastCandidate,
  InstagramLeadCategory,
  InstagramSlideTexts,
} from '@/lib/types'

const BODY = "Georgia, 'Times New Roman', serif"

interface InstagramPostPanelProps {
  date: string
  picks: {
    watch: WatchCandidate | null
    news: AiNewsTop5 | null
    research: AiPaperCandidate | null
    story: StoryOfPastCandidate | null
  }
}

const CATEGORY_LABELS: Record<InstagramLeadCategory, string> = {
  watch: "TODAY'S WATCH",
  news: "TODAY'S READ",
  research: "TODAY'S RESEARCH",
  story: "TODAY'S STORY",
}

function getPickDetails(
  category: InstagramLeadCategory,
  picks: InstagramPostPanelProps['picks'],
): { title: string; summary: string; whyItMatters: string } | null {
  switch (category) {
    case 'watch':
      return picks.watch
        ? { title: picks.watch.title, summary: picks.watch.summary, whyItMatters: picks.watch.why_it_matters }
        : null
    case 'news':
      return picks.news
        ? { title: picks.news.title, summary: picks.news.summary, whyItMatters: picks.news.why_it_matters }
        : null
    case 'research':
      return picks.research
        ? { title: picks.research.title, summary: picks.research.summary_llm ?? '', whyItMatters: picks.research.why_it_matters ?? '' }
        : null
    case 'story':
      return picks.story
        ? { title: picks.story.this_time_line, summary: picks.story.event_summary, whyItMatters: picks.story.why_it_mattered }
        : null
  }
}

type StepStatus = 'idle' | 'loading' | 'done' | 'error'

interface SessionState {
  leadCategory: InstagramLeadCategory | null
  visualPrompt: string
  dalleImageUrl: string | null
  slides: InstagramSlideTexts | null
  slideUrls: string[] | null
  zipUrl: string | null
  caption: string
}

export default function InstagramPostPanel({ date, picks }: InstagramPostPanelProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [leadCategory, setLeadCategory] = useState<InstagramLeadCategory | null>(null)
  const [visualPrompt, setVisualPrompt] = useState('')
  const [promptStatus, setPromptStatus] = useState<StepStatus>('idle')
  const [dalleImageUrl, setDalleImageUrl] = useState<string | null>(null)
  const [imageStatus, setImageStatus] = useState<StepStatus>('idle')
  const [slides, setSlides] = useState<InstagramSlideTexts | null>(null)
  const [slidesStatus, setSlidesStatus] = useState<StepStatus>('idle')
  const [slideUrls, setSlideUrls] = useState<string[] | null>(null)
  const [zipUrl, setZipUrl] = useState<string | null>(null)
  const [carouselStatus, setCarouselStatus] = useState<StepStatus>('idle')
  const [caption, setCaption] = useState('')
  const [captionStatus, setCaptionStatus] = useState<StepStatus>('idle')
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const sessionKey = `instagram-${date}`

  useEffect(() => {
    const stored = sessionStorage.getItem(sessionKey)
    if (stored) {
      try {
        const s = JSON.parse(stored) as SessionState
        if (s.leadCategory) setLeadCategory(s.leadCategory)
        if (s.visualPrompt) { setVisualPrompt(s.visualPrompt); setPromptStatus('done') }
        if (s.dalleImageUrl) { setDalleImageUrl(s.dalleImageUrl); setImageStatus('done') }
        if (s.slides) { setSlides(s.slides); setSlidesStatus('done') }
        if (s.slideUrls) { setSlideUrls(s.slideUrls); setCarouselStatus('done') }
        if (s.zipUrl) setZipUrl(s.zipUrl)
        if (s.caption) { setCaption(s.caption); setCaptionStatus('done') }
        if (s.visualPrompt || s.dalleImageUrl || s.slides || s.slideUrls) setCollapsed(false)
      } catch { /* ignore */ }
    }
  }, [sessionKey])

  const persist = useCallback(
    (patch: Partial<SessionState>) => {
      const current: SessionState = {
        leadCategory, visualPrompt, dalleImageUrl, slides, slideUrls, zipUrl, caption,
        ...patch,
      }
      sessionStorage.setItem(sessionKey, JSON.stringify(current))
    },
    [sessionKey, leadCategory, visualPrompt, dalleImageUrl, slides, slideUrls, zipUrl, caption],
  )

  function resetFrom(step: 'prompt' | 'image' | 'slides' | 'carousel') {
    if (step === 'prompt') {
      setVisualPrompt(''); setPromptStatus('idle')
      setDalleImageUrl(null); setImageStatus('idle')
    }
    if (step === 'prompt' || step === 'image') {
      // Image change only resets carousel, not slides
    }
    if (step === 'prompt' || step === 'slides') {
      setSlides(null); setSlidesStatus('idle')
    }
    if (step === 'prompt' || step === 'image' || step === 'slides' || step === 'carousel') {
      setSlideUrls(null); setZipUrl(null); setCarouselStatus('idle')
    }
    setCaption(''); setCaptionStatus('idle')
  }

  async function handleGeneratePrompt() {
    if (!leadCategory) return
    const details = getPickDetails(leadCategory, picks)
    if (!details) return
    setPromptStatus('loading'); setErrorMsg(null)
    try {
      const res = await fetch('/api/instagram/generate-prompt', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      })
      const data = await res.json() as { success: boolean; visualPrompt?: string; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed')
      setVisualPrompt(data.visualPrompt ?? ''); setPromptStatus('done')
      setDalleImageUrl(null); setImageStatus('idle')
      setSlideUrls(null); setZipUrl(null); setCarouselStatus('idle')
      persist({ visualPrompt: data.visualPrompt ?? '', dalleImageUrl: null, slideUrls: null, zipUrl: null })
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : 'Error'); setPromptStatus('error') }
  }

  async function handleGenerateImage() {
    if (!visualPrompt) return
    setImageStatus('loading'); setErrorMsg(null)
    try {
      const res = await fetch('/api/instagram/generate-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visualPrompt }),
      })
      const data = await res.json() as { success: boolean; imageUrl?: string; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed')
      setDalleImageUrl(data.imageUrl ?? null); setImageStatus('done')
      setSlideUrls(null); setZipUrl(null); setCarouselStatus('idle')
      persist({ dalleImageUrl: data.imageUrl ?? null, slideUrls: null, zipUrl: null })
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : 'Error'); setImageStatus('error') }
  }

  async function handleGenerateSlides() {
    if (!leadCategory) return
    const details = getPickDetails(leadCategory, picks)
    if (!details) return
    setSlidesStatus('loading'); setErrorMsg(null)
    try {
      const res = await fetch('/api/instagram/generate-slides', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      })
      const data = await res.json() as { success: boolean; slides?: InstagramSlideTexts; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed')
      setSlides(data.slides ?? null); setSlidesStatus('done')
      setSlideUrls(null); setZipUrl(null); setCarouselStatus('idle')
      persist({ slides: data.slides ?? null, slideUrls: null, zipUrl: null })
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : 'Error'); setSlidesStatus('error') }
  }

  async function handleCreateCarousel() {
    if (!dalleImageUrl || !slides || !leadCategory) return
    setCarouselStatus('loading'); setErrorMsg(null)
    try {
      const res = await fetch('/api/instagram/composite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dalleImageUrl, slides,
          categoryTag: CATEGORY_LABELS[leadCategory],
          date,
        }),
      })
      const data = await res.json() as { success: boolean; slideUrls?: string[]; zipUrl?: string; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed')
      setSlideUrls(data.slideUrls ?? null); setZipUrl(data.zipUrl ?? null); setCarouselStatus('done')
      persist({ slideUrls: data.slideUrls ?? null, zipUrl: data.zipUrl ?? null })
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : 'Error'); setCarouselStatus('error') }
  }

  async function handleGenerateCaption() {
    if (!leadCategory) return
    const details = getPickDetails(leadCategory, picks)
    if (!details) return
    setCaptionStatus('loading'); setErrorMsg(null)
    try {
      const res = await fetch('/api/instagram/generate-caption', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadCategory, ...details }),
      })
      const data = await res.json() as { success: boolean; caption?: string; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed')
      setCaption(data.caption ?? ''); setCaptionStatus('done')
      persist({ caption: data.caption ?? '' })
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : 'Error'); setCaptionStatus('error') }
  }

  async function downloadZip() {
    if (!zipUrl) return
    const res = await fetch(zipUrl)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `instagram-${date}-carousel.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function copyCaption() {
    await navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function updateSlideField(field: keyof InstagramSlideTexts, value: string) {
    if (!slides) return
    const updated = { ...slides, [field]: value }
    setSlides(updated)
    setSlideUrls(null); setZipUrl(null); setCarouselStatus('idle')
    persist({ slides: updated, slideUrls: null, zipUrl: null })
  }

  const categories: InstagramLeadCategory[] = ['watch', 'news', 'research', 'story']
  const SLIDE_LABELS: Record<keyof InstagramSlideTexts, string> = {
    slide1Hook: 'Slide 1 — Hook',
    slide2Fact: 'Slide 2 — Key Fact',
    slide3Insight: 'Slide 3 — Insight',
    slide4Takeaway: 'Slide 4 — Takeaway',
  }

  return (
    <div className="mt-8">
      <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 mb-4 group">
        <span className="text-xs uppercase tracking-widest" style={{ color: '#E8522E', fontFamily: BODY, letterSpacing: '0.12em' }}>
          Instagram Carousel
        </span>
        <span className="text-muted text-xs group-hover:text-primary transition-colors">
          {collapsed ? '+ expand' : '- collapse'}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-6">
          {errorMsg && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-red-700 text-sm" style={{ fontFamily: BODY }}>
              {errorMsg}
            </div>
          )}

          {/* Step 0: Lead picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-ink mb-2" style={{ fontFamily: BODY, letterSpacing: '0.12em' }}>
              Select Lead Story
            </label>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => {
                const available = cat === 'watch' ? picks.watch : cat === 'news' ? picks.news : cat === 'research' ? picks.research : picks.story
                return (
                  <button
                    key={cat}
                    disabled={!available}
                    onClick={() => {
                      setLeadCategory(cat)
                      resetFrom('prompt')
                      persist({ leadCategory: cat, visualPrompt: '', dalleImageUrl: null, slides: null, slideUrls: null, zipUrl: null, caption: '' })
                    }}
                    className={`rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                      leadCategory === cat
                        ? 'bg-accent text-white'
                        : available
                          ? 'bg-surface text-primary border border-border hover:border-accent/40'
                          : 'bg-surface/50 text-muted/40 cursor-not-allowed border border-border/50'
                    }`}
                    style={{ fontFamily: BODY }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 1: Visual Prompt */}
          {leadCategory && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-ink" style={{ fontFamily: BODY, letterSpacing: '0.12em' }}>
                  Visual Prompt
                </label>
                <button
                  onClick={handleGeneratePrompt}
                  disabled={promptStatus === 'loading'}
                  className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    promptStatus === 'loading' ? 'bg-white/10 text-muted cursor-wait' : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  {promptStatus === 'loading' ? 'Generating...' : visualPrompt ? 'Regenerate' : 'Generate Prompt'}
                </button>
              </div>
              {visualPrompt && (
                <textarea
                  value={visualPrompt}
                  onChange={e => { setVisualPrompt(e.target.value); persist({ visualPrompt: e.target.value }) }}
                  rows={3}
                  className="w-full rounded border border-border bg-surface px-4 py-3 text-sm text-primary placeholder-muted/50 focus:outline-none focus:border-accent/60 resize-none"
                  style={{ fontFamily: BODY }}
                />
              )}
            </div>
          )}

          {/* Step 2: Generate Image */}
          {promptStatus === 'done' && visualPrompt && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-ink" style={{ fontFamily: BODY, letterSpacing: '0.12em' }}>
                  AI Image (Slide 1)
                </label>
                <button
                  onClick={handleGenerateImage}
                  disabled={imageStatus === 'loading'}
                  className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    imageStatus === 'loading' ? 'bg-white/10 text-muted cursor-wait' : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  {imageStatus === 'loading' ? 'Generating (~15s)...' : dalleImageUrl ? 'Regenerate' : 'Generate Image'}
                </button>
              </div>
              {dalleImageUrl && (
                <div className="rounded border border-border overflow-hidden inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dalleImageUrl} alt="DALL-E preview" className="block" style={{ width: '240px', height: '240px', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Slide Text */}
          {leadCategory && promptStatus === 'done' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-ink" style={{ fontFamily: BODY, letterSpacing: '0.12em' }}>
                  Slide Text
                </label>
                <button
                  onClick={handleGenerateSlides}
                  disabled={slidesStatus === 'loading'}
                  className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    slidesStatus === 'loading' ? 'bg-white/10 text-muted cursor-wait' : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  {slidesStatus === 'loading' ? 'Generating...' : slides ? 'Regenerate' : 'Generate Slides'}
                </button>
              </div>
              {slides && (
                <div className="space-y-3">
                  {(Object.keys(SLIDE_LABELS) as (keyof InstagramSlideTexts)[]).map(field => (
                    <div key={field}>
                      <label className="block text-xs text-muted mb-1" style={{ fontFamily: BODY }}>{SLIDE_LABELS[field]}</label>
                      <textarea
                        value={slides[field]}
                        onChange={e => updateSlideField(field, e.target.value)}
                        rows={2}
                        className="w-full rounded border border-border bg-surface px-4 py-2 text-sm text-primary focus:outline-none focus:border-accent/60 resize-none"
                        style={{ fontFamily: BODY }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Create Carousel */}
          {imageStatus === 'done' && slidesStatus === 'done' && dalleImageUrl && slides && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-ink" style={{ fontFamily: BODY, letterSpacing: '0.12em' }}>
                  Carousel Preview
                </label>
                <button
                  onClick={handleCreateCarousel}
                  disabled={carouselStatus === 'loading'}
                  className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    carouselStatus === 'loading' ? 'bg-white/10 text-muted cursor-wait' : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  {carouselStatus === 'loading' ? 'Creating...' : slideUrls ? 'Recreate' : 'Create Carousel'}
                </button>
              </div>
              {slideUrls && (
                <div className="space-y-3">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {slideUrls.map((url, i) => (
                      <div key={i} className="rounded border border-border overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Slide ${i + 1}`} className="block" style={{ width: '216px', height: '270px', objectFit: 'contain' }} />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={downloadZip}
                    className="rounded px-4 py-2 text-xs font-bold uppercase tracking-wider bg-ink text-white hover:bg-ink/90 transition-colors"
                    style={{ fontFamily: BODY }}
                  >
                    Download ZIP (4 slides)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Caption */}
          {leadCategory && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-ink" style={{ fontFamily: BODY, letterSpacing: '0.12em' }}>
                  Caption
                </label>
                <button
                  onClick={handleGenerateCaption}
                  disabled={captionStatus === 'loading'}
                  className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    captionStatus === 'loading' ? 'bg-white/10 text-muted cursor-wait' : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  {captionStatus === 'loading' ? 'Generating...' : caption ? 'Regenerate' : 'Generate Caption'}
                </button>
              </div>
              {caption && (
                <div className="space-y-2">
                  <textarea
                    value={caption}
                    onChange={e => { setCaption(e.target.value); persist({ caption: e.target.value }) }}
                    rows={6}
                    className="w-full rounded border border-border bg-surface px-4 py-3 text-sm text-primary placeholder-muted/50 focus:outline-none focus:border-accent/60 resize-none"
                    style={{ fontFamily: BODY }}
                  />
                  <button
                    onClick={copyCaption}
                    className="rounded px-4 py-2 text-xs font-bold uppercase tracking-wider bg-ink text-white hover:bg-ink/90 transition-colors"
                    style={{ fontFamily: BODY }}
                  >
                    {copied ? 'Copied!' : 'Copy Caption'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
