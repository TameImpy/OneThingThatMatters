import { Resend } from 'resend'
import type {
  WatchCandidate,
  AiNewsTop5,
  AiPaperCandidate,
  StoryOfPastCandidate,
  NewsletterDailyArt,
} from './types'

const resendApiKey = process.env.RESEND_API_KEY
if (!resendApiKey) throw new Error('Missing RESEND_API_KEY environment variable')

export const resend = new Resend(resendApiKey)

interface IssueData {
  issue_date: string
  issueNumber?: number
  pov?: string | null
  watch: WatchCandidate | null
  news: AiNewsTop5 | null
  research: AiPaperCandidate | null
  story: StoryOfPastCandidate | null
  art: NewsletterDailyArt | null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function stripUrls(text: string | null | undefined): string {
  if (!text) return ''
  return text.replace(/\(?\s*https?:\/\/\S+\s*\)?/g, '').replace(/\s+/g, ' ').trim()
}

function firstSentence(text: string | null | undefined): string {
  if (!text) return ''
  const match = text.match(/^[^.!?]+[.!?]/)
  return match ? match[0].trim() : text.slice(0, 140)
}

export function renderNewsletterHTML(data: IssueData): string {
  const { issue_date, issueNumber, pov, watch, news, research, story, art } = data
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://onethingmatters.com'

  const c = {
    ink: '#537367',
    accent: '#E8522E',
    sky: '#0EA5E9',
    white: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textMuted: '#6B7280',
  }

  const f = {
    display: `'Barlow Condensed',Impact,'Arial Narrow',sans-serif`,
    body: `Georgia,'Times New Roman',serif`,
  }

  // Full-bleed coral section banner — 36px Barlow Condensed 900 italic
  const banner = (label: string) =>
    `<tr><td style="background:${c.accent};padding:18px 32px;text-align:center;">
      <p style="font-family:${f.display};font-weight:900;font-style:italic;font-size:36px;text-transform:uppercase;letter-spacing:-0.01em;line-height:1;color:${c.white};margin:0;">&#9670;&nbsp;${label}</p>
    </td></tr>`

  // Plain white content row — no card border, no inner table
  const section = (content: string) =>
    `<tr><td style="background:${c.white};padding:24px 32px;">${content}</td></tr>`

  const scoreBadge = (score: number | null) =>
    score != null
      ? `<span style="display:inline-block;background:${c.sky};color:${c.white};font-family:${f.body};font-size:11px;font-weight:700;letter-spacing:0.04em;padding:3px 10px;border-radius:999px;margin-bottom:10px;">${score}/10</span>`
      : ''

  const title = (text: string) =>
    `<p style="font-family:${f.body};font-size:18px;font-weight:700;color:${c.textPrimary};margin:0 0 12px 0;line-height:1.35;">${text}</p>`

  const body = (text: string | null) =>
    text
      ? `<p style="font-family:${f.body};font-size:16px;color:${c.textPrimary};margin:0 0 16px 0;line-height:1.7;">${text}</p>`
      : ''

  const muted = (text: string | null) =>
    text
      ? `<p style="font-family:${f.body};font-size:13px;color:${c.textMuted};font-style:italic;margin:0 0 12px 0;line-height:1.5;">${text}</p>`
      : ''

  const authors = (text: string | null) =>
    text
      ? `<p style="font-family:${f.body};font-size:13px;color:${c.textMuted};margin:0 0 12px 0;">${text}</p>`
      : ''

  const cta = (href: string, text: string) =>
    `<a href="${href}" style="font-family:${f.body};font-size:14px;color:${c.sky};text-decoration:underline;">${text}</a>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>One Thing That Matters &middot; ${formatDate(issue_date)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,900&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${c.white};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.white};">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Masthead -->
        <tr><td style="background:${c.ink};padding:18px 32px 14px 32px;text-align:center;">
          <p style="font-family:${f.display};font-weight:900;font-style:italic;font-size:48px;text-transform:uppercase;letter-spacing:-0.02em;line-height:1;color:${c.white};margin:0 0 6px 0;">One Thing That Matters</p>
          <p style="font-family:${f.body};font-size:14px;color:${c.white};opacity:0.9;margin:0 0 10px 0;">One signal in AI. Every day. Every Angle.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:bottom;text-align:left;width:50%;">
                <div style="display:inline-block;transform:rotate(-5deg);transform-origin:left bottom;">
                  <span style="display:block;font-family:${f.display};font-weight:900;font-size:40px;color:${c.white};opacity:0.85;line-height:1;">&#8470;${issueNumber ?? '&mdash;'}</span>
                  <span style="display:block;font-family:${f.body};font-size:11px;color:${c.white};opacity:0.6;letter-spacing:0.12em;text-transform:uppercase;margin-top:3px;">Issue</span>
                </div>
              </td>
              <td style="vertical-align:bottom;text-align:right;padding-bottom:0;width:50%;">
                <p style="font-family:${f.body};font-size:13px;color:${c.white};opacity:0.75;margin:0;position:relative;top:4px;">${formatDate(issue_date)}</p>
              </td>
            </tr>
          </table>
        </td></tr>

        ${(watch || news || research || story) ? `
        <!-- Today's Things -->
        <tr><td style="background:#FFFFFF;padding:20px 32px 8px 32px;border-bottom:1px solid #E5E7EB;">
          <p style="font-family:${f.display};font-weight:900;font-style:italic;font-size:20px;text-transform:uppercase;letter-spacing:0.02em;color:#537367;margin:0 0 12px 0;">Today&rsquo;s Things</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${watch ? `<tr><td style="padding:9px 14px 9px 0;vertical-align:middle;width:28px;font-size:26px;line-height:1;">&#127916;</td><td style="padding:9px 0;font-family:${f.body};font-size:13px;color:#1A1A1A;line-height:1.5;"><span style="font-weight:700;text-transform:uppercase;margin-right:6px;">Watch:</span>${watch.title}</td></tr>` : ''}
            ${news ? `<tr><td colspan="2" style="padding:0 16px;"><div style="border-top:1px solid #C9CDD4;font-size:0;line-height:0;">&nbsp;</div></td></tr><tr><td style="padding:9px 14px 9px 0;vertical-align:middle;width:28px;font-size:26px;line-height:1;">&#128240;</td><td style="padding:9px 0;font-family:${f.body};font-size:13px;color:#1A1A1A;line-height:1.5;"><span style="font-weight:700;text-transform:uppercase;margin-right:6px;">Read:</span>${news.title}</td></tr>` : ''}
            ${research ? `<tr><td colspan="2" style="padding:0 16px;"><div style="border-top:1px solid #C9CDD4;font-size:0;line-height:0;">&nbsp;</div></td></tr><tr><td style="padding:9px 14px 9px 0;vertical-align:middle;width:28px;font-size:26px;line-height:1;">&#128300;</td><td style="padding:9px 0;font-family:${f.body};font-size:13px;color:#1A1A1A;line-height:1.5;"><span style="font-weight:700;text-transform:uppercase;margin-right:6px;">Research:</span>${research.title}</td></tr>` : ''}
            ${story ? `<tr><td colspan="2" style="padding:0 16px;"><div style="border-top:1px solid #C9CDD4;font-size:0;line-height:0;">&nbsp;</div></td></tr><tr><td style="padding:9px 14px 9px 0;vertical-align:middle;width:28px;font-size:26px;line-height:1;">&#128368;</td><td style="padding:9px 0;font-family:${f.body};font-size:13px;color:#1A1A1A;line-height:1.5;"><span style="font-weight:700;text-transform:uppercase;margin-right:6px;">Reflect:</span>${stripUrls(story.this_time_line)}</td></tr>` : ''}
          </table>
        </td></tr>` : ''}

        ${pov ? `
        <!-- My POV Today -->
        <tr><td style="background:${c.accent};padding:12px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:middle;text-align:center;width:40%;">
                <p style="font-family:${f.display};font-weight:900;font-style:italic;font-size:30px;text-transform:uppercase;color:${c.white};margin:0 0 6px 0;letter-spacing:-0.01em;white-space:nowrap;">My POV</p>
                <img src="${appUrl}/arrow-pov-left.svg" width="65" height="58" alt="" style="display:inline-block;">
              </td>
              <td style="vertical-align:middle;text-align:center;width:20%;">
                <img src="${appUrl}/me.jpg" alt="Matt" width="64" height="64" style="display:inline-block;width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.8);">
              </td>
              <td style="vertical-align:middle;text-align:center;width:40%;">
                <p style="font-family:${f.display};font-weight:900;font-style:italic;font-size:30px;text-transform:uppercase;color:${c.white};margin:0 0 6px 0;letter-spacing:-0.01em;white-space:nowrap;">Today</p>
                <img src="${appUrl}/arrow-pov-right.svg" width="65" height="58" alt="" style="display:inline-block;">
              </td>
            </tr>
          </table>
        </td></tr>
        ${section(body(pov))}` : ''}

        ${art ? `
        <!-- Art block -->
        <tr><td style="background:${c.white};padding:0;">
          <img src="${art.image_url}" alt="${art.caption ?? ''}" width="600" style="display:block;width:100%;max-height:260px;object-fit:cover;">
          ${art.caption || art.artist_name ? `<p style="font-family:${f.body};font-size:13px;color:${c.textMuted};font-style:italic;margin:0;padding:8px 32px;">${art.caption ?? ''}${art.artist_name ? ` &mdash; ${art.artist_name}` : ''}</p>` : ''}
        </td></tr>` : ''}

        ${watch ? `
        ${banner('One Video That Matters')}
        ${section(`
          ${scoreBadge(watch.fit_score)}
          ${title(watch.title)}
          ${body(watch.summary)}
          ${muted(watch.why_it_matters)}
          ${watch.thumbnail_url ? `<img src="${watch.thumbnail_url}" alt="" width="536" style="display:block;width:100%;max-height:220px;object-fit:cover;margin-bottom:12px;">` : ''}
          ${cta(watch.url, '&rarr; Watch on YouTube')}
        `)}` : ''}

        ${news ? `
        ${banner('One Article That Matters')}
        ${section(`
          ${scoreBadge(news.fit_score)}
          ${title(news.title)}
          ${body(news.summary)}
          ${muted(news.why_it_matters)}
          ${cta(news.url, '&rarr; Read the article')}
        `)}` : ''}

        ${research ? `
        ${banner('One Paper That Matters')}
        ${section(`
          ${scoreBadge(research.fit_score)}
          ${title(research.title)}
          ${authors(research.authors ?? null)}
          ${body(research.summary_llm)}
          ${muted(research.why_it_matters)}
          ${research.pdf_url ? cta(research.pdf_url, '&rarr; Read the paper') : ''}
        `)}` : ''}

        ${story ? `
        ${banner(story.year_offset ? `One Thing That Mattered This Time ${story.year_offset} Years Ago` : '&hellip; And One Thing That Mattered In The Past')}
        ${section(`
          ${muted(story.this_time_line)}
          ${body(story.event_summary)}
          ${muted(story.why_it_mattered)}
        `)}` : ''}

        <!-- Footer -->
        <tr><td style="background:${c.ink};padding:20px 32px;text-align:center;">
          <p style="font-family:${f.body};font-size:12px;color:${c.textMuted};margin:0;">
            <a href="${appUrl}/unsubscribe?email={{email}}" style="color:${c.textMuted};text-decoration:underline;">Unsubscribe</a>
            &nbsp;&middot;&nbsp;One Thing That Matters
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
