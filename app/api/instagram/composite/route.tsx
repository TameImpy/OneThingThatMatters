/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { NextRequest, NextResponse } from 'next/server'
import { ImageResponse } from '@vercel/og'
import { supabase } from '@/lib/supabase'
import JSZip from 'jszip'
import type { InstagramSlideTexts } from '@/lib/types'

export const maxDuration = 60

const PLAYFAIR_BOLD_URL =
  'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf'
const INTER_REGULAR_URL =
  'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf'

let fontsPromise: Promise<{ playfair: ArrayBuffer; inter: ArrayBuffer }> | null = null

function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(PLAYFAIR_BOLD_URL).then(r => r.arrayBuffer()),
      fetch(INTER_REGULAR_URL).then(r => r.arrayBuffer()),
    ]).then(([playfair, inter]) => ({ playfair, inter }))
  }
  return fontsPromise
}

function headlineSize(text: string, base: number): number {
  if (text.length < 40) return base
  if (text.length < 70) return base - 8
  return base - 16
}

const FONTS_CONFIG = (fonts: { playfair: ArrayBuffer; inter: ArrayBuffer }) => [
  { name: 'Playfair Display', data: fonts.playfair, weight: 700 as const, style: 'normal' as const },
  { name: 'Inter', data: fonts.inter, weight: 400 as const, style: 'normal' as const },
]

interface RequestBody {
  dalleImageUrl: string
  slides: InstagramSlideTexts
  categoryTag: string
  date: string
}

function renderSlide1(dataUri: string, categoryTag: string, hookText: string, fonts: { playfair: ArrayBuffer; inter: ArrayBuffer }) {
  const text = hookText.toUpperCase()
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '1080px', height: '1350px', backgroundColor: '#1A1A1A' }}>
        <img src={dataUri} style={{ width: '1080px', height: '700px', objectFit: 'cover' }} />
        <div style={{ display: 'flex', flexDirection: 'column', width: '1080px', height: '650px', padding: '40px 56px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Inter', fontSize: '24px', fontWeight: 600, color: '#E8522E', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px' }}>
              {categoryTag}
            </div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: `${headlineSize(text, 72)}px`, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
              {text}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontFamily: 'Playfair Display', fontSize: '20px', fontWeight: 700, fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }}>
              One Thing That Matters
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: '16px', color: 'rgba(255,255,255,0.35)' }}>
              Swipe →
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts: FONTS_CONFIG(fonts) },
  )
}

function renderTextSlide(categoryTag: string, mainText: string, fonts: { playfair: ArrayBuffer; inter: ArrayBuffer }) {
  const text = mainText.toUpperCase()
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '1080px', height: '1350px', backgroundColor: '#1A1A1A', padding: '56px', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 600, color: '#E8522E', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          {categoryTag}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, paddingTop: '40px', paddingBottom: '40px' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: `${headlineSize(text, 64)}px`, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.15 }}>
            {text}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: '20px', fontWeight: 700, fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }}>
            One Thing That Matters
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: '16px', color: 'rgba(255,255,255,0.35)' }}>
            Swipe →
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts: FONTS_CONFIG(fonts) },
  )
}

function renderCtaSlide(takeawayText: string, fonts: { playfair: ArrayBuffer; inter: ArrayBuffer }) {
  const text = takeawayText.toUpperCase()
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '1080px', height: '1350px', backgroundColor: '#E8522E', padding: '56px', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Playfair Display', fontSize: '32px', fontWeight: 700, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)' }}>
          One Thing That Matters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, paddingTop: '40px', paddingBottom: '40px' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: `${headlineSize(text, 60)}px`, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.15 }}>
            {text}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontFamily: 'Inter', fontSize: '32px', fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Follow for daily AI insights
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: '24px', color: 'rgba(255,255,255,0.7)' }}>
            Link in bio to subscribe
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts: FONTS_CONFIG(fonts) },
  )
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { dalleImageUrl, slides, categoryTag, date } = body as RequestBody

  if (!dalleImageUrl || !slides || !date) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const [fonts, imageRes] = await Promise.all([loadFonts(), fetch(dalleImageUrl)])
    if (!imageRes.ok) throw new Error('Failed to fetch DALL-E image')

    const imageBuffer = await imageRes.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString('base64')
    const contentType = imageRes.headers.get('content-type') ?? 'image/png'
    const dataUri = `data:${contentType};base64,${base64}`

    // Render all 4 slides
    const r1 = renderSlide1(dataUri, categoryTag, slides.slide1Hook, fonts)
    const r2 = renderTextSlide(categoryTag, slides.slide2Fact, fonts)
    const r3 = renderTextSlide(categoryTag, slides.slide3Insight, fonts)
    const r4 = renderCtaSlide(slides.slide4Takeaway, fonts)
    const [s1, s2, s3, s4] = await Promise.all([
      r1.arrayBuffer(), r2.arrayBuffer(), r3.arrayBuffer(), r4.arrayBuffer(),
    ])

    const slideBuffers = [Buffer.from(s1), Buffer.from(s2), Buffer.from(s3), Buffer.from(s4)]

    // Upload individual PNGs and build ZIP simultaneously
    const zip = new JSZip()
    const slideUrls: string[] = []

    for (let i = 0; i < 4; i++) {
      const filePath = `${date}-${i + 1}.png`
      zip.file(filePath, slideBuffers[i])

      const { error: uploadError } = await supabase.storage
        .from('instagram-posts')
        .upload(filePath, slideBuffers[i], { contentType: 'image/png', upsert: true })

      if (uploadError) throw new Error(`Upload failed for slide ${i + 1}: ${uploadError.message}`)

      const { data: urlData } = supabase.storage.from('instagram-posts').getPublicUrl(filePath)
      slideUrls.push(urlData.publicUrl)
    }

    // Generate and upload ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    const zipPath = `${date}-carousel.zip`
    const { error: zipError } = await supabase.storage
      .from('instagram-posts')
      .upload(zipPath, zipBuffer, { contentType: 'application/zip', upsert: true })

    if (zipError) throw new Error(`ZIP upload failed: ${zipError.message}`)

    const { data: zipUrlData } = supabase.storage.from('instagram-posts').getPublicUrl(zipPath)

    return NextResponse.json({
      success: true,
      slideUrls,
      zipUrl: zipUrlData.publicUrl,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
