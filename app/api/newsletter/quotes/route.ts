import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { WatchCandidate, AiNewsTop5, AiPaperCandidate, StoryOfPastCandidate, DailyQuote } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY })

interface QuotesRequestBody {
  watch: WatchCandidate | null
  news: AiNewsTop5 | null
  research: AiPaperCandidate | null
  story: StoryOfPastCandidate | null
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { watch, news, research, story } = body as QuotesRequestBody

  const prompt = `Today's newsletter covers these AI topics:
${news ? `- Article: "${news.title}" — ${news.summary} — ${news.why_it_matters}` : ''}
${research ? `- Research: "${research.title}" — ${research.summary_llm ?? ''} — ${research.why_it_matters ?? ''}` : ''}
${watch ? `- Video: "${watch.title}" — ${watch.summary} — ${watch.why_it_matters}` : ''}
${story ? `- Historical event: ${story.this_time_line} — ${story.event_summary}` : ''}

Return a JSON array of exactly 5 real, verifiable historical quotes relevant to these themes.
Each item must follow this exact format:
{ "text": "...", "author": "Name, Role", "attribution": "Context/year", "relevance": "1-2 sentences why" }

Return ONLY the JSON array, no markdown, no explanation.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a knowledgeable editorial assistant. You return only valid JSON arrays of quotes. Every quote must be real, historically accurate, and verifiable. Never fabricate quotes.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(raw)
    // OpenAI json_object mode wraps arrays in an object — handle both shapes
    const quotes: DailyQuote[] = Array.isArray(parsed) ? parsed : (parsed.quotes ?? Object.values(parsed)[0])

    if (!Array.isArray(quotes) || quotes.length === 0) {
      throw new Error('Unexpected response shape from OpenAI')
    }

    return NextResponse.json({ success: true, quotes })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
