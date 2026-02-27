'use client'

import type {
  WatchCandidate,
  AiNewsTop5,
  AiPaperCandidate,
  StoryOfPastCandidate,
  NewsletterDailyArt,
  DailyQuote,
} from '@/lib/types'

interface NewsletterPreviewProps {
  issueDate: string
  issueNumber?: number
  pov?: string | null
  watch: WatchCandidate | null
  news: AiNewsTop5 | null
  research: AiPaperCandidate | null
  story: StoryOfPastCandidate | null
  art: NewsletterDailyArt | null
  quote?: DailyQuote | null
  noiseTitles?: string[]
}

const DISPLAY = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif"
const BODY = "Georgia, 'Times New Roman', serif"
const INK = '#537367'
const ACCENT = '#E8522E'
const SKY = '#0EA5E9'
const MUTED = '#6B7280'
const PRIMARY = '#1A1A1A'

function stripUrls(text: string | null | undefined): string {
  if (!text) return ''
  return text.replace(/\(?\s*https?:\/\/\S+\s*\)?/g, '').replace(/\s+/g, ' ').trim()
}

function firstSentence(text: string | null | undefined): string {
  if (!text) return ''
  const match = text.match(/^[^.!?]+[.!?]/)
  return match ? match[0].trim() : text.slice(0, 140)
}

const NOISE_SIZES = [10, 12, 15, 18, 22, 26]
function noiseSize(title: string, index: number): number {
  const sum = title.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0)
  return NOISE_SIZES[(sum + index * 31) % NOISE_SIZES.length]
}

const NOISE_OFFSETS = [-10, -6, -3, 0, 4, 8]
function noiseOffset(title: string, index: number): number {
  const sum = title.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 2), 0)
  return NOISE_OFFSETS[(sum + index * 17) % NOISE_OFFSETS.length]
}

const NOISE_COLORS = ['#3D4A5C', '#4B5869', '#6B7280', '#9CA3AF', '#C9D1DA', '#E2E8F0']
function noiseColor(title: string, index: number): string {
  const sum = title.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 3), 0)
  return NOISE_COLORS[(sum + index * 13) % NOISE_COLORS.length]
}

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

function Subheading({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: BODY, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED, margin: '0 0 6px 0' }}>
      {children}
    </p>
  )
}

