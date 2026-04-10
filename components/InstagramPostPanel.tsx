'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  WatchCandidate,
  AiNewsTop5,
  AiPaperCandidate,
  StoryOfPastCandidate,
  InstagramLeadCategory,
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
  compositeUrl: string | null
  caption: string
}

export default function InstagramPostPanel({ date, picks }: InstagramPostPanelProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [leadCategory, setLeadCategory] = useState<InstagramLeadCategory | null>(null)
  const [visualPrompt, setVisualPrompt] = useState('')
  const [promptStatus, setPromptStatus] = useState<StepStatus>('idle')
  const [dalleImageUrl, setDalleImageUrl] = useState<string | null>(null)
  const [imageStatus, setImageStatus] = useState<StepStatus>('idle')
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null)
  const [compositeStatus, setCompositeStatus] = useState<StepStatus>('idle')
  const [caption, setCaption] = useState('')
  const [captionStatus, setCaptionStatus] = useState<StepStatus>('idle')
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const sessionKey = `instagram-${date}`

  // Restore from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(sessionKey)
    if (stored) {
      try {
        const s = JSON.parse(stored) as SessionState
        if (s.leadCategory) setLeadCategory(s.leadCategory)
        if (s.visualPrompt) setVisualPrompt(s.visualPrompt)
        if (s.dalleImageUrl) setDalleImageUrl(s.dalleImageUrl)
        if (s.compositeUrl) setCompositeUrl(s.compositeUrl)
        if (s.caption) setCaption(s.caption)
        if (s.compositeUrl || s.dalleImageUrl || s.visualPrompt) {
          setCollapsed(false)
          setPromptStatus(s.visualPrompt ? 'done' : 'idle')
          setImageStatus(s.dalleImageUrl ? 'done' : 'idle')
          setCompositeStatus(s.compositeUrl ? 'done' : 'idle')
          setCaptionStatus(s.caption ? 'done' : 'idle')
        }
      } catch { /* ignore */ }
    }
  }, [sessionKey])

  const persist = useCallback(
    (patch: Partial<SessionState>) => {
      const current: SessionState = {
        leadCategory,
        visualPrompt,
        dalleImageUrl,
        compositeUrl,
        caption,
        ...patch,
      }
      sessionStorage.setItem(sessionKey, JSON.stringify(current))
    },
    [sessionKey, leadCategory, visualPrompt, dalleImageUrl, compositeUrl, caption],
  )

  async function handleGeneratePrompt() {
    if (!leadCategory) return
    const details = getPickDetails(leadCategory, picks)
    if (!details) return

    setPromptStatus('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/instagram/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      })
      const data = await res.json() as { success: boolean; visualPrompt?: string; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to generate prompt')
      setVisualPrompt(data.visualPrompt ?? '')
      setPromptStatus('done')
      // Reset downstream
      setDalleImageUrl(null)
      setImageStatus('idle')
      setCompositeUrl(null)
      setCompositeStatus('idle')
      persist({ visualPrompt: data.visualPrompt ?? '', dalleImageUrl: null, compositeUrl: null })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error')
      setPromptStatus('error')
    }
  }

  async function handleGenerateImage() {
    if (!visualPrompt) return
    setImageStatus('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/instagram/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visualPrompt }),
      })
      const data = await res.json() as { success: boolean; imageUrl?: string; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to generate image')
      setDalleImageUrl(data.imageUrl ?? null)
      setImageStatus('done')
      // Reset downstream
      setCompositeUrl(null)
      setCompositeStatus('idle')
      persist({ dalleImageUrl: data.imageUrl ?? null, compositeUrl: null })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error')
      setImageStatus('error')
    }
  }

  async function handleComposite() {
    if (!dalleImageUrl || !leadCategory) return
    const details = getPickDetails(leadCategory, picks)
    if (!details) return

    setCompositeStatus('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/instagram/composite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dalleImageUrl,
          headline: details.title,
          teaser: details.summary.split(/[.!?]/)[0] + '.',
          categoryTag: CATEGORY_LABELS[leadCategory],
          date,
        }),
      })
      const data = await res.json() as { success: boolean; compositeImageUrl?: string; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to create composite')
      setCompositeUrl(data.compositeImageUrl ?? null)
      setCompositeStatus('done')
      persist({ compositeUrl: data.compositeImageUrl ?? null })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error')
      setCompositeStatus('error')
    }
  }

  async function handleGenerateCaption() {
    if (!leadCategory) return
    const details = getPickDetails(leadCategory, picks)
    if (!details) return

    setCaptionStatus('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/instagram/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadCategory, ...details }),
      })
      const data = await res.json() as { success: boolean; caption?: string; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to generate caption')
      setCaption(data.caption ?? '')
      setCaptionStatus('done')
      persist({ caption: data.caption ?? '' })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error')
      setCaptionStatus('error')
    }
  }

  async function copyCaption() {
    await navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const categories: InstagramLeadCategory[] = ['watch', 'news', 'research', 'story']

  return (
    <div className="mt-8">
      {/* Section header — collapsible */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-4 group"
      >
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: '#E8522E', fontFamily: BODY, letterSpacing: '0.12em' }}
        >
          Instagram Post
        </span>
        <span className="text-muted text-xs group-hover:text-primary transition-colors">
          {collapsed ? '+ expand' : '- collapse'}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-6">
          {/* Error display */}
          {errorMsg && (
            <div
              className="rounded border border-red-300 bg-red-50 p-3 text-red-700 text-sm"
              style={{ fontFamily: BODY }}
            >
              {errorMsg}
            </div>
          )}

          {/* Step 0: Lead picker */}
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-widest text-ink mb-2"
              style={{ fontFamily: BODY, letterSpacing: '0.12em' }}
            >
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
                      persist({ leadCategory: cat })
                      // Reset everything when lead changes
                      setVisualPrompt('')
                      setPromptStatus('idle')
                      setDalleImageUrl(null)
                      setImageStatus('idle')
                      setCompositeUrl(null)
                      setCompositeStatus('idle')
                      setCaption('')
                      setCaptionStatus('idle')
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
                <label
                  className="block text-xs font-bold uppercase tracking-widest text-ink"
                  style={{ fontFamily: BODY, letterSpacing: '0.12em' }}
                >
                  Visual Prompt
                </label>
                <button
                  onClick={handleGeneratePrompt}
                  disabled={promptStatus === 'loading'}
                  className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    promptStatus === 'loading'
                      ? 'bg-white/10 text-muted cursor-wait'
                      : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  {promptStatus === 'loading'
                    ? 'Generating...'
                    : visualPrompt
                      ? 'Regenerate Prompt'
                      : 'Generate Prompt'}
                </button>
              </div>
              {visualPrompt && (
                <textarea
                  value={visualPrompt}
                  onChange={e => {
                    setVisualPrompt(e.target.value)
                    persist({ visualPrompt: e.target.value })
                  }}
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
                <label
                  className="block text-xs font-bold uppercase tracking-widest text-ink"
                  style={{ fontFamily: BODY, letterSpacing: '0.12em' }}
                >
                  AI Image
                </label>
                <button
                  onClick={handleGenerateImage}
                  disabled={imageStatus === 'loading'}
                  className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    imageStatus === 'loading'
                      ? 'bg-white/10 text-muted cursor-wait'
                      : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  {imageStatus === 'loading'
                    ? 'Generating (~15s)...'
                    : dalleImageUrl
                      ? 'Regenerate Image'
                      : 'Generate Image'}
                </button>
              </div>
              {dalleImageUrl && (
                <div className="rounded border border-border overflow-hidden inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dalleImageUrl}
                    alt="DALL-E preview"
                    className="block"
                    style={{ width: '300px', height: '300px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Composite */}
          {imageStatus === 'done' && dalleImageUrl && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-xs font-bold uppercase tracking-widest text-ink"
                  style={{ fontFamily: BODY, letterSpacing: '0.12em' }}
                >
                  Instagram Post
                </label>
                <button
                  onClick={handleComposite}
                  disabled={compositeStatus === 'loading'}
                  className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    compositeStatus === 'loading'
                      ? 'bg-white/10 text-muted cursor-wait'
                      : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  {compositeStatus === 'loading'
                    ? 'Creating...'
                    : compositeUrl
                      ? 'Recreate Post'
                      : 'Create Instagram Post'}
                </button>
              </div>
              {compositeUrl && (
                <div className="space-y-3">
                  <div className="rounded border border-border overflow-hidden inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={compositeUrl}
                      alt="Instagram post preview"
                      className="block"
                      style={{ width: '324px', height: '405px', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <a
                      href={compositeUrl}
                      download={`instagram-${date}.png`}
                      className="inline-block rounded px-4 py-2 text-xs font-bold uppercase tracking-wider bg-ink text-white hover:bg-ink/90 transition-colors"
                      style={{ fontFamily: BODY }}
                    >
                      Download PNG
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Caption */}
          {leadCategory && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-xs font-bold uppercase tracking-widest text-ink"
                  style={{ fontFamily: BODY, letterSpacing: '0.12em' }}
                >
                  Caption
                </label>
                <button
                  onClick={handleGenerateCaption}
                  disabled={captionStatus === 'loading'}
                  className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    captionStatus === 'loading'
                      ? 'bg-white/10 text-muted cursor-wait'
                      : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  {captionStatus === 'loading'
                    ? 'Generating...'
                    : caption
                      ? 'Regenerate Caption'
                      : 'Generate Caption'}
                </button>
              </div>
              {caption && (
                <div className="space-y-2">
                  <textarea
                    value={caption}
                    onChange={e => {
                      setCaption(e.target.value)
                      persist({ caption: e.target.value })
                    }}
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
