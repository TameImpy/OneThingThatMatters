import { NextRequest, NextResponse } from 'next/server'

function countWeekdays(start: Date, end: Date): number {
  let count = 0
  const current = new Date(start)
  while (current <= end) {
    const day = current.getDay() // 0=Sun, 6=Sat
    if (day !== 0 && day !== 6) count++
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return count
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const launchDate = process.env.NEWSLETTER_START_DATE ?? '2026-02-27'

  const launch = new Date(launchDate + 'T12:00:00Z')
  const target = new Date(date + 'T12:00:00Z')

  const issueNumber = Math.max(1, countWeekdays(launch, target))

  return NextResponse.json({ issueNumber })
}
