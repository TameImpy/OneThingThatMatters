'use client'

interface CandidateCardProps {
  id: string
  title: string
  summary: string
  whyItMatters: string
  score: number | null
  isPicked: boolean
  isAnyPicked: boolean
  onPick: (id: string) => void
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
  thumbnailUrl,
  url,
  meta,
}: CandidateCardProps) {
  const dimmed = isAnyPicked && !isPicked

  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-200 ${
        isPicked
          ? 'border-cyan-400 bg-navy-900 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
          : dimmed
          ? 'border-navy-800 bg-navy-950 opacity-40'
          : 'border-navy-800 bg-navy-900 hover:border-cyan-400/40'
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
            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
                  {title}
                </a>
              ) : (
                title
              )}
            </h3>
            {score !== null && score !== undefined && (
              <span className="flex-shrink-0 rounded bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-400">
                {score}/10
              </span>
            )}
          </div>
          {meta && <p className="mt-0.5 text-xs text-cyan-400/70">{meta}</p>}
          <p className="mt-1.5 text-xs text-cyan-100/70 line-clamp-2">{summary}</p>
          <p className="mt-1 text-xs text-cyan-100/50 italic line-clamp-1">{whyItMatters}</p>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onPick(id)}
          disabled={isPicked || dimmed}
          className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
            isPicked
              ? 'bg-cyan-400 text-navy-950 cursor-default'
              : dimmed
              ? 'cursor-not-allowed bg-navy-800 text-navy-800'
              : 'bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-navy-950'
          }`}
        >
          {isPicked ? '✓ Picked' : 'Pick'}
        </button>
      </div>
    </div>
  )
}
