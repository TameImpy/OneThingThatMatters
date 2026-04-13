import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY })

interface RequestBody {
  leadCategory: string
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

  const { leadCategory, title, summary, whyItMatters } = body as RequestBody

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
            'You write Instagram captions for carousel posts from an AI newsletter called "One Thing That Matters". The carousel already tells the story across 4 slides, so DO NOT summarise it again. Instead write a short, curiosity-driven caption (2-3 lines max) that hooks people into swiping through all slides. The first line must be attention-grabbing — it shows in the feed preview. Use line breaks for readability. Include 3-5 relevant hashtags at the end. Always end the caption with:\n\nLink in bio to subscribe.',
        },
        {
          role: 'user',
          content: `Category: ${leadCategory}\nHeadline: ${title}\nSummary: ${summary}\nWhy it matters: ${whyItMatters}`,
        },
      ],
    })

    const caption = completion.choices[0]?.message?.content?.trim() ?? ''
    if (!caption) throw new Error('Empty response from OpenAI')

    return NextResponse.json({ success: true, caption })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
