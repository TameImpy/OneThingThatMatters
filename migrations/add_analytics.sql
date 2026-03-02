-- Run in your Supabase SQL editor to add open/click analytics

ALTER TABLE newsletter_issues
  ADD COLUMN IF NOT EXISTS open_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS click_count int DEFAULT 0;

-- Atomic increment helper used by tracking API routes
CREATE OR REPLACE FUNCTION increment_open_count(p_date date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE newsletter_issues SET open_count = open_count + 1 WHERE issue_date = p_date;
END;
$$;

CREATE OR REPLACE FUNCTION increment_click_count(p_date date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE newsletter_issues SET click_count = click_count + 1 WHERE issue_date = p_date;
END;
$$;
