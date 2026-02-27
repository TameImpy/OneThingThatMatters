'use client'

import type { DailyQuote } from '@/lib/types'

const BODY = "Georgia, 'Times New Roman', serif"

interface QuoteCardProps {
  quote: DailyQuote
  isPicked: boolean
  isAnyPicked: boolean
  onPick: () => void
}

export default function QuoteCard({ quote, isPicked, isAnyPicked, onPick }: QuoteCardProps) {
  const dimmed = isAnyPicked && !isPicked

  return (
    <div
      className={`rounded border p-4 bg-surface transition-all duration-200 ${
        isPicked
          ? 'border-accent shadow-sm'
          : dimmed
          ? 'border-border opacity-40'
          : 'border-border hover:border-accent/50'
      }`}
    >
      <p
        className="text-sm text-primary italic leading-relaxed mb-2"
        style={{ fontFamily: BODY }}
      >
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-sm font-bold text-primary mb-0.5" style={{ fontFamily: BODY }}>
        — {quote.author}
      </p>
      <p className="text-xs text-muted mb-2" style={{ fontFamily: BODY }}>
        {quote.attribution}
      </p>
      <p className="text-xs text-muted italic" style={{ fontFamily: BODY }}>
        {quote.relevance}
      </p>

      <div className="mt-3 flex justify-end">
        <button
          onClick={onPick}
          disabled={isPicked || dimmed}
          className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            isPicked
              ? 'bg-accent text-white cursor-default'
              : dimmed
              ? 'cursor-not-allowed'
              : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'
          }`}
          style={{ fontFamily: BODY }}
        >
          {isPicked ? '✓ Selected' : 'Select'}
        </button>
      </div>
    </div>
  )
}
