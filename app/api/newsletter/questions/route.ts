import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { WatchCandidate, AiNewsTop5, AiPaperCandidate, StoryOfPastCandidate } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY })

interface QuestionsRequestBody {
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

  const { watch, news, research, story } = body as QuestionsRequestBody

  const prompt = `Today's newsletter covers these AI topics:
${news ? `- Article: "${news.title}" — ${news.summary} — ${news.why_it_matters}` : ''}
${research ? `- Research: "${research.title}" — ${research.summary_llm ?? ''} — ${research.why_it_matters ?? ''}` : ''}
${watch ? `- Video: "${watch.title}" — ${watch.summary} — ${watch.why_it_matters}` : ''}
${story ? `- Historical event: ${story.this_time_line} — ${story.event_summary}` : ''}

Generate exactly 6 thought-provoking questions that an editor should reflect on after reviewing today's content.
Assign each question a category from: Industry, Society, Philosophy, Economics, Ethics, Technology — chosen naturally based on the question's focus.

Return ONLY valid JSON in this exact shape:
{ "questions": [{ "category": "...", "question": "..." }, ...] }`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an editorial AI assistant helping a newsletter editor think more deeply about today\'s AI content. Focus on industry impact, societal implications, philosophical tensions, economic consequences, ethical dilemmas, and technological trajectories raised by the combined content.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(raw) as { questions?: { category: string; question: string }[] }
    const questions = parsed.questions ?? (Object.values(parsed)[0] as { category: string; question: string }[])

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Unexpected response shape from OpenAI')
    }

    return NextResponse.json({ success: true, questions })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
