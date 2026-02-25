-- ============================================================================
-- Migration: Add ingested_at column to watch_candidates
-- Date: 2025-12-09
-- Purpose: Add immutable ingested_at timestamp for tracking first discovery
-- ============================================================================

-- Add the column with default value
ALTER TABLE watch_candidates
ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMPTZ DEFAULT NOW();

-- For existing rows, copy created_at to ingested_at
-- (Only updates rows where ingested_at is NULL)
UPDATE watch_candidates
SET ingested_at = created_at
WHERE ingested_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN watch_candidates.ingested_at IS
'First discovery timestamp (immutable). Used for shortlist recency queries. Set once on insert, never updated.';

-- Create index for shortlist queries using ingested_at
CREATE INDEX IF NOT EXISTS watch_candidates_ingested_at_idx
ON watch_candidates (ingested_at DESC)
WHERE used_in_issue_date IS NULL AND discarded = false;

-- Verification query
-- SELECT id, video_id, created_at, ingested_at, updated_at
-- FROM watch_candidates
-- ORDER BY ingested_at DESC
-- LIMIT 5;
