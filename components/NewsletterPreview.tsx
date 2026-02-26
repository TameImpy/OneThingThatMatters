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

const DISPLAY = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif"
const BODY = "Georgia, 'Times New Roman', serif"
const INK = '#111827'
const ACCENT = '#E8522E'
const SKY = '#0EA5E9'
const MUTED = '#6B7280'
const PRIMARY = '#1A1A1A'

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function SectionBanner({ label }: { label: string }) {
  return (
    <div style={{ background: ACCENT, padding: '18px 32px', textAlign: 'center' }}>
      <p style={{
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontStyle: 'italic',
        fontSize: '36px',
        textTransform: 'uppercase',
        letterSpacing: '-0.01em',
        lineHeight: 1,
        color: '#FFFFFF',
        margin: 0,
      }}>
        ◆&nbsp;{label}
      </p>
    </div>
  )
}

function ContentSection({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFFFFF', padding: '24px 32px' }}>
      {children}
    </div>
  )
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null
  return (
    <span style={{
      display: 'inline-block',
      background: SKY,
      color: '#FFFFFF',
      fontFamily: BODY,
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.04em',
      padding: '3px 10px',
      borderRadius: '999px',
      marginBottom: '10px',
    }}>
      {score}/10
    </span>
  )
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: BODY, fontSize: '18px', fontWeight: 700, color: PRIMARY, margin: '0 0 12px 0', lineHeight: 1.35 }}>
      {children}
    </p>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: BODY, fontSize: '16px', color: PRIMARY, margin: '0 0 16px 0', lineHeight: 1.7 }}>
      {children}
    </p>
  )
}

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: BODY, fontSize: '13px', color: MUTED, fontStyle: 'italic', margin: '0 0 12px 0', lineHeight: 1.5 }}>
      {children}
    </p>
  )
}

function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{ fontFamily: BODY, fontSize: '14px', color: SKY, textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
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
    <div style={{ background: '#FFFFFF', maxWidth: '600px', width: '100%', margin: '0 auto' }}>

      {/* Masthead */}
      <div style={{ background: INK, padding: '28px 32px', textAlign: 'center' }}>
        <p style={{
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontStyle: 'italic',
          fontSize: '48px',
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: '#FFFFFF',
          margin: '0 0 8px 0',
        }}>
          One Thing That Matters
        </p>
        <p style={{ fontFamily: BODY, fontSize: '13px', color: MUTED, margin: 0 }}>
          {formatDate(issueDate)}
        </p>
      </div>

      {/* Art */}
      {art && (
        <div style={{ background: '#FFFFFF' }}>
          <img
            src={art.image_url}
            alt={art.caption ?? ''}
            style={{ display: 'block', width: '100%', maxHeight: '260px', objectFit: 'cover' }}
          />
          {(art.caption || art.artist_name) && (
            <p style={{ fontFamily: BODY, fontSize: '13px', color: MUTED, fontStyle: 'italic', margin: 0, padding: '8px 32px' }}>
              {art.caption}{art.artist_name && ` — ${art.artist_name}`}
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div style={{ padding: '48px 32px', textAlign: 'center', color: '#9CA3AF', fontFamily: BODY, fontSize: '14px' }}>
          Pick items from the left to see the newsletter preview.
        </div>
      )}

      {/* Story */}
      {story && (
        <>
          <SectionBanner label="Story of the Week" />
          <ContentSection>
            {story.this_time_line && <Muted>{story.this_time_line}</Muted>}
            {story.event_summary && <Body>{story.event_summary}</Body>}
            {story.why_it_mattered && <Muted>{story.why_it_mattered}</Muted>}
          </ContentSection>
        </>
      )}

      {/* Watch */}
      {watch && (
        <>
          <SectionBanner label="Watch" />
          <ContentSection>
            <ScoreBadge score={watch.fit_score} />
            <Title>{watch.title}</Title>
            {watch.summary && <Body>{watch.summary}</Body>}
            {watch.why_it_matters && <Muted>{watch.why_it_matters}</Muted>}
            {watch.thumbnail_url && (
              <img
                src={watch.thumbnail_url}
                alt=""
                style={{ display: 'block', width: '100%', maxHeight: '220px', objectFit: 'cover', marginBottom: '12px' }}
              />
            )}
            <CtaLink href={watch.url}>→ Watch on YouTube</CtaLink>
          </ContentSection>
        </>
      )}

      {/* Read */}
      {news && (
        <>
          <SectionBanner label="Read" />
          <ContentSection>
            <ScoreBadge score={news.fit_score} />
            <Title>{news.title}</Title>
            {news.summary && <Body>{news.summary}</Body>}
            {news.why_it_matters && <Muted>{news.why_it_matters}</Muted>}
            <CtaLink href={news.url}>→ Read the article</CtaLink>
          </ContentSection>
        </>
      )}

      {/* Research */}
      {research && (
        <>
          <SectionBanner label="Research" />
          <ContentSection>
            <ScoreBadge score={research.fit_score} />
            <Title>{research.title}</Title>
            {research.authors && (
              <p style={{ fontFamily: BODY, fontSize: '13px', color: MUTED, margin: '0 0 12px 0' }}>
                {research.authors}
              </p>
            )}
            {research.summary_llm && <Body>{research.summary_llm}</Body>}
            {research.why_it_matters && <Muted>{research.why_it_matters}</Muted>}
            {research.pdf_url && <CtaLink href={research.pdf_url}>→ Read the paper</CtaLink>}
          </ContentSection>
        </>
      )}

      {/* Footer */}
      <div style={{ background: INK, padding: '20px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: BODY, fontSize: '12px', color: MUTED, margin: 0 }}>
          Unsubscribe · One Thing That Matters
        </p>
      </div>

    </div>
  )
}
