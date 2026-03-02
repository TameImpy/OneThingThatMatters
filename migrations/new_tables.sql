-- Run these in your Supabase SQL editor

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  subscribed_at timestamptz default now(),
  active boolean default true
);

-- Migration: add name column to existing subscribers table
-- ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS name text;

create table if not exists newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  issue_date date unique not null,
  watch_id uuid references watch_candidates(id),
  news_id text references ai_news_top5(id),
  paper_id text references ai_paper_candidates(id),
  story_id uuid references stories_of_past_candidates(id),
  art_id uuid references newsletter_daily_art(id),
  sent_at timestamptz,
  subscriber_count int,
  created_at timestamptz default now()
);
