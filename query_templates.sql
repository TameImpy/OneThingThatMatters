-- ============================================================================
-- One Thing That Matters - SQL Query Templates
-- ============================================================================
-- Common queries for interacting with watch_candidates table
-- Use these as reference for REST API calls or direct SQL queries

-- ============================================================================
-- 1. UPSERT VIDEO CANDIDATE (for n8n ingestion)
-- ============================================================================
-- Inserts new video or updates existing one based on video_id
-- Fields NOT updated on conflict: used_in_issue_date, discarded

INSERT INTO watch_candidates (
  video_id,
  channel_id,
  channel_name,
  title,
  summary,
  why_it_matters,
  fit_score,
  fit_rationale,
  published_at,
  thumbnail_url,
  view_count,
  like_count,
  duration_seconds,
  url
) VALUES (
  'dQw4w9WgXcQ',  -- Replace with actual video_id
  'UCuAXFkgsw1L7xaCfnd5JJOw',  -- channel_id
  'Rick Astley',  -- channel_name
  'Never Gonna Give You Up',  -- title
  'Classic 1980s pop music video...',  -- summary
  'Demonstrates the enduring power of internet culture...',  -- why_it_matters
  7,  -- fit_score (1-10)
  'Strong cultural relevance but limited educational value',  -- fit_rationale
  '1987-10-25T00:00:00Z',  -- published_at
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',  -- thumbnail_url
  1234567890,  -- view_count
  12345678,  -- like_count
  212,  -- duration_seconds
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'  -- url
)
ON CONFLICT (video_id)
DO UPDATE SET
  channel_id = EXCLUDED.channel_id,
  channel_name = EXCLUDED.channel_name,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  why_it_matters = EXCLUDED.why_it_matters,
  fit_score = EXCLUDED.fit_score,
  fit_rationale = EXCLUDED.fit_rationale,
  published_at = EXCLUDED.published_at,
  thumbnail_url = EXCLUDED.thumbnail_url,
  view_count = EXCLUDED.view_count,
  like_count = EXCLUDED.like_count,
  duration_seconds = EXCLUDED.duration_seconds,
  url = EXCLUDED.url,
  updated_at = NOW()
-- Note: used_in_issue_date and discarded are NOT updated on conflict
RETURNING *;

-- ============================================================================
-- 2. GET DAILY SHORTLIST (Top 5 unused candidates)
-- ============================================================================
-- Returns top 5 candidates sorted by fit_score and recency
-- Excludes used and discarded videos

SELECT
  id,
  video_id,
  channel_name,
  title,
  summary,
  why_it_matters,
  fit_score,
  fit_rationale,
  published_at,
  thumbnail_url,
  view_count,
  like_count,
  duration_seconds,
  url,
  created_at
FROM watch_candidates
WHERE used_in_issue_date IS NULL
  AND discarded = false
ORDER BY fit_score DESC, published_at DESC
LIMIT 5;

-- ============================================================================
-- 3. GET EXTENDED SHORTLIST (Top 10 for backup options)
-- ============================================================================

SELECT
  id,
  video_id,
  channel_name,
  title,
  summary,
  why_it_matters,
  fit_score,
  fit_rationale,
  published_at,
  thumbnail_url,
  url
FROM watch_candidates
WHERE used_in_issue_date IS NULL
  AND discarded = false
ORDER BY fit_score DESC, published_at DESC
LIMIT 10;

-- ============================================================================
-- 4. MARK VIDEO AS SELECTED FOR NEWSLETTER
-- ============================================================================
-- Updates used_in_issue_date to remove from future shortlists

UPDATE watch_candidates
SET used_in_issue_date = CURRENT_DATE
WHERE id = 'replace-with-uuid'
RETURNING *;

-- Alternative: Mark by video_id
UPDATE watch_candidates
SET used_in_issue_date = CURRENT_DATE
WHERE video_id = 'dQw4w9WgXcQ'
RETURNING *;

-- ============================================================================
-- 5. DISCARD VIDEO (Manual rejection)
-- ============================================================================
-- Marks video as discarded so it never appears in shortlists

UPDATE watch_candidates
SET discarded = true
WHERE id = 'replace-with-uuid'
RETURNING *;

-- Alternative: Discard by video_id
UPDATE watch_candidates
SET discarded = true
WHERE video_id = 'dQw4w9WgXcQ'
RETURNING *;

-- ============================================================================
-- 6. GET VIDEO BY ID (Check if already exists)
-- ============================================================================

SELECT * FROM watch_candidates
WHERE video_id = 'dQw4w9WgXcQ';

-- ============================================================================
-- 7. GET ALL USED VIDEOS (For newsletter archive)
-- ============================================================================

SELECT
  id,
  video_id,
  title,
  channel_name,
  summary,
  why_it_matters,
  fit_score,
  used_in_issue_date,
  url
