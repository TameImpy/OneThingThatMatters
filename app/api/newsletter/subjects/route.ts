import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type {
  WatchCandidate,
  AiNewsTop5,
  AiPaperCandidate,
  StoryOfPastCandidate,
} from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY })

interface SubjectsRequestBody {
  watch: WatchCandidate | null
  news: AiNewsTop5 | null
  research: AiPaperCandidate | null
  story: StoryOfPastCandidate | null
  pov?: string | null
}

export interface SubjectSuggestion {
  subject: string
  preheader: string
  angle: string
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { watch, news, research, story, pov } = body as SubjectsRequestBody

  const today = new Date().toISOString().slice(0, 10)
  const currentYear = new Date().getUTCFullYear()

  const prompt = `Today is ${today} (year ${currentYear}). Do not refer to any other year unless the source content does.

Today's daily AI newsletter contains these items:
${news ? `- ARTICLE: "${news.title}" — ${news.summary ?? ''} — Why it matters: ${news.why_it_matters ?? ''}` : ''}
${research ? `- PAPER: "${research.title}" — ${research.summary_llm ?? ''} — Why it matters: ${research.why_it_matters ?? ''}` : ''}
${watch ? `- VIDEO: "${watch.title}" — ${watch.summary ?? ''} — Why it matters: ${watch.why_it_matters ?? ''}` : ''}
${story ? `- HISTORICAL: ${story.this_time_line} — ${story.event_summary}` : ''}
${pov ? `\nEditor's POV for today: ${pov}` : ''}

Write 5 candidate email subject lines + preheader pairs designed to maximise open
rate among a discerning audience of AI professionals, builders, and operators.

Use a DIFFERENT style for each of the 5 — mix across:
1. HEADLINE  — steal the strongest pick of the day and lead with it
2. THEME     — synthesise the day's unifying theme into a sharp claim
3. POV       — sound like a smart friend offering a take ("The thing nobody's saying about X")
4. QUESTION  — a sharp, specific question this issue answers
5. QUOTE     — a punchy direct quote from one of the items

Rules (hard):
- Subject MUST be under 60 characters, ideally 30–50
- Subject MUST NOT include "One Thing That Matters" or any branding (the brand is in the From field)
- Subject MUST NOT use clickbait tropes (no "you won't believe…", no ALL CAPS for emphasis, no "🚨"-style alarm emoji, no multiple exclamation marks)
- Subject MUST lead with the specific claim or noun — NOT with a verb-based explainer opener
- Preheader MUST be 60–100 characters, complement (not repeat) the subject, and tease the other items in the issue
- Be specific: use names, numbers, and real claims — never generic
- Sound like a person, not a publisher
- Do NOT invent years, dates, or numbers. If unsure, omit rather than fabricate.

BANNED OPENERS (do not start the subject OR preheader with any of these or close paraphrases):
- "Explore how…"
- "Discover how…" / "Discover the…"
- "Find out how…" / "Find out why…"
- "Learn how…" / "Learn why…"
- "Uncover…"
- "Dive into…"
- "A look at…" / "A guide to…"
- "Everything you need to know about…"
- "The ultimate guide to…"
These are explainer-blog openers. Use a noun, a name, a number, or a direct claim instead.

GOOD vs BAD examples:
- BAD subject:  "Discover how stablecoins are changing AI payments"
- GOOD subject: "Stablecoins just became how AI agents pay each other"

- BAD subject:  "Explore the future of AI testing"
- GOOD subject: "Every AI agent needs a simulation sandbox"

- BAD preheader: "Find out how Zendesk is changing AI pricing."
- GOOD preheader: "Zendesk now charges per verified resolution — plus Partovi on agent sandboxes."

Return ONLY a JSON object with this exact shape:
{ "suggestions": [
  { "subject": "...", "preheader": "...", "angle": "HEADLINE" },
  { "subject": "...", "preheader": "...", "angle": "THEME" },
  { "subject": "...", "preheader": "...", "angle": "POV" },
  { "subject": "...", "preheader": "...", "angle": "QUESTION" },
  { "subject": "...", "preheader": "...", "angle": "QUOTE" }
]}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert newsletter editor who writes subject lines that drive opens without clickbait. You return only valid JSON, never markdown, never explanation.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(raw) as { suggestions?: SubjectSuggestion[] }
    const suggestions = parsed.suggestions ?? []
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('Unexpected response shape from OpenAI')
    }

    return NextResponse.json({ success: true, suggestions })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
