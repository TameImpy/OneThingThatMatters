-- Run in your Supabase SQL editor to add double opt-in support

ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS confirmation_token text,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

-- Treat all existing active subscribers as already confirmed
UPDATE subscribers
SET confirmed_at = now()
WHERE active = true AND confirmed_at IS NULL;

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS subscribers_confirmation_token_idx
  ON subscribers (confirmation_token)
  WHERE confirmation_token IS NOT NULL;
