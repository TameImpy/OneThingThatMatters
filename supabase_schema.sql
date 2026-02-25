-- ============================================================================
-- One Thing That Matters - Supabase Backend Schema
-- Version: 1.0
-- Purpose: Create watch_candidates table for YouTube video curation pipeline
-- ============================================================================

-- Drop existing table if it exists (use with caution in production)
-- DROP TABLE IF EXISTS watch_candidates CASCADE;

-- ============================================================================
-- CREATE TABLE: watch_candidates
-- ============================================================================
-- Stores YouTube video candidates enriched by n8n LLM pipeline
-- Supports deduplication, scoring, and selection tracking

CREATE TABLE watch_candidates (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- YouTube metadata (required)
  video_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,

  -- LLM-generated content (required)
  summary TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  fit_score INTEGER NOT NULL CHECK (fit_score >= 1 AND fit_score <= 10),
  fit_rationale TEXT,

  -- YouTube metadata (optional)
  published_at TIMESTAMPTZ NOT NULL,
  thumbnail_url TEXT,
  view_count INTEGER,
  like_count INTEGER,
  duration_seconds NUMERIC,

  -- Workflow state tracking
  used_in_issue_date DATE DEFAULT NULL,
  discarded BOOLEAN DEFAULT false,

  -- Timestamps (Supabase auto-manages these if enabled)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ingested_at TIMESTAMPTZ DEFAULT NOW(), -- First discovery timestamp (immutable)

  -- Constraints
  CONSTRAINT unique_video UNIQUE(video_id)
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- Index for shortlist queries (ranking by fit_score and recency)
CREATE INDEX watch_candidates_fit_score_idx
ON watch_candidates (fit_score DESC, published_at DESC);

-- Index for filtering by usage state
CREATE INDEX watch_candidates_usage_idx
ON watch_candidates (used_in_issue_date, discarded)
WHERE used_in_issue_date IS NULL AND discarded = false;

-- Index for video_id lookups (faster upserts)
CREATE INDEX watch_candidates_video_id_idx
ON watch_candidates (video_id);

-- ============================================================================
-- COMMENTS (for documentation)
-- ============================================================================

COMMENT ON TABLE watch_candidates IS
'Stores YouTube video candidates enriched by n8n LLM pipeline. Supports deduplication via video_id, scoring, and newsletter selection tracking.';

COMMENT ON COLUMN watch_candidates.video_id IS
'Unique YouTube video identifier (e.g., dQw4w9WgXcQ). Used for deduplication.';

COMMENT ON COLUMN watch_candidates.fit_score IS
'LLM-generated relevance score from 1-10, where 10 is most relevant to newsletter audience.';

COMMENT ON COLUMN watch_candidates.used_in_issue_date IS
'Date this video was selected for a newsletter issue. NULL means not yet used.';

COMMENT ON COLUMN watch_candidates.discarded IS
'Manual rejection flag. Discarded videos never appear in shortlists.';

COMMENT ON COLUMN watch_candidates.ingested_at IS
'First discovery timestamp (immutable). Used for shortlist recency queries. Set once on insert, never updated.';

-- ============================================================================
-- FUNCTIONS (Optional: Auto-update updated_at timestamp)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_watch_candidates_updated_at
BEFORE UPDATE ON watch_candidates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Phase 1: RLS disabled for simplicity
-- Phase 2: Enable RLS with read-only policies for anon key

-- Disable RLS initially (service role key has full access)
ALTER TABLE watch_candidates DISABLE ROW LEVEL SECURITY;

-- Future: Enable RLS and add policies
-- ALTER TABLE watch_candidates ENABLE ROW LEVEL SECURITY;

-- Future: Read-only policy for anon key
-- CREATE POLICY "Allow anonymous read access"
-- ON watch_candidates FOR SELECT
-- USING (true);

-- Future: Write policy for service role only
-- CREATE POLICY "Allow service role full access"
-- ON watch_candidates FOR ALL
-- USING (auth.role() = 'service_role');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'watch_candidates'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'watch_candidates';

-- Check constraints
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'watch_candidates';
