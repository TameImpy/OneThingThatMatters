import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const maxDuration = 60

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY })

const STYLE_PREFIX =
  'Digital editorial illustration, clean and slightly abstract, limited muted colour palette with deep greens, warm whites, and burnt orange accents, minimal detail, atmospheric lighting, no text, no words, no letters, no watermarks. Scene: '

interface RequestBody {
  visualPrompt: string
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { visualPrompt } = body as RequestBody

  if (!visualPrompt) {
    return NextResponse.json({ success: false, error: 'Missing visualPrompt' }, { status: 400 })
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: STYLE_PREFIX + visualPrompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    })

    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) throw new Error('No image URL returned from DALL-E')

    return NextResponse.json({ success: true, imageUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
