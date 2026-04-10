/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { NextRequest, NextResponse } from 'next/server'
import { ImageResponse } from '@vercel/og'
import { supabase } from '@/lib/supabase'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const maxDuration = 60

let fontsPromise: Promise<{ playfair: ArrayBuffer; inter: ArrayBuffer }> | null = null

function loadFonts() {
  if (!fontsPromise) {
    const fontsDir = join(process.cwd(), 'public', 'fonts')
    fontsPromise = Promise.all([
      readFile(join(fontsDir, 'PlayfairDisplay-Bold.ttf')),
      readFile(join(fontsDir, 'Inter-Regular.ttf')),
    ]).then(([playfair, inter]) => ({
      playfair: playfair.buffer as ArrayBuffer,
      inter: inter.buffer as ArrayBuffer,
    }))
  }
  return fontsPromise
}

interface RequestBody {
  dalleImageUrl: string
  headline: string
  teaser: string
  categoryTag: string
  date: string
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { dalleImageUrl, headline, teaser, categoryTag, date } = body as RequestBody

  if (!dalleImageUrl || !headline || !date) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const [fonts, imageRes] = await Promise.all([loadFonts(), fetch(dalleImageUrl)])
    if (!imageRes.ok) throw new Error('Failed to fetch DALL-E image')

    const imageBuffer = await imageRes.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString('base64')
    const contentType = imageRes.headers.get('content-type') ?? 'image/png'
    const dataUri = `data:${contentType};base64,${base64}`

    const displayHeadline = headline.length > 120 ? headline.slice(0, 117) + '...' : headline
    const displayTeaser = teaser ? (teaser.length > 160 ? teaser.slice(0, 157) + '...' : teaser) : ''

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '1080px',
            height: '1350px',
            backgroundColor: '#1A1A1A',
          }}
        >
          {/* Top 60% — DALL-E image */}
          <img
            src={dataUri}
            style={{
              width: '1080px',
              height: '810px',
              objectFit: 'cover',
            }}
          />

          {/* Bottom 40% — branded text panel */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '1080px',
              height: '540px',
              padding: '40px 56px',
              justifyContent: 'space-between',
            }}
          >
            {/* Content area */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Category tag */}
              <div
                style={{
                  fontFamily: 'Inter',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#E8522E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: '20px',
                }}
              >
                {categoryTag}
              </div>

              {/* Headline */}
              <div
                style={{
                  fontFamily: 'Playfair Display',
                  fontSize: displayHeadline.length > 80 ? '28px' : '34px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.25,
                  marginBottom: '16px',
                }}
              >
                {displayHeadline}
              </div>

              {/* Teaser */}
              {displayTeaser && (
                <div
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '18px',
                    color: 'rgba(255,255,255,0.65)',
                    lineHeight: 1.5,
                  }}
                >
                  {displayTeaser}
                </div>
              )}
            </div>

            {/* Branding footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <div
                style={{
                  fontFamily: 'Playfair Display',
                  fontSize: '20px',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                One Thing That Matters
              </div>
              <div
                style={{
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                Link in bio
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1350,
        fonts: [
          { name: 'Playfair Display', data: fonts.playfair, weight: 700 as const, style: 'normal' as const },
          { name: 'Inter', data: fonts.inter, weight: 400 as const, style: 'normal' as const },
        ],
      },
    )

    const pngBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // Upload to Supabase Storage
    const filePath = `${date}.png`
    const { error: uploadError } = await supabase.storage
      .from('instagram-posts')
      .upload(filePath, pngBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    const { data: urlData } = supabase.storage
      .from('instagram-posts')
      .getPublicUrl(filePath)

    return NextResponse.json({ success: true, compositeImageUrl: urlData.publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
