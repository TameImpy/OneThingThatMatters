import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { count, error } = await supabase
    .from('newsletter_issues')
    .select('*', { count: 'exact', head: true })
  if (error) return NextResponse.json({ count: 0 })
  return NextResponse.json({ count: count ?? 0 })
}
