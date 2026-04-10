import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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
          content:
            'You are a visual art director for an AI newsletter\'s Instagram account. Given a news story, describe a single concrete visual scene that captures its essence as an editorial illustration. Be specific about composition, subjects, colours, and mood. Keep it under 80 words. Output ONLY the visual description — no preamble, no quotes, no formatting.',
        },
        {
          role: 'user',
          content: `Story headline: ${title}\n\nSummary: ${summary}\n\nWhy it matters: ${whyItMatters}`,
        },
      ],
    })

    const visualPrompt = completion.choices[0]?.message?.content?.trim() ?? ''
    if (!visualPrompt) throw new Error('Empty response from OpenAI')

    return NextResponse.json({ success: true, visualPrompt })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
