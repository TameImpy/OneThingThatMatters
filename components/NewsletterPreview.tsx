'use client'

import type {
  WatchCandidate,
  AiNewsTop5,
  AiPaperCandidate,
  StoryOfPastCandidate,
  NewsletterDailyArt,
} from '@/lib/types'

interface NewsletterPreviewProps {
  issueDate: string
  watch: WatchCandidate | null
  news: AiNewsTop5 | null
  research: AiPaperCandidate | null
  story: StoryOfPastCandidate | null
  art: NewsletterDailyArt | null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function NewsletterPreview({
  issueDate,
  watch,
  news,
  research,
  story,
  art,
}: NewsletterPreviewProps) {
  const isEmpty = !watch && !news && !research && !story

  return (
    <div className="rounded-lg border border-navy-800 bg-navy-900 text-sm font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-navy-950 border-b border-navy-800 p-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">
          One Thing That Matters
        </p>
        <p className="text-xs text-cyan-100/50">{formatDate(issueDate)}</p>
      </div>

      {isEmpty && (
        <div className="p-8 text-center text-cyan-100/30 text-xs">
          Pick items from the left to see the newsletter preview.
        </div>
      )}

      {/* Art */}
      {art && (
        <div className="border-b border-navy-800">
          <img src={art.image_url} alt={art.caption ?? ''} className="w-full object-cover max-h-48" />
          {(art.caption || art.artist_name) && (
            <div className="px-5 py-2 text-xs text-cyan-100/50 italic">
              {art.caption}
              {art.artist_name && ` — ${art.artist_name}`}
            </div>
          )}
        </div>
      )}

      {/* Story */}
      {story && (
        <div className="border-b border-navy-800 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">◈ On This Day</p>
          <p className="font-semibold text-white text-sm leading-snug mb-1">{story.this_time_line}</p>
          <p className="text-cyan-100/70 text-xs mb-1">{story.event_summary}</p>
          <p className="text-cyan-100/50 text-xs italic">{story.why_it_mattered}</p>
        </div>
      )}

      {/* Today's Picks summary */}
      {(watch || news || research) && (
        <div className="border-b border-navy-800 bg-navy-950/50 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Today's Picks</p>
          <ul className="space-y-1">
            {watch && (
              <li className="text-xs text-cyan-100/70">
                <span className="text-cyan-400">▶ Watch:</span> {watch.title}
              </li>
            )}
            {news && (
              <li className="text-xs text-cyan-100/70">
                <span className="text-cyan-400">◉ Read:</span> {news.title}
              </li>
            )}
            {research && (
              <li className="text-xs text-cyan-100/70">
                <span className="text-cyan-400">◎ Research:</span> {research.title}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Watch */}
      {watch && (
        <div className="border-b border-navy-800 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">
            ▶ Watch — {watch.channel_name}
          </p>
          <p className="font-semibold text-white text-sm leading-snug mb-1.5">{watch.title}</p>
          <p className="text-cyan-100/70 text-xs mb-1">{watch.summary}</p>
          <p className="text-cyan-100/50 text-xs italic mb-2">{watch.why_it_matters}</p>
          {watch.thumbnail_url && (
            <img src={watch.thumbnail_url} alt="" className="rounded w-full max-h-32 object-cover mb-2" />
          )}
          <a href={watch.url} className="text-xs text-cyan-400 underline" target="_blank" rel="noopener noreferrer">
            Watch →
          </a>
        </div>
      )}

      {/* News */}
      {news && (
        <div className="border-b border-navy-800 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">
            ◉ Read — {news.source}
          </p>
          <p className="font-semibold text-white text-sm leading-snug mb-1.5">{news.title}</p>
          <p className="text-cyan-100/70 text-xs mb-1">{news.summary}</p>
          <p className="text-cyan-100/50 text-xs italic mb-2">{news.why_it_matters}</p>
          <a href={news.url} className="text-xs text-cyan-400 underline" target="_blank" rel="noopener noreferrer">
            Read →
          </a>
        </div>
      )}

      {/* Research */}
      {research && (
        <div className="border-b border-navy-800 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">◎ Research</p>
          <p className="font-semibold text-white text-sm leading-snug mb-0.5">{research.title}</p>
          {research.authors && (
            <p className="text-cyan-100/40 text-xs mb-1.5">{research.authors}</p>
          )}
          <p className="text-cyan-100/70 text-xs mb-1">{research.summary_llm}</p>
          <p className="text-cyan-100/50 text-xs italic mb-2">{research.why_it_matters}</p>
          {research.pdf_url && (
            <a href={research.pdf_url} className="text-xs text-cyan-400 underline" target="_blank" rel="noopener noreferrer">
              Read Paper →
            </a>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-xs text-cyan-100/30">
          Unsubscribe · One Thing That Matters
        </p>
      </div>
    </div>
  )
}
