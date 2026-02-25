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

export function renderNewsletterHTML(data: IssueData): string {
  const { issue_date, watch, news, research, story, art } = data
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://onethingmatters.com'

  const c = {
    navy950: '#0B0F1A',
    navy900: '#111827',
    navy800: '#1E2A3A',
    cyan400: '#22D3EE',
    cyan100: '#CFFAFE',
    white: '#FFFFFF',
    amber400: '#FBBF24',
  }

  const section = (content: string) =>
    `<tr><td style="border-bottom:1px solid ${c.navy800};padding:24px 32px;">${content}</td></tr>`

  const label = (icon: string, text: string) =>
    `<p style="font-family:monospace;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${c.cyan400};margin:0 0 8px 0;">${icon} ${text}</p>`

  const heading = (text: string) =>
    `<p style="font-size:16px;font-weight:700;color:${c.white};margin:0 0 6px 0;line-height:1.3;">${text}</p>`

  const body = (text: string | null) =>
    text
      ? `<p style="font-size:13px;color:${c.cyan100};opacity:0.7;margin:0 0 6px 0;line-height:1.6;">${text}</p>`
      : ''

  const italic = (text: string | null) =>
    text
      ? `<p style="font-size:12px;color:${c.cyan100};opacity:0.5;font-style:italic;margin:0 0 10px 0;">${text}</p>`
      : ''

  const cta = (href: string, text: string) =>
    `<a href="${href}" style="font-size:12px;color:${c.cyan400};text-decoration:underline;">${text}</a>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>One Thing That Matters · ${formatDate(issue_date)}</title>
</head>
<body style="margin:0;padding:0;background:${c.navy950};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" style="max-width:600px;width:100%;background:${c.navy900};border-radius:8px;overflow:hidden;border:1px solid ${c.navy800};">

        <!-- Header -->
        <tr><td style="background:${c.navy950};padding:24px 32px;text-align:center;border-bottom:1px solid ${c.navy800};">
          <p style="font-family:monospace;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${c.cyan400};margin:0 0 4px 0;">One Thing That Matters</p>
          <p style="font-size:12px;color:${c.cyan100};opacity:0.4;margin:0;">${formatDate(issue_date)}</p>
        </td></tr>

        ${art ? `
        <!-- Art -->
        <tr><td style="border-bottom:1px solid ${c.navy800};">
          <img src="${art.image_url}" alt="${art.caption ?? ''}" width="600" style="display:block;width:100%;max-height:240px;object-fit:cover;">
          ${art.caption || art.artist_name ? `<p style="font-size:11px;color:${c.cyan100};opacity:0.4;font-style:italic;margin:0;padding:8px 32px;">${art.caption ?? ''}${art.artist_name ? ` — ${art.artist_name}` : ''}</p>` : ''}
        </td></tr>` : ''}

        ${story ? section(`
          ${label('◈', 'On This Day')}
          ${heading(story.this_time_line)}
          ${body(story.event_summary)}
          ${italic(story.why_it_mattered)}
        `) : ''}

        ${watch || news || research ? section(`
          ${label('', "Today's Picks")}
          <ul style="margin:0;padding:0 0 0 16px;list-style:disc;">
            ${watch ? `<li style="font-size:12px;color:${c.cyan100};opacity:0.7;margin-bottom:4px;"><span style="color:${c.cyan400};">▶ Watch:</span> ${watch.title}</li>` : ''}
            ${news ? `<li style="font-size:12px;color:${c.cyan100};opacity:0.7;margin-bottom:4px;"><span style="color:${c.cyan400};">◉ Read:</span> ${news.title}</li>` : ''}
            ${research ? `<li style="font-size:12px;color:${c.cyan100};opacity:0.7;"><span style="color:${c.cyan400};">◎ Research:</span> ${research.title}</li>` : ''}
          </ul>
        `) : ''}

        ${watch ? section(`
          ${label('▶', `Watch — ${watch.channel_name}`)}
          ${heading(watch.title)}
          ${body(watch.summary)}
          ${italic(watch.why_it_matters)}
          ${watch.thumbnail_url ? `<img src="${watch.thumbnail_url}" alt="" width="536" style="display:block;width:100%;max-height:160px;object-fit:cover;border-radius:4px;margin-bottom:10px;">` : ''}
          ${cta(watch.url, 'Watch →')}
        `) : ''}

        ${news ? section(`
          ${label('◉', `Read — ${news.source}`)}
          ${heading(news.title)}
          ${body(news.summary)}
          ${italic(news.why_it_matters)}
          ${cta(news.url, 'Read →')}
        `) : ''}

        ${research ? section(`
          ${label('◎', 'Research')}
          ${heading(research.title)}
          ${research.authors ? `<p style="font-size:11px;color:${c.cyan100};opacity:0.35;margin:0 0 8px 0;">${research.authors}</p>` : ''}
          ${body(research.summary_llm)}
          ${italic(research.why_it_matters)}
          ${research.pdf_url ? cta(research.pdf_url, 'Read Paper →') : ''}
        `) : ''}

        <!-- Footer -->
        <tr><td style="padding:20px 32px;text-align:center;">
          <p style="font-size:11px;color:${c.cyan100};opacity:0.25;margin:0;">
            <a href="${appUrl}/unsubscribe?email={{email}}" style="color:inherit;">Unsubscribe</a>
            &nbsp;·&nbsp;One Thing That Matters
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
