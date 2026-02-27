// ─── Watch ────────────────────────────────────────────────────────────────────

export interface WatchCandidate {
  id: string
  video_id: string
  channel_id: string
  channel_name: string
  title: string
  url: string
  summary: string
  why_it_matters: string
  fit_score: number
  fit_rationale: string | null
  published_at: string
  thumbnail_url: string | null
  view_count: number | null
  like_count: number | null
  duration_seconds: number | null
  picked: boolean
  picked_at: string | null
  ingested_at: string
  created_at: string
  updated_at: string
}

// ─── Read (AI News) ───────────────────────────────────────────────────────────

export interface AiNewsTop5 {
  id: string
  run_date: string
  title: string
  url: string
  source: string
  summary: string
  why_it_matters: string
  fit_score: number | null
  picked: boolean
  picked_at: string | null
  created_at: string
  updated_at: string
}

// ─── Research (AI Papers) ─────────────────────────────────────────────────────

export interface AiPaperCandidate {
  id: string
  run_date: string
  title: string
  authors: string | null
  pdf_url: string | null
  abstract: string | null
  summary_llm: string | null
  why_it_matters: string | null
  fit_score: number | null
  picked: boolean
  picked_at: string | null
  created_at: string
}

// ─── Story (On This Day) ──────────────────────────────────────────────────────

export interface StoryOfPastCandidate {
  id: string
  newsletter_date: string
  this_time_line: string
  event_summary: string
  why_it_mattered: string
  echo_today: string | null
  year_offset: number | null
  fit_score: number | null
  selected: boolean
  created_at: string
}

// ─── Art (Daily) ──────────────────────────────────────────────────────────────

export interface NewsletterDailyArt {
  id: string
  issue_date: string
  image_url: string
  caption: string | null
  artist_name: string | null
  created_at: string
}

// ─── Newsletter Issue ─────────────────────────────────────────────────────────

export interface NewsletterIssue {
  id: string
  issue_date: string
  watch_id: string | null
  news_id: string | null
  paper_id: string | null
  story_id: string | null
  art_id: string | null
  sent_at: string | null
  subscriber_count: number | null
  created_at: string
}

// ─── Subscriber ───────────────────────────────────────────────────────────────

export interface Subscriber {
  id: string
  email: string
  subscribed_at: string
  active: boolean
}

// ─── Quote of the Day ─────────────────────────────────────────────────────────

export interface DailyQuote {
  text: string
  author: string        // e.g. "Richard Feynman, Physicist"
  attribution: string   // e.g. "Lecture at Caltech, 1964"
  relevance: string     // why it connects to today's content
}

// ─── API helpers ──────────────────────────────────────────────────────────────

export type CategoryTable =
  | 'watch_candidates'
  | 'ai_news_top5'
  | 'ai_paper_candidates'
  | 'stories_of_past_candidates'
  | 'newsletter_daily_art'

export interface PickRequest {
  table: CategoryTable
  id: string
}

export interface TodayPicks {
  watch: WatchCandidate | null
  news: AiNewsTop5 | null
  research: AiPaperCandidate | null
  story: StoryOfPastCandidate | null
}

export interface PublishRequest {
  issue_date: string
  picks: TodayPicks
  art_id: string | null
  overrides?: Partial<Record<string, string>>
}
