# n8n Supabase Integration Configuration

This document provides detailed configuration examples for integrating n8n with your Supabase backend for the "One Thing That Matters" project.

---

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [HTTP Request Node Configuration](#http-request-node-configuration)
3. [Upsert Video Candidate](#1-upsert-video-candidate)
4. [Get Shortlist](#2-get-shortlist)
5. [Mark Video as Selected](#3-mark-video-as-selected)
6. [Discard Video](#4-discard-video)
7. [Check for Duplicates](#5-check-for-duplicates)
8. [Error Handling](#error-handling)
9. [Testing Checklist](#testing-checklist)

---

## Environment Setup

In your n8n instance, set these environment variables or credentials:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Use `SUPABASE_SERVICE_KEY` for write operations in your ingestion pipeline.

---

## HTTP Request Node Configuration

### Base Settings for All Requests

```
Authentication: None (API key in headers)
Request Method: [Varies by operation]
URL: {{$env.SUPABASE_URL}}/rest/v1/watch_candidates[?params]

Headers:
  apikey: {{$env.SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{$env.SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
  Prefer: return=representation
```

**Note:** The `Prefer: return=representation` header ensures Supabase returns the inserted/updated row.

---

## 1. Upsert Video Candidate

**Purpose:** Insert new video or update existing one (deduplication via `video_id`)

### HTTP Request Node Config

```
Method: POST
URL: {{$env.SUPABASE_URL}}/rest/v1/watch_candidates?on_conflict=video_id

Headers:
  apikey: {{$env.SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{$env.SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
  Prefer: resolution=merge-duplicates

Body (JSON):
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

### Example Payload

```json
{
  "video_id": "dQw4w9WgXcQ",
  "channel_id": "UCuAXFkgsw1L7xaCfnd5JJOw",
  "channel_name": "Rick Astley",
  "title": "Never Gonna Give You Up",
  "summary": "Classic 1980s pop music video featuring Rick Astley's breakthrough hit single.",
  "why_it_matters": "Demonstrates the enduring power of internet culture and meme evolution over decades.",
  "fit_score": 7,
  "fit_rationale": "Strong cultural relevance but limited educational value for business audience.",
  "published_at": "1987-10-25T00:00:00Z",
  "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "view_count": 1234567890,
  "like_count": 12345678,
  "duration_seconds": 212,
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

### Field Mapping from LLM Output

Map your n8n LLM output fields to match the schema:

```
YouTube API → Supabase Field
================================
id.videoId → video_id
snippet.channelId → channel_id
snippet.channelTitle → channel_name
snippet.title → title
snippet.publishedAt → published_at
snippet.thumbnails.maxres.url → thumbnail_url
statistics.viewCount → view_count
statistics.likeCount → like_count
contentDetails.duration (convert) → duration_seconds

LLM Output → Supabase Field
================================
summary → summary
whyItMatters → why_it_matters
fitScore → fit_score
fitRationale → fit_rationale
```

### Duration Conversion

YouTube returns duration in ISO 8601 format (e.g., `PT3M32S`). Convert to seconds:

```javascript
// n8n Code Node
const duration = $json.contentDetails.duration; // "PT3M32S"
const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

const hours = parseInt(match[1] || 0);
const minutes = parseInt(match[2] || 0);
const seconds = parseInt(match[3] || 0);

const totalSeconds = hours * 3600 + minutes * 60 + seconds;

return {
  ...input,
  duration_seconds: totalSeconds
};
```

---

## 2. Get Shortlist

**Purpose:** Retrieve top 5 unused, non-discarded candidates for daily selection

### HTTP Request Node Config

```
Method: GET
URL: {{$env.SUPABASE_URL}}/rest/v1/watch_candidates?used_in_issue_date=is.null&discarded=eq.false&order=fit_score.desc,published_at.desc&limit=5

Headers:
  apikey: {{$env.SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{$env.SUPABASE_SERVICE_KEY}}
```

### Response Format

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "video_id": "dQw4w9WgXcQ",
    "channel_name": "Rick Astley",
    "title": "Never Gonna Give You Up",
    "summary": "...",
    "why_it_matters": "...",
    "fit_score": 9,
    "fit_rationale": "...",
    "published_at": "1987-10-25T00:00:00+00:00",
    "thumbnail_url": "...",
    "view_count": 1234567890,
    "like_count": 12345678,
    "duration_seconds": 212,
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "used_in_issue_date": null,
    "discarded": false,
    "created_at": "2024-01-15T10:30:00+00:00",
    "updated_at": "2024-01-15T10:30:00+00:00"
  }
]
```

### Extended Shortlist (Top 10)

```
URL: {{$env.SUPABASE_URL}}/rest/v1/watch_candidates?used_in_issue_date=is.null&discarded=eq.false&order=fit_score.desc,published_at.desc&limit=10
```

---

## 3. Mark Video as Selected

**Purpose:** Mark a video as used in today's newsletter issue

### HTTP Request Node Config

```
Method: PATCH
URL: {{$env.SUPABASE_URL}}/rest/v1/watch_candidates?id=eq.{{$json.id}}

Headers:
  apikey: {{$env.SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{$env.SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
  Prefer: return=representation

Body (JSON):
{
  "used_in_issue_date": "{{$now.format('YYYY-MM-DD')}}"
}
```

### Alternative: Mark by video_id

```
URL: {{$env.SUPABASE_URL}}/rest/v1/watch_candidates?video_id=eq.{{$json.video_id}}
```

### Example with Static Date

```json
{
  "used_in_issue_date": "2024-01-15"
}
```

---

## 4. Discard Video

**Purpose:** Manually reject a video so it never appears in shortlists

### HTTP Request Node Config

```
Method: PATCH
URL: {{$env.SUPABASE_URL}}/rest/v1/watch_candidates?id=eq.{{$json.id}}

Headers:
  apikey: {{$env.SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{$env.SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
  Prefer: return=representation

Body (JSON):
{
  "discarded": true
}
```

---

## 5. Check for Duplicates

**Purpose:** Verify a video doesn't already exist before processing (optional optimization)

### HTTP Request Node Config

```
Method: GET
URL: {{$env.SUPABASE_URL}}/rest/v1/watch_candidates?video_id=eq.{{$json.videoId}}&select=id,video_id,fit_score,used_in_issue_date

Headers:
  apikey: {{$env.SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{$env.SUPABASE_SERVICE_KEY}}
```

### Response

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "video_id": "dQw4w9WgXcQ",
    "fit_score": 9,
    "used_in_issue_date": null
  }
]
```

If the array is empty, the video doesn't exist yet.

---

## Error Handling

### Common Error Responses

#### 1. Duplicate Key Violation (without on_conflict)

```json
{
  "code": "23505",
  "details": "Key (video_id)=(dQw4w9WgXcQ) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint \"unique_video\""
}
```

**Solution:** Add `?on_conflict=video_id` to your URL.

#### 2. Check Constraint Violation (invalid fit_score)

```json
{
  "code": "23514",
  "details": "Failing row contains (fit_score=15).",
  "message": "new row violates check constraint \"watch_candidates_fit_score_check\""
}
```

**Solution:** Ensure fit_score is between 1-10 before sending.

#### 3. Authentication Error

```json
{
  "message": "Invalid API key"
}
```

**Solution:** Verify `SUPABASE_SERVICE_KEY` is correct and included in headers.

#### 4. Not Null Violation

```json
{
  "code": "23502",
  "details": "Failing row contains (channel_id=null).",
  "message": "null value in column \"channel_id\" violates not-null constraint"
}
```

**Solution:** Ensure all required fields are present in payload.

### n8n Error Handling Pattern

Add an **IF** node after the HTTP Request to check for errors:

```
Condition:
{{$json.error}} is not empty

True Branch: Log error or send alert
False Branch: Continue pipeline
```

---

## Testing Checklist

### Phase 1: Initial Setup
- [ ] Run `supabase_schema.sql` in Supabase SQL Editor
- [ ] Verify table exists: `SELECT * FROM watch_candidates LIMIT 1;`
- [ ] Verify indexes exist: `\d watch_candidates` or check SQL Editor
- [ ] Set environment variables in n8n

### Phase 2: Upsert Testing
- [ ] Insert 1 video (should create new row)
- [ ] Re-insert same video (should update, not duplicate)
- [ ] Verify row count: `SELECT COUNT(*) FROM watch_candidates;`
- [ ] Check updated_at timestamp changed on second insert

### Phase 3: Shortlist Testing
- [ ] Insert 10 videos with varying fit_scores
- [ ] Call shortlist endpoint, verify top 5 returned
- [ ] Mark 1 video as used
- [ ] Call shortlist again, verify it's gone
- [ ] Mark 1 video as discarded
- [ ] Call shortlist again, verify it's gone

### Phase 4: Deduplication Validation
- [ ] Run ingestion pipeline twice
- [ ] Verify total row count matches unique video_ids
- [ ] Check for duplicates: `SELECT video_id, COUNT(*) FROM watch_candidates GROUP BY video_id HAVING COUNT(*) > 1;`

### Phase 5: Full Workflow
- [ ] Run n8n ingestion (YouTube → LLM → Supabase)
- [ ] Verify all fields populated correctly
- [ ] Get shortlist via API
- [ ] Select top candidate
- [ ] Verify it disappears from shortlist
- [ ] Run ingestion again (different videos)
- [ ] Verify shortlist updates

---

## Supabase Query Builder Reference

### Filter Operators

```
Equals:           ?column=eq.value
Not equals:       ?column=neq.value
Greater than:     ?column=gt.value
Less than:        ?column=lt.value
Is null:          ?column=is.null
Is not null:      ?column=not.is.null
Like (case-sens): ?column=like.*pattern*
iLike (case-ins): ?column=ilike.*pattern*
In list:          ?column=in.(value1,value2)
```

### Ordering

```
Ascending:  ?order=column.asc
Descending: ?order=column.desc
Multiple:   ?order=column1.desc,column2.asc
```

### Limiting

```
Limit:  ?limit=10
Offset: ?offset=20
Range:  ?limit=10&offset=20
```

### Selecting Specific Columns

```
?select=id,video_id,title,fit_score
```

---

## Advanced: Bulk Upsert

For migrating Google Sheet data or batch processing:

### HTTP Request Node Config

```
Method: POST
URL: {{$env.SUPABASE_URL}}/rest/v1/watch_candidates?on_conflict=video_id

Headers:
  apikey: {{$env.SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{$env.SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
  Prefer: resolution=merge-duplicates

Body (JSON Array):
[
  { "video_id": "abc123", "title": "Video 1", ... },
  { "video_id": "def456", "title": "Video 2", ... },
  { "video_id": "ghi789", "title": "Video 3", ... }
]
```

**Note:** Supabase accepts array payloads for bulk operations.

---

## Resources

- [Supabase REST API Documentation](https://supabase.com/docs/guides/api)
- [PostgREST API Reference](https://postgrest.org/en/stable/api.html)
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)

---

## Troubleshooting

### Issue: "relation watch_candidates does not exist"
- Run `supabase_schema.sql` in Supabase SQL Editor
- Verify table creation: `\dt` in SQL editor

### Issue: Upsert creates duplicates instead of updating
- Verify `?on_conflict=video_id` is in URL
- Check constraint exists: `\d watch_candidates` → should show UNIQUE constraint

### Issue: 401 Unauthorized
- Verify API key is correct
- Check both `apikey` and `Authorization` headers are set
- Use service role key for write operations

### Issue: Shortlist returns previously selected videos
- Verify `used_in_issue_date` was set correctly (YYYY-MM-DD format)
- Check query filters: `?used_in_issue_date=is.null&discarded=eq.false`

### Issue: fit_score validation fails
- Ensure fit_score is an integer (not string)
- Verify value is between 1-10
- Check LLM output parsing in n8n

---

## Next Steps

1. Create Supabase project at https://supabase.com
2. Run `supabase_schema.sql` in SQL Editor
3. Copy project URL and service key to n8n credentials
4. Update your n8n workflow with HTTP Request nodes using configs above
5. Test upsert endpoint with sample video
6. Run full pipeline and verify data flow
7. Test shortlist query and selection workflow

---

**Need help?** Check the query_templates.sql file for raw SQL examples.