function BulletList({ items }: { items: (string | null | undefined)[] }) {
  const filtered = items.filter((x): x is string => !!x)
  if (!filtered.length) return null
  return (
    <ul style={{ margin: '0 0 16px 0', padding: '0 0 0 18px', listStyleType: 'disc' }}>
      {filtered.map((item, i) => (
        <li key={i} style={{ fontFamily: BODY, fontSize: '15px', color: PRIMARY, lineHeight: 1.7, marginBottom: '8px' }}>
          {item}
        </li>
      ))}
    </ul>
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
  issueNumber,
  pov,
  watch,
  news,
  research,
  story,
  art,
  quote,
  noiseTitles,
}: NewsletterPreviewProps) {
  const isEmpty = !watch && !news && !research && !story

  return (
    <div style={{ background: '#FFFFFF', maxWidth: '600px', width: '100%', margin: '0 auto', fontFamily: BODY }}>

      {/* Masthead */}
      <div style={{ background: INK, padding: '18px 32px 14px 32px', textAlign: 'center' }}>
        <p style={{
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontStyle: 'italic',
          fontSize: '48px',
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: '#FFFFFF',
          margin: '0 0 6px 0',
        }}>
          One Thing That Matters
        </p>
        <p style={{ fontFamily: BODY, fontSize: '14px', color: '#FFFFFF', opacity: 0.9, margin: '0 0 10px 0' }}>
          One signal in AI. Every day. Every Angle.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'inline-block', transform: 'rotate(-5deg)', transformOrigin: 'left bottom' }}>
            <span style={{
              display: 'block',
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: '40px',
              color: '#FFFFFF',
              opacity: 0.85,
              lineHeight: 1,
            }}>
              №{issueNumber ?? '—'}
            </span>
            <span style={{ display: 'block', fontFamily: BODY, fontSize: '11px', color: '#FFFFFF', opacity: 0.6, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '3px' }}>
              Issue
            </span>
          </div>
          <p style={{ fontFamily: BODY, fontSize: '13px', color: '#FFFFFF', opacity: 0.75, margin: '0 0 -4px 0' }}>
            {formatDate(issueDate)}
          </p>
        </div>
      </div>

      {/* Today's Things */}
      {(watch || news || research || story) && (
        <div style={{ background: '#FFFFFF', padding: '20px 32px 8px 32px', borderBottom: '1px solid #E5E7EB' }}>
          <p style={{ fontFamily: DISPLAY, fontWeight: 900, fontStyle: 'italic', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.02em', color: INK, margin: '0 0 12px 0' }}>
            Today&apos;s Things
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {news && (
                <tr>
                  <td style={{ padding: '9px 14px 9px 0', verticalAlign: 'middle', width: '28px', fontSize: '26px', lineHeight: 1 }}>📰</td>
                  <td style={{ padding: '9px 0', fontFamily: BODY, fontSize: '13px', color: PRIMARY, lineHeight: 1.5 }}><span style={{ fontWeight: 700, textTransform: 'uppercase', marginRight: '6px' }}>Read:</span>{news.title}</td>
                </tr>
              )}
              {research && (
                <>
                  <tr><td colSpan={2} style={{ padding: '0 16px' }}><div style={{ borderTop: '1.5px solid #C9CDD4' }} /></td></tr>
                  <tr>
                    <td style={{ padding: '9px 14px 9px 0', verticalAlign: 'middle', width: '28px', fontSize: '26px', lineHeight: 1 }}>🔬</td>
                    <td style={{ padding: '9px 0', fontFamily: BODY, fontSize: '13px', color: PRIMARY, lineHeight: 1.5 }}><span style={{ fontWeight: 700, textTransform: 'uppercase', marginRight: '6px' }}>Research:</span>{research.title}</td>
                  </tr>
                </>
              )}
              {watch && (
                <>
                  <tr><td colSpan={2} style={{ padding: '0 16px' }}><div style={{ borderTop: '1.5px solid #C9CDD4' }} /></td></tr>
                  <tr>
                    <td style={{ padding: '9px 14px 9px 0', verticalAlign: 'middle', width: '28px', fontSize: '26px', lineHeight: 1 }}>🎬</td>
                    <td style={{ padding: '9px 0', fontFamily: BODY, fontSize: '13px', color: PRIMARY, lineHeight: 1.5 }}><span style={{ fontWeight: 700, textTransform: 'uppercase', marginRight: '6px' }}>Watch:</span>{watch.title}</td>
                  </tr>
                </>
              )}
              {story && (
                <>
                  <tr><td colSpan={2} style={{ padding: '0 16px' }}><div style={{ borderTop: '1.5px solid #C9CDD4' }} /></td></tr>
                  <tr>
                    <td style={{ padding: '9px 14px 9px 0', verticalAlign: 'middle', width: '28px', fontSize: '26px', lineHeight: 1 }}>🕰️</td>
                    <td style={{ padding: '9px 0', fontFamily: BODY, fontSize: '13px', color: PRIMARY, lineHeight: 1.5 }}><span style={{ fontWeight: 700, textTransform: 'uppercase', marginRight: '6px' }}>Reflect:</span>{stripUrls(story.this_time_line)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* My POV Today */}
      {pov && (
        <>
          <div style={{ background: ACCENT, padding: '12px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <p style={{ fontFamily: DISPLAY, fontWeight: 900, fontStyle: 'italic', fontSize: '30px', textTransform: 'uppercase', color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                  My POV
                </p>
                <svg width="65" height="58" viewBox="0 0 65 58" fill="none">
                  <path d="M 5 8 C 40 8 57 18 57 52" stroke="white" strokeWidth="6" strokeLinecap="round"/>
                  <path d="M 49 44 L 57 52 L 65 44" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flexShrink: 0, width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.8)' }}>
                <img src="/me.jpg" alt="Matt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <p style={{ fontFamily: DISPLAY, fontWeight: 900, fontStyle: 'italic', fontSize: '30px', textTransform: 'uppercase', color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                  Today
                </p>
                <svg width="65" height="58" viewBox="0 0 65 58" fill="none">
                  <path d="M 60 8 C 25 8 8 18 8 52" stroke="white" strokeWidth="6" strokeLinecap="round"/>
                  <path d="M 16 44 L 8 52 L 0 44" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <ContentSection>
            <Body>{pov}</Body>
          </ContentSection>
        </>
      )}

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

      {/* Read */}
      {news && (
        <>
          <SectionBanner label="One Article That Matters" />
          <ContentSection>
            <ScoreBadge score={news.fit_score} />
            <Title>{news.title}</Title>
            {news.summary && (<><Subheading>Summary</Subheading><BulletList items={[news.summary]} /></>)}
            {news.why_it_matters && (<><Subheading>Why it matters</Subheading><BulletList items={[news.why_it_matters]} /></>)}
            <CtaLink href={news.url}>→ Read the article</CtaLink>
          </ContentSection>
        </>
      )}

      {/* Research */}
      {research && (
        <>
          <SectionBanner label="One Paper That Matters" />
          <ContentSection>
            <ScoreBadge score={research.fit_score} />
            <Title>{research.title}</Title>
            {research.authors && (
              <p style={{ fontFamily: BODY, fontSize: '13px', color: MUTED, margin: '0 0 12px 0' }}>
                {research.authors}
              </p>
            )}
            {research.summary_llm && (<><Subheading>Summary</Subheading><BulletList items={[research.summary_llm]} /></>)}
            {research.why_it_matters && (<><Subheading>Why it matters</Subheading><BulletList items={[research.why_it_matters]} /></>)}
            {research.pdf_url && <CtaLink href={research.pdf_url}>→ Read the paper</CtaLink>}
          </ContentSection>
        </>
      )}

      {/* Watch */}
      {watch && (
        <>
          <SectionBanner label="One Video That Matters" />
          <ContentSection>
            <ScoreBadge score={watch.fit_score} />
            <Title>{watch.title}</Title>
            {watch.summary && (<><Subheading>Summary</Subheading><BulletList items={[watch.summary]} /></>)}
            {watch.why_it_matters && (<><Subheading>Why it matters</Subheading><BulletList items={[watch.why_it_matters]} /></>)}
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

      {/* Reflect */}
      {story && (
        <>
          <SectionBanner label={story.year_offset ? `One Thing That Mattered This Time ${story.year_offset} Years Ago` : '… And One Thing That Mattered In The Past'} />
          <ContentSection>
            {story.this_time_line && <Muted>{story.this_time_line}</Muted>}
            <Title>{story.event_summary}</Title>
            <Body>{story.why_it_mattered}</Body>
            {story.echo_today && <Body>{story.echo_today}</Body>}
          </ContentSection>
        </>
      )}

      {/* Quote of the Day */}
      {quote && (
        <>
          <SectionBanner label="Quote of the Day" />
          <ContentSection>
            <p style={{ fontFamily: BODY, fontSize: '18px', fontStyle: 'italic', color: PRIMARY, lineHeight: 1.6, margin: '0 0 12px 0' }}>
              &ldquo;{quote.text}&rdquo;
            </p>
            <p style={{ fontFamily: BODY, fontSize: '13px', color: MUTED, margin: 0 }}>
              &mdash; {quote.author}{quote.attribution ? `, ${quote.attribution}` : ''}
            </p>
          </ContentSection>
        </>
      )}

      {/* The Noise */}
      {noiseTitles && noiseTitles.length > 0 && (
        <>
          <SectionBanner label="The Noise" />
          <ContentSection>
            <p style={{ fontFamily: BODY, fontSize: '18px', fontStyle: 'italic', color: PRIMARY, margin: 0, lineHeight: 1.4 }}>
              Everything we filtered out today, so you didn&rsquo;t have to.
            </p>
          </ContentSection>
          <div style={{ background: '#060A14', padding: '24px 32px' }}>
            <p style={{ margin: 0, lineHeight: 2.4 }}>
              {noiseTitles.flatMap((title, i) => [
                <span key={`t-${i}`} style={{ fontFamily: BODY, fontSize: `${noiseSize(title, i)}px`, color: noiseColor(title, i), position: 'relative', top: `${noiseOffset(title, i)}px` }}>
                  {title}
                </span>,
                i < noiseTitles.length - 1
                  ? <span key={`d-${i}`} style={{ fontFamily: BODY, fontSize: '10px', color: '#374151' }}>&nbsp;·&nbsp;</span>
                  : null,
              ])}
            </p>
          </div>
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
