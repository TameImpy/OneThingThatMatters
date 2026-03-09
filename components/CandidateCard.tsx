'use client'

import { useState } from 'react'

const BODY = "Georgia, 'Times New Roman', serif"

interface CandidateCardProps {
  id: string
  title: string
  summary: string
  whyItMatters: string
  score: number | null
  isPicked: boolean
  isAnyPicked: boolean
  onPick: (id: string) => void
  onUnpick?: () => void
  thumbnailUrl?: string | null
  url?: string | null
  meta?: string | null
}

export default function CandidateCard({
  id,
  title,
  summary,
  whyItMatters,
  score,
  isPicked,
  isAnyPicked,
  onPick,
  onUnpick,
  thumbnailUrl,
  url,
  meta,
}: CandidateCardProps) {
  const dimmed = isAnyPicked && !isPicked
  const [expanded, setExpanded] = useState(false)

  const SUMMARY_LINES = 3
  const WHY_LINES = 2

  // Rough heuristic: only show toggle if text is likely truncated
  const summaryLong = summary.length > 200
  const whyLong = whyItMatters.length > 120

  return (
    <div
      className={`rounded border p-5 bg-surface transition-all duration-200 ${
        isPicked
          ? 'border-accent shadow-sm'
          : dimmed
          ? 'border-border opacity-40'
          : 'border-border hover:border-accent/50'
      }`}
    >
      <div className="flex gap-3">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt=""
            className="h-20 w-32 flex-shrink-0 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-primary leading-snug" style={{ fontFamily: BODY }}>
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-sky">
                  {title}
                </a>
              ) : (
                title
              )}
            </h3>
            {score !== null && score !== undefined && (
              <span className="flex-shrink-0 rounded-full bg-sky text-white px-3 py-1 text-sm font-bold" style={{ fontFamily: BODY }}>
                {score}
              </span>
            )}
          </div>
          {meta && <p className="mt-0.5 text-xs text-muted" style={{ fontFamily: BODY }}>{meta}</p>}

          <p
            className={`mt-1.5 text-sm text-primary/70 ${expanded ? '' : `line-clamp-${SUMMARY_LINES}`}`}
            style={{ fontFamily: BODY }}
          >
            <span className="font-semibold">Description: </span>{summary}
          </p>

          <p
            className={`mt-1 text-sm text-accent italic ${expanded ? '' : `line-clamp-${WHY_LINES}`}`}
            style={{ fontFamily: BODY }}
          >
            <span className="font-semibold">Why this Matters: </span>{whyItMatters}
          </p>

          {(summaryLong || whyLong) && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-1 text-xs text-accent hover:underline focus:outline-none"
              style={{ fontFamily: BODY }}
            >
              {expanded ? 'less ↑' : 'more ↓'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => isPicked ? onUnpick?.() : onPick(id)}
          disabled={!isPicked && dimmed}
          className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            isPicked
              ? 'bg-accent text-white hover:bg-accent/60'
              : dimmed
              ? 'cursor-not-allowed'
              : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'
          }`}
          style={{ fontFamily: BODY }}
        >
          {isPicked ? '✓ Picked' : 'Pick'}
        </button>
      </div>
    </div>
  )
}
