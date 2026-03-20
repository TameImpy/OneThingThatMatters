-- Run in your Supabase SQL editor to deduplicate open tracking
-- Each subscriber can only count as one open per issue

CREATE TABLE IF NOT EXISTS newsletter_open_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_date date NOT NULL,
  email text NOT NULL,
  opened_at timestamptz DEFAULT now(),
  UNIQUE (issue_date, email)
);
