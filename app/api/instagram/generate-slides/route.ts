import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { InstagramSlideTexts } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY })

interface RequestBody {
  title: string
  summary: string
  whyItMatters: string
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { title, summary, whyItMatters } = body as RequestBody

  if (!title) {
    return NextResponse.json({ success: false, error: 'Missing title' }, { status: 400 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You break AI news stories into 4 Instagram carousel slides for a newsletter called "One Thing That Matters".

Return a JSON object with these exact keys:
- slide1Hook: A bold, attention-grabbing hook or question (max 12 words). This is the scroll-stopper.
- slide2Fact: The most important fact or development (max 15 words). Be specific and concrete.
- slide3Insight: The key insight or implication (max 15 words). Why this matters.
- slide4Takeaway: A thought-provoking takeaway or call to reflection (max 12 words).

Rules:
- Every slide text MUST be 15 words or fewer. Shorter is better.
- Write in punchy, dramatic, headline-style language suitable for ALL CAPS display.
- No quotation marks, no periods, no special characters.
- Make each slide compelling enough to swipe to the next one.`,
        },
        {
          role: 'user',
          content: `Story: ${title}\n\nSummary: ${summary}\n\nWhy it matters: ${whyItMatters}`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(raw) as InstagramSlideTexts

    if (!parsed.slide1Hook || !parsed.slide2Fact || !parsed.slide3Insight || !parsed.slide4Takeaway) {
      throw new Error('Missing slide text fields in response')
    }

    return NextResponse.json({ success: true, slides: parsed })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
