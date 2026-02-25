# One Thing That Matters - Supabase Backend Setup Guide

Complete step-by-step guide for implementing the Supabase backend for your agentic newsletter system.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Supabase Setup](#supabase-setup)
4. [Database Schema Creation](#database-schema-creation)
5. [Environment Configuration](#environment-configuration)
6. [n8n Integration](#n8n-integration)
7. [Testing & Validation](#testing--validation)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have:

- [ ] A Supabase account (sign up at https://supabase.com)
- [ ] Access to your n8n instance (cloud or self-hosted)
- [ ] YouTube API key (optional, if not already configured)
- [ ] Basic understanding of REST APIs and SQL

---

## Project Structure

Your project now contains these files:

```
Pivot5/
├── One_Thing_That_Matters_PRD.md          # Product requirements
├── One_Thing_That_Matters_Tasks.md        # Implementation tasks
├── SETUP_GUIDE.md                         # This file
├── supabase_schema.sql                    # Database schema creation
├── query_templates.sql                    # Common SQL queries
├── n8n_supabase_config.md                 # n8n integration guide
├── .env.example                           # Environment template
└── .gitignore                             # Git ignore rules
```

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details:
   - **Name:** one-thing-that-matters (or your choice)
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Select closest to your location
   - **Pricing Plan:** Free tier is sufficient to start
4. Click "Create new project"
5. Wait 2-3 minutes for project provisioning

### Step 2: Get Your API Keys

1. Once project is ready, go to **Settings** → **API**
2. Copy these values (you'll need them soon):
   ```
   Project URL:     https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (click "Reveal" first)
   ```

**IMPORTANT:** Keep your `service_role` key secret! Never expose it in frontend code or commit it to version control.

---

## Database Schema Creation

### Step 1: Open SQL Editor

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click "New query" button

### Step 2: Run Schema Creation Script

1. Open the `supabase_schema.sql` file from this project
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

You should see:
```
Success. No rows returned
```

### Step 3: Verify Table Creation

Run this verification query:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'watch_candidates'
ORDER BY ordinal_position;
```

You should see all columns listed (video_id, channel_id, title, summary, etc.).

### Step 4: Verify Indexes

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'watch_candidates';
```

You should see 4 indexes:
- `watch_candidates_pkey` (primary key on id)
- `unique_video` (unique constraint on video_id)
- `watch_candidates_fit_score_idx` (for ranking queries)
- `watch_candidates_usage_idx` (for filtering available videos)
- `watch_candidates_video_id_idx` (for upsert performance)

---

## Environment Configuration

### Step 1: Create .env File

1. Copy the template:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```bash
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   ```

### Step 2: Verify .gitignore

Ensure `.env` is listed in `.gitignore` to prevent accidental commits:

```bash
cat .gitignore | grep .env
```

Should show:
```
.env
.env.local
.env.*.local
```

---

## n8n Integration

### Step 1: Add Supabase Credentials to n8n

#### Option A: n8n Cloud
1. Go to your n8n workspace
2. Click **Settings** → **Environments**
3. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`

#### Option B: Self-hosted n8n
1. Add to your n8n environment file or docker-compose.yml:
   ```yaml
   environment:
     - SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
     - SUPABASE_SERVICE_KEY=your-service-role-key
   ```
2. Restart n8n

### Step 2: Update Your Existing n8n Workflow

You mentioned you've already built the first core agentic flow. Now we need to connect it to Supabase.

#### Find Your LLM Output Node

Locate the node in your workflow that outputs the enriched video data with fields like:
- summary
- why_it_matters
- fit_score
- fit_rationale

#### Add HTTP Request Node After LLM

1. Add **HTTP Request** node after your LLM enrichment
2. Configure as follows:

**Authentication:** None (we'll use headers)

**Request Method:** POST

**URL:**
```
{{$env.SUPABASE_URL}}/rest/v1/watch_candidates?on_conflict=video_id
```

**Headers:**
```json
{
  "apikey": "{{$env.SUPABASE_SERVICE_KEY}}",
  "Authorization": "Bearer {{$env.SUPABASE_SERVICE_KEY}}",
  "Content-Type": "application/json",
  "Prefer": "resolution=merge-duplicates"
}
```

**Body (JSON):**
```json
{
  "video_id": "{{$json.videoId}}",
  "channel_id": "{{$json.channelId}}",
  "channel_name": "{{$json.channelName}}",
  "title": "{{$json.title}}",
  "summary": "{{$json.summary}}",
  "why_it_matters": "{{$json.whyItMatters}}",
  "fit_score": {{$json.fitScore}},
  "fit_rationale": "{{$json.fitRationale}}",
  "published_at": "{{$json.publishedAt}}",
  "thumbnail_url": "{{$json.thumbnailUrl}}",
  "view_count": {{$json.viewCount}},
  "like_count": {{$json.likeCount}},
  "duration_seconds": {{$json.durationSeconds}},
  "url": "{{$json.url}}"
}
```

**Note:** Adjust field names (`$json.videoId`, etc.) to match your actual n8n output structure.

### Step 3: Map Your Fields

Open `n8n_supabase_config.md` for detailed field mapping examples, including:
- YouTube API field mappings
- LLM output field mappings
- Duration conversion (ISO 8601 to seconds)
- Error handling patterns

---

## Testing & Validation

### Phase 1: Manual SQL Test

Before testing n8n integration, verify Supabase works with a manual insert:

1. In Supabase SQL Editor, run:

```sql
INSERT INTO watch_candidates (
  video_id,
  channel_id,
  channel_name,
  title,
  summary,
  why_it_matters,
  fit_score,
  published_at,
  url
) VALUES (
  'test_video_123',
  'test_channel',
  'Test Channel',
  'Test Video Title',
  'This is a test summary',
  'This matters because it tests the system',
  8,
  NOW(),
  'https://youtube.com/watch?v=test_video_123'
);
```

2. Verify it was inserted:

```sql
SELECT * FROM watch_candidates WHERE video_id = 'test_video_123';
```

3. Try inserting again (should update, not duplicate):

```sql
INSERT INTO watch_candidates (
  video_id,
  channel_id,
  channel_name,
  title,
  summary,
  why_it_matters,
  fit_score,
  published_at,
  url
) VALUES (
  'test_video_123',
  'test_channel',
  'Test Channel',
  'UPDATED Test Video Title',
  'This is an UPDATED summary',
  'This matters because it tests upsert functionality',
  9,
  NOW(),
  'https://youtube.com/watch?v=test_video_123'
)
ON CONFLICT (video_id)
DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  why_it_matters = EXCLUDED.why_it_matters,
  fit_score = EXCLUDED.fit_score,
  updated_at = NOW();
```

4. Verify row count is still 1:

```sql
SELECT COUNT(*) FROM watch_candidates WHERE video_id = 'test_video_123';
```

5. Clean up test data:

```sql
DELETE FROM watch_candidates WHERE video_id = 'test_video_123';
```

### Phase 2: n8n Integration Test

1. **Run Your Workflow Once:**
   - Execute your n8n workflow with 1-2 test videos
   - Check n8n execution log for HTTP Request success (200 or 201 status)

2. **Verify in Supabase:**
   ```sql
   SELECT
     video_id,
     title,
     channel_name,
     fit_score,
     created_at
   FROM watch_candidates
   ORDER BY created_at DESC
   LIMIT 5;
   ```

3. **Test Deduplication:**
   - Run the same workflow again with the same videos
   - Verify row count doesn't increase:
     ```sql
     SELECT COUNT(*) FROM watch_candidates;
     ```
   - Check `updated_at` changed but `created_at` stayed the same

### Phase 3: Shortlist Query Test

1. Insert multiple test videos with different fit_scores

2. Run shortlist query:
   ```sql
   SELECT
     id,
     video_id,
     title,
     fit_score,
     published_at
   FROM watch_candidates
   WHERE used_in_issue_date IS NULL
     AND discarded = false
   ORDER BY fit_score DESC, published_at DESC
   LIMIT 5;
   ```

3. Verify results are sorted by fit_score (highest first)

### Phase 4: Selection Workflow Test

1. Select a video from your shortlist (copy its `id`)

2. Mark it as used:
   ```sql
   UPDATE watch_candidates
   SET used_in_issue_date = CURRENT_DATE
   WHERE id = 'paste-uuid-here'
   RETURNING *;
   ```

3. Run shortlist query again - video should be gone

4. Try to mark it again - should have no effect (idempotent)

### Phase 5: Full Pipeline Test

1. Run your complete n8n workflow (YouTube → LLM → Supabase)
2. Verify all videos appear in Supabase
3. Call shortlist endpoint via n8n or API client
4. Select top candidate (via SQL or future UI)
5. Verify shortlist updates correctly

---

## Troubleshooting

### Issue: "relation watch_candidates does not exist"

**Cause:** Schema not created or wrong database

**Solution:**
1. Verify you're in the correct Supabase project
2. Re-run `supabase_schema.sql`
3. Check SQL Editor for errors

### Issue: Duplicate videos appearing in database

**Cause:** Missing `?on_conflict=video_id` parameter

**Solution:**
1. Update n8n HTTP Request URL to include `?on_conflict=video_id`
2. Delete duplicates:
   ```sql
   DELETE FROM watch_candidates a USING (
     SELECT MIN(id) as id, video_id
     FROM watch_candidates
     GROUP BY video_id
     HAVING COUNT(*) > 1
   ) b
   WHERE a.video_id = b.video_id AND a.id != b.id;
   ```

### Issue: 401 Unauthorized in n8n

**Cause:** Missing or incorrect API keys

**Solution:**
1. Verify environment variables are set in n8n
2. Check both `apikey` and `Authorization` headers
3. Ensure you're using `SUPABASE_SERVICE_KEY` (not anon key)
4. Test API key with curl:
   ```bash
   curl -X GET \
     "$SUPABASE_URL/rest/v1/watch_candidates?limit=1" \
     -H "apikey: $SUPABASE_SERVICE_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
   ```

### Issue: fit_score validation error

**Cause:** fit_score not an integer or outside 1-10 range

**Solution:**
1. Add validation in n8n before sending to Supabase:
   ```javascript
   // Code node
   const fitScore = parseInt($json.fitScore);
   if (fitScore < 1 || fitScore > 10) {
     throw new Error(`Invalid fit_score: ${fitScore}. Must be 1-10.`);
   }
   return { ...$json, fitScore };
   ```

### Issue: NULL constraint violation

**Cause:** Required field missing from payload

**Solution:**
1. Check n8n execution log to see which field is NULL
2. Add conditional logic or default values:
   ```javascript
   return {
     ...input,
     channel_id: $json.channelId || 'unknown',
     channel_name: $json.channelName || 'Unknown Channel',
     summary: $json.summary || 'No summary available'
   };
   ```

### Issue: Shortlist returns videos already used

**Cause:** `used_in_issue_date` not set correctly

**Solution:**
1. Verify date format is YYYY-MM-DD
2. Check SQL query includes `WHERE used_in_issue_date IS NULL`
3. Inspect database:
   ```sql
   SELECT video_id, used_in_issue_date
   FROM watch_candidates
   WHERE used_in_issue_date IS NOT NULL;
   ```

---

## Next Steps

### Immediate Next Steps

1. **Test Your Setup:**
   - [ ] Complete all testing phases above
   - [ ] Run your n8n workflow end-to-end
   - [ ] Verify shortlist queries work

2. **Migrate Existing Data:**
   If you have videos in a Google Sheet:
   - [ ] Export sheet data as CSV
   - [ ] Create n8n bulk import workflow (see `n8n_supabase_config.md` → Bulk Upsert)
   - [ ] Validate no duplicates created

3. **Document Your Workflow:**
   - [ ] Note any custom field mappings you used
   - [ ] Document your LLM prompt structure
   - [ ] Record typical fit_score distributions

### Future Enhancements

1. **Build Selection UI:**
   - Simple web app to view shortlist and select videos
   - Use `SUPABASE_ANON_KEY` for frontend (read-only)
   - Use Supabase Auth for admin access

2. **Add More Categories:**
   - Duplicate schema for `listen_candidates` (podcasts)
   - Create `read_candidates` (articles)
   - Eventually create unified `content_candidates` table

3. **Implement RLS (Row Level Security):**
   - Enable RLS on `watch_candidates`
   - Create policies for read-only anon access
   - Restrict write access to service role only

4. **Add Analytics:**
   - Track which videos perform best in newsletters
   - Analyze fit_score accuracy over time
   - Build feedback loop to improve LLM scoring

5. **Automation:**
   - Schedule n8n workflow to run daily
   - Auto-generate shortlist email each morning
   - Eventually: fully automated newsletter generation

---

## Quick Reference Commands

### Supabase SQL Editor Shortcuts

```sql
-- View all videos
SELECT * FROM watch_candidates ORDER BY created_at DESC LIMIT 10;

-- Get shortlist
SELECT * FROM watch_candidates
WHERE used_in_issue_date IS NULL AND discarded = false
ORDER BY fit_score DESC, published_at DESC LIMIT 5;

-- Mark as used
UPDATE watch_candidates SET used_in_issue_date = CURRENT_DATE WHERE id = 'uuid';

-- Mark as discarded
UPDATE watch_candidates SET discarded = true WHERE id = 'uuid';

-- Get statistics
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE used_in_issue_date IS NOT NULL) as used,
  COUNT(*) FILTER (WHERE discarded = true) as discarded,
  COUNT(*) FILTER (WHERE used_in_issue_date IS NULL AND discarded = false) as available
FROM watch_candidates;

-- Find duplicates (should return 0 rows)
SELECT video_id, COUNT(*) FROM watch_candidates GROUP BY video_id HAVING COUNT(*) > 1;
```

### n8n HTTP Request Quick Config

```
URL: {{$env.SUPABASE_URL}}/rest/v1/watch_candidates?on_conflict=video_id
Method: POST
Headers:
  apikey: {{$env.SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{$env.SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
  Prefer: resolution=merge-duplicates
```

---

## Resources

- **Supabase Dashboard:** https://app.supabase.com
- **Supabase Docs:** https://supabase.com/docs
- **n8n Docs:** https://docs.n8n.io
- **YouTube Data API:** https://developers.google.com/youtube/v3
- **PostgREST API:** https://postgrest.org

---

## Support

For issues specific to this project:
1. Check `query_templates.sql` for SQL examples
2. Check `n8n_supabase_config.md` for integration details
3. Review the troubleshooting section above

For general Supabase issues:
- Supabase Discord: https://discord.supabase.com
- Supabase Docs: https://supabase.com/docs

For n8n issues:
- n8n Community: https://community.n8n.io
- n8n Discord: https://discord.gg/n8n

---

## Success Criteria Checklist

- [ ] Supabase project created
- [ ] Database schema deployed (watch_candidates table exists)
- [ ] Environment variables configured in n8n
- [ ] n8n workflow successfully inserts videos to Supabase
- [ ] Duplicate videos are prevented (upsert works correctly)
- [ ] Shortlist query returns top 5 unused videos
- [ ] Selection workflow removes videos from shortlist
- [ ] No SQL errors or constraint violations
- [ ] Data validates correctly (fit_scores 1-10, no NULLs in required fields)

Once all items are checked, your Supabase backend is production-ready!

---

**Good luck with your agentic newsletter project! 🚀**
