import { Resend } from 'resend'
import type {
  WatchCandidate,
  AiNewsTop5,
  AiPaperCandidate,
  StoryOfPastCandidate,
  NewsletterDailyArt,
  DailyQuote,
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
  quote?: DailyQuote | null
  noiseTitles?: string[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function stripUrls(text: unknown): string {
  if (text == null) return ''
  const s = typeof text === 'string' ? text : String(text)
  return s.replace(/\(?\s*https?:\/\/\S+\s*\)?/g, '').replace(/\s+/g, ' ').trim()
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

function firstSentence(text: string | null | undefined): string {
  if (!text) return ''
  const match = text.match(/^[^.!?]+[.!?]/)
  return match ? match[0].trim() : text.slice(0, 140)
}

export function renderConfirmationEmailHTML(name: string | null, confirmUrl: string): string {
  const greeting = name ? `Hi ${name},` : 'Hi there,'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://onethingmatters.com'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Confirm your subscription</title>
</head>
<body style="margin:0;padding:0;background:#FFFFFF;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="background:#537367;padding:20px 32px;text-align:center;">
          <p style="font-family:'Barlow Condensed',Impact,'Arial Narrow',sans-serif;font-weight:900;font-style:italic;font-size:36px;text-transform:uppercase;letter-spacing:-0.02em;line-height:1;color:#FFFFFF;margin:0;">One Thing That Matters</p>
        </td></tr>
        <tr><td style="background:#FFFFFF;padding:32px;">
          <p style="font-size:16px;color:#1A1A1A;margin:0 0 16px 0;line-height:1.6;">${greeting}</p>
          <p style="font-size:16px;color:#1A1A1A;margin:0 0 24px 0;line-height:1.6;">Thanks for subscribing. Click the button below to confirm your email and activate your subscription.</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td>
            <a href="${confirmUrl}" style="display:inline-block;background:#E8522E;color:#FFFFFF;font-family:'Barlow Condensed',Impact,'Arial Narrow',sans-serif;font-weight:900;font-style:italic;font-size:20px;text-transform:uppercase;letter-spacing:0.01em;text-decoration:none;padding:12px 28px;border-radius:4px;">&#9670;&nbsp;Confirm subscription</a>
          </td></tr></table>
          <p style="font-size:13px;color:#6B7280;margin:24px 0 0 0;line-height:1.6;">Or copy and paste this URL into your browser:<br><a href="${confirmUrl}" style="color:#0EA5E9;word-break:break-all;">${confirmUrl}</a></p>
          <p style="font-size:13px;color:#6B7280;margin:16px 0 0 0;">If you didn&rsquo;t request this, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="background:#537367;padding:16px 32px;text-align:center;">
          <p style="font-size:12px;color:#9CA3AF;margin:0;">
            <a href="${appUrl}/unsubscribe" style="color:#9CA3AF;text-decoration:underline;">Unsubscribe</a>
            &nbsp;&middot;&nbsp;One Thing That Matters
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function renderWelcomeEmailHTML(name: string | null): string {
  const greeting = name ? `Welcome, ${name}.` : 'Welcome.'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://onethingmatters.com'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Welcome to One Thing That Matters</title>
</head>
<body style="margin:0;padding:0;background:#FFFFFF;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="background:#537367;padding:20px 32px;text-align:center;">
          <p style="font-family:'Barlow Condensed',Impact,'Arial Narrow',sans-serif;font-weight:900;font-style:italic;font-size:36px;text-transform:uppercase;letter-spacing:-0.02em;line-height:1;color:#FFFFFF;margin:0;">One Thing That Matters</p>
          <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;color:rgba(255,255,255,0.75);margin:8px 0 0 0;">One signal in AI. Monday to Friday. Every Angle.</p>
        </td></tr>
        <tr><td style="background:#E8522E;padding:20px 32px;text-align:center;">
          <p style="font-family:'Barlow Condensed',Impact,'Arial Narrow',sans-serif;font-weight:900;font-style:italic;font-size:32px;text-transform:uppercase;color:#FFFFFF;margin:0;">&#9670;&nbsp;${greeting}</p>
        </td></tr>
        <tr><td style="background:#FFFFFF;padding:32px;">
          <p style="font-size:16px;color:#1A1A1A;margin:0 0 16px 0;line-height:1.7;">You&rsquo;re now subscribed to <strong>One Thing That Matters</strong> &mdash; a daily newsletter that cuts through the AI noise.</p>
          <p style="font-size:16px;color:#1A1A1A;margin:0 0 16px 0;line-height:1.7;">Every weekday morning you&rsquo;ll get one handpicked signal in AI: one article, one paper, one video, and one story from the past &mdash; each chosen for what it actually means, not just what happened.</p>
          <p style="font-size:16px;color:#1A1A1A;margin:0 0 0 0;line-height:1.7;">Your first issue arrives tomorrow morning.</p>
        </td></tr>
        <tr><td style="background:#537367;padding:16px 32px;text-align:center;">
          <p style="font-size:12px;color:#9CA3AF;margin:0;">
            <a href="${appUrl}/unsubscribe?email={{email}}" style="color:#9CA3AF;text-decoration:underline;">Unsubscribe</a>
            &nbsp;&middot;&nbsp;One Thing That Matters
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function renderNewsletterHTML(data: IssueData): string {
  const { issue_date, issueNumber, pov, watch, news, research, story, art, quote, noiseTitles } = data
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://onethingmatters.com'

  // Escape user/AI content before embedding in HTML.
  // &#64; prevents email clients from auto-detecting @ as an email address.
  const e = (text: unknown): string => {
    if (text == null) return ''
    const s = typeof text === 'string' ? text : String(text)
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/@/g, '&#64;')
  }

  const filteredNoise = (noiseTitles ?? []).filter((t): t is string => !!t)
  const noiseHtml = filteredNoise.length > 0
    ? filteredNoise.map((t, i) =>
        `<span style="font-family:${`Georgia,'Times New Roman',serif`};font-size:${noiseSize(t, i)}px;color:${noiseColor(t, i)};position:relative;top:${noiseOffset(t, i)}px;">${e(t)}</span>${i < filteredNoise.length - 1 ? `<span style="font-family:Georgia,'Times New Roman',serif;font-size:10px;color:#374151;">&nbsp;&middot;&nbsp;</span>` : ''}`
      ).join('')
    : null

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
      <p style="font-family:${f.display};font-weight:900;font-style:italic;font-size:36px;text-transform:uppercase;letter-spacing:-0.01em;line-height:1;color:${c.white};margin:0;"><span style="position:relative;top:-3px;">&#9670;</span>&nbsp;${label}</p>
    </td></tr>`

  // Plain white content row — no card border, no inner table
  const section = (content: string) =>
    `<tr><td style="background:${c.white};padding:24px 32px;">${content}</td></tr>`

  const scoreBadge = (score: number | null) =>
    score != null
      ? `<span style="display:inline-block;background:${c.sky};color:${c.white};font-family:${f.body};font-size:11px;font-weight:700;letter-spacing:0.04em;padding:3px 10px;border-radius:999px;margin-bottom:10px;">${score}/10</span>`
      : ''

  const title = (text: string) =>
    `<p style="font-family:${f.body};font-size:18px;font-weight:700;color:${c.textPrimary};margin:0 0 12px 0;line-height:1.35;">${e(text)}</p>`

  const body = (text: string | null) =>
    text
      ? `<p style="font-family:${f.body};font-size:16px;color:${c.textPrimary};margin:0 0 16px 0;line-height:1.7;">${e(text)}</p>`
      : ''

  const muted = (text: string | null) =>
    text
      ? `<p style="font-family:${f.body};font-size:13px;color:${c.textMuted};font-style:italic;margin:0 0 12px 0;line-height:1.5;">${e(text)}</p>`
      : ''

  const bulletList = (...items: (string | null | undefined)[]) => {
    const filtered = items.filter((x): x is string => !!x)
    if (!filtered.length) return ''
    return `<ul style="margin:0 0 16px 0;padding:0 0 0 18px;">${filtered.map(item => `<li style="font-family:${f.body};font-size:15px;color:${c.textPrimary};line-height:1.7;margin-bottom:8px;">${e(item)}</li>`).join('')}</ul>`
  }

  const subheading = (text: string) =>
    `<p style="font-family:${f.body};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${c.textMuted};margin:0 0 6px 0;">${text}</p>`

  const authors = (text: string | null) =>
    text
      ? `<p style="font-family:${f.body};font-size:13px;color:${c.textMuted};margin:0 0 12px 0;">${e(text)}</p>`
      : ''

  const cta = (href: string, text: string) => {
    const trackUrl = `${appUrl}/api/track/click?date=${encodeURIComponent(issue_date)}&url=${encodeURIComponent(href)}`
    return `<a href="${trackUrl}" style="font-family:${f.body};font-size:14px;color:${c.sky};text-decoration:underline;">${text}</a>`
  }

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
          <p style="font-family:${f.body};font-size:14px;color:${c.white};opacity:0.9;margin:0 0 10px 0;">One signal in AI. Monday to Friday. Every Angle.</p>
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
        ${banner("Today's AI Art")}
        <tr><td style="background:${c.white};padding:0;">
          <img src="${art.image_url}" alt="${art.caption ?? ''}" width="600" style="display:block;width:100%;max-height:300px;object-fit:cover;">
        </td></tr>
        ${section(`
          ${art.artist_tagline ? `<p style="font-family:${f.body};font-size:18px;font-style:italic;color:${c.textPrimary};line-height:1.5;margin:0 0 14px 0;">${e(art.artist_tagline)}</p>` : ''}
          ${art.caption ? `<p style="font-family:${f.body};font-size:15px;color:${c.textPrimary};line-height:1.7;margin:0 0 16px 0;">${e(art.caption)}</p>` : ''}
          ${art.artist_name ? `<p style="font-family:${f.body};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${c.textMuted};margin:0 0 6px 0;">${e(art.artist_name)}</p>` : ''}
          ${art.bio ? `<p style="font-family:${f.body};font-size:13px;font-style:italic;color:${c.textMuted};line-height:1.6;margin:0;">${e(art.bio)}</p>` : ''}
        `)}` : ''}

        ${news ? `
        ${banner('One Article That Matters')}
        ${section(`
          ${title(news.title)}
          ${news.summary ? subheading('Summary') + bulletList(news.summary) : ''}
          ${news.why_it_matters ? subheading('Why it matters') + bulletList(news.why_it_matters) : ''}
          ${cta(news.url, '&rarr; Read the article')}
        `)}` : ''}

        ${research ? `
        ${banner('One Paper That Matters')}
        ${section(`
          ${title(research.title)}
          ${authors(research.authors ?? null)}
          ${research.summary_llm ? subheading('Summary') + bulletList(research.summary_llm) : ''}
          ${research.why_it_matters ? subheading('Why it matters') + bulletList(research.why_it_matters) : ''}
          ${research.pdf_url ? cta(research.pdf_url, '&rarr; Read the paper') : ''}
        `)}` : ''}

        ${watch ? `
        ${banner('One Video That Matters')}
        ${section(`
          ${title(watch.title)}
          ${watch.summary ? subheading('Summary') + bulletList(watch.summary) : ''}
          ${watch.why_it_matters ? subheading('Why it matters') + bulletList(watch.why_it_matters) : ''}
          ${watch.thumbnail_url ? `<img src="${watch.thumbnail_url}" alt="" width="536" style="display:block;width:100%;max-height:220px;object-fit:cover;margin-bottom:12px;">` : ''}
          ${cta(watch.url, '&rarr; Watch on YouTube')}
        `)}` : ''}

        ${story ? `
        ${banner(story.year_offset ? `One Thing That Mattered This Time ${story.year_offset} Years Ago` : '&hellip; And One Thing That Mattered In The Past')}
        ${section(`
          ${title(story.event_summary)}
          ${body(story.why_it_mattered)}
          ${story.echo_today ? body(story.echo_today) : ''}
        `)}` : ''}

        ${quote ? `
        <!-- Quote of the Day -->
        <tr><td style="background:${c.accent};padding:18px 32px;text-align:center;">
          <p style="font-family:${f.display};font-weight:900;font-style:italic;font-size:36px;text-transform:uppercase;letter-spacing:-0.01em;line-height:1;color:${c.white};margin:0;"><span style="position:relative;top:-3px;">&#9670;</span>&nbsp;Quote of the Day</p>
        </td></tr>
        ${section(`
          <p style="font-family:${f.body};font-size:18px;font-style:italic;color:${c.textPrimary};line-height:1.6;margin:0 0 12px 0;">&ldquo;${e(quote.text)}&rdquo;</p>
          <p style="font-family:${f.body};font-size:13px;color:${c.textMuted};margin:0;">&mdash; ${e(quote.author)}${quote.attribution ? `, ${e(quote.attribution)}` : ''}</p>
        `)}` : ''}

        ${noiseHtml ? `
        <!-- The Noise -->
        <tr><td style="background:${c.accent};padding:18px 32px;text-align:center;position:relative;overflow:hidden;">
          <svg width="110" height="110" viewBox="0 0 20 20" fill="white" style="position:absolute;opacity:0.18;top:-16px;left:8px;"><rect x="1" y="8" width="3" height="5" rx="0.5"/><path d="M4 7.5 L15.5 2 L15.5 18 L4 12.5 Z"/></svg>
          <svg width="80" height="80" viewBox="0 0 20 20" fill="white" style="position:absolute;opacity:0.14;bottom:-12px;right:16px;"><rect x="1" y="8" width="3" height="5" rx="0.5"/><path d="M4 7.5 L15.5 2 L15.5 18 L4 12.5 Z"/></svg>
          <svg width="38" height="38" viewBox="0 0 20 20" fill="white" style="position:absolute;opacity:0.28;top:6px;right:84px;"><rect x="1" y="8" width="3" height="5" rx="0.5"/><path d="M4 7.5 L15.5 2 L15.5 18 L4 12.5 Z"/></svg>
          <svg width="52" height="52" viewBox="0 0 20 20" fill="white" style="position:absolute;opacity:0.22;bottom:4px;left:104px;"><rect x="1" y="8" width="3" height="5" rx="0.5"/><path d="M4 7.5 L15.5 2 L15.5 18 L4 12.5 Z"/></svg>
          <svg width="26" height="26" viewBox="0 0 20 20" fill="white" style="position:absolute;opacity:0.30;top:10px;left:44%;"><rect x="1" y="8" width="3" height="5" rx="0.5"/><path d="M4 7.5 L15.5 2 L15.5 18 L4 12.5 Z"/></svg>
          <p style="position:relative;font-family:${f.display};font-weight:900;font-style:italic;font-size:36px;text-transform:uppercase;letter-spacing:-0.01em;line-height:1;color:${c.white};margin:0;"><span style="position:relative;top:-3px;">&#9670;</span>&nbsp;The Noise</p>
        </td></tr>
        ${section(`<p style="font-family:${f.body};font-size:18px;font-style:italic;color:#1A1A1A;margin:0;line-height:1.4;">Everything we filtered out today, so you didn&rsquo;t have to.</p>`)}
        <tr><td style="background:#060A14;padding:24px 32px;">
          <p style="margin:0;line-height:2.4;">${noiseHtml}</p>
        </td></tr>` : ''}

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

  <!-- Tracking pixel: loaded when email client renders images -->
  <img src="${appUrl}/api/track/open?date=${encodeURIComponent(issue_date)}&email={{email}}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;opacity:0;" />
</body>
</html>`
}
