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
  editedDescription?: string
  editedWhyItMatters?: string
  onEdit?: (field: 'description' | 'whyItMatters', value: string) => void
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
  editedDescription,
  editedWhyItMatters,
  onEdit,
}: CandidateCardProps) {
  const dimmed = isAnyPicked && !isPicked
  const [expanded, setExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const SUMMARY_LINES = 3
  const WHY_LINES = 2

  const displaySummary = editedDescription ?? summary
  const displayWhy = editedWhyItMatters ?? whyItMatters

  // Rough heuristic: only show toggle if text is likely truncated
  const summaryLong = displaySummary.length > 200
  const whyLong = displayWhy.length > 120

  const hasEdits = editedDescription !== undefined || editedWhyItMatters !== undefined

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

          {isEditing ? (
            <div className="mt-2 flex flex-col gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-1" style={{ fontFamily: BODY }}>Description</label>
                <textarea
                  value={editedDescription ?? summary}
                  onChange={e => onEdit?.('description', e.target.value)}
                  rows={4}
                  className="w-full rounded border border-border bg-page px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent/60 resize-y"
                  style={{ fontFamily: BODY }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-1" style={{ fontFamily: BODY }}>Why it matters</label>
                <textarea
                  value={editedWhyItMatters ?? whyItMatters}
                  onChange={e => onEdit?.('whyItMatters', e.target.value)}
                  rows={4}
                  className="w-full rounded border border-border bg-page px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent/60 resize-y"
                  style={{ fontFamily: BODY }}
                />
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="self-end text-xs text-accent hover:underline focus:outline-none"
                style={{ fontFamily: BODY }}
              >
                Done editing
              </button>
            </div>
          ) : (
            <>
              <p
                className={`mt-1.5 text-sm text-primary/70 ${expanded ? '' : `line-clamp-${SUMMARY_LINES}`}`}
                style={{ fontFamily: BODY }}
              >
                <span className="font-semibold">Description: </span>{displaySummary}
              </p>

              <p
                className={`mt-1 text-sm text-accent italic ${expanded ? '' : `line-clamp-${WHY_LINES}`}`}
                style={{ fontFamily: BODY }}
              >
                <span className="font-semibold">Why this Matters: </span>{displayWhy}
              </p>

              <div className="mt-1 flex items-center gap-3">
                {(summaryLong || whyLong) && (
                  <button
                    onClick={() => setExpanded(e => !e)}
                    className="text-xs text-accent hover:underline focus:outline-none"
                    style={{ fontFamily: BODY }}
                  >
                    {expanded ? 'less ↑' : 'more ↓'}
                  </button>
                )}
                {isPicked && onEdit && (
                  <button
                    onClick={() => { setExpanded(true); setIsEditing(true) }}
                    className={`text-xs hover:underline focus:outline-none ${hasEdits ? 'text-accent font-semibold' : 'text-muted'}`}
                    style={{ fontFamily: BODY }}
                  >
                    {hasEdits ? '✎ edited' : '✎ edit text'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {!isEditing && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => isPicked ? onUnpick?.() : onPick(id)}
            disabled={!isPicked && dimmed}
            className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              isPicked
                ? 'bg-accent/15 text-accent border border-accent hover:bg-red-100 hover:text-red-600 hover:border-red-400'
                : dimmed
                ? 'cursor-not-allowed'
                : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'
            }`}
            style={{ fontFamily: BODY }}
          >
            {isPicked ? '✓ Picked — click to unpick' : 'Pick'}
          </button>
        </div>
      )}
    </div>
  )
}