FROM watch_candidates
WHERE used_in_issue_date IS NOT NULL
ORDER BY used_in_issue_date DESC;

-- ============================================================================
-- 8. GET VIDEOS BY DATE RANGE
-- ============================================================================

SELECT * FROM watch_candidates
WHERE published_at >= '2024-01-01'
  AND published_at < '2024-02-01'
ORDER BY published_at DESC;

-- ============================================================================
-- 9. GET STATISTICS
-- ============================================================================

-- Overall statistics
SELECT
  COUNT(*) as total_videos,
  COUNT(*) FILTER (WHERE used_in_issue_date IS NOT NULL) as used_videos,
  COUNT(*) FILTER (WHERE discarded = true) as discarded_videos,
  COUNT(*) FILTER (WHERE used_in_issue_date IS NULL AND discarded = false) as available_videos,
  AVG(fit_score)::NUMERIC(10,2) as avg_fit_score,
  MAX(fit_score) as max_fit_score,
  MIN(fit_score) as min_fit_score
FROM watch_candidates;

-- Fit score distribution
SELECT
  fit_score,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM watch_candidates
GROUP BY fit_score
ORDER BY fit_score DESC;

-- ============================================================================
-- 10. GET VIDEOS BY CHANNEL
-- ============================================================================

SELECT
  channel_name,
  COUNT(*) as video_count,
  AVG(fit_score)::NUMERIC(10,2) as avg_fit_score
FROM watch_candidates
GROUP BY channel_name
ORDER BY video_count DESC
LIMIT 10;

-- ============================================================================
-- 11. SEARCH BY KEYWORD IN TITLE OR SUMMARY
-- ============================================================================

SELECT
  id,
  video_id,
  title,
  channel_name,
  fit_score,
  summary,
  url
FROM watch_candidates
WHERE (
  title ILIKE '%keyword%'
  OR summary ILIKE '%keyword%'
  OR why_it_matters ILIKE '%keyword%'
)
AND used_in_issue_date IS NULL
AND discarded = false
ORDER BY fit_score DESC;

-- ============================================================================
-- 12. BULK DISCARD LOW-SCORING VIDEOS
-- ============================================================================
-- Use with caution: marks all videos with fit_score <= 3 as discarded

-- Dry run (see what would be discarded)
SELECT id, video_id, title, fit_score
FROM watch_candidates
WHERE fit_score <= 3
  AND discarded = false
  AND used_in_issue_date IS NULL;

-- Actual update (uncomment to execute)
-- UPDATE watch_candidates
-- SET discarded = true
-- WHERE fit_score <= 3
--   AND discarded = false
--   AND used_in_issue_date IS NULL;

-- ============================================================================
-- 13. RESET VIDEO TO AVAILABLE (Undo selection/discard)
-- ============================================================================
-- Use if you accidentally marked a video

UPDATE watch_candidates
SET
  used_in_issue_date = NULL,
  discarded = false
WHERE id = 'replace-with-uuid'
RETURNING *;

-- ============================================================================
-- 14. DELETE VIDEO (Use sparingly)
-- ============================================================================
-- Only delete if truly incorrect/spam data

DELETE FROM watch_candidates
WHERE id = 'replace-with-uuid'
RETURNING *;

-- ============================================================================
-- 15. GET RECENT ADDITIONS (Last 24 hours)
-- ============================================================================

SELECT
  id,
  video_id,
  title,
  channel_name,
  fit_score,
  created_at,
  url
FROM watch_candidates
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- ============================================================================
-- 16. VALIDATION QUERIES
-- ============================================================================

-- Check for duplicate video_ids (should return 0 rows)
SELECT video_id, COUNT(*) as count
FROM watch_candidates
GROUP BY video_id
HAVING COUNT(*) > 1;

-- Check for invalid fit_scores (should return 0 rows)
SELECT id, video_id, fit_score
FROM watch_candidates
WHERE fit_score < 1 OR fit_score > 10;

-- Check for NULL required fields (should return 0 rows)
SELECT id, video_id
FROM watch_candidates
WHERE video_id IS NULL
   OR channel_id IS NULL
   OR channel_name IS NULL
   OR title IS NULL
   OR summary IS NULL
   OR why_it_matters IS NULL
   OR fit_score IS NULL
   OR url IS NULL;

-- ============================================================================
-- 17. MAINTENANCE QUERIES
-- ============================================================================

-- Get table size
SELECT
  pg_size_pretty(pg_total_relation_size('watch_candidates')) as total_size,
  pg_size_pretty(pg_relation_size('watch_candidates')) as table_size,
  pg_size_pretty(pg_total_relation_size('watch_candidates') - pg_relation_size('watch_candidates')) as indexes_size;

-- Get row count
SELECT COUNT(*) FROM watch_candidates;

-- Vacuum table (cleanup and optimize)
-- VACUUM ANALYZE watch_candidates;
