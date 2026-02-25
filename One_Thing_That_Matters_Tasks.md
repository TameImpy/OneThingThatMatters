
# tasks.md
## One Thing That Matters – Supabase Backend Implementation Tasks

This file outlines all engineering tasks required to implement the Supabase backend for the “One Thing That Matters” agentic newsletter project. These tasks are designed for execution by an autonomous coding agent and map directly to the Product Requirements Document (PRD).

---

# 1. Supabase Project Setup

### Task 1.1 – Create Supabase Project
- Initialise a new Supabase project.
- Retrieve:
  - Project URL  
  - anon key  
  - service role key  

### Task 1.2 – Store Environment Variables
Set the following environment variables for use by n8n and backend code:

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
```

---

# 2. Database Schema Creation

### Task 2.1 – Create `watch_candidates` Table
Run:

```sql
create table watch_candidates (
  id uuid primary key default gen_random_uuid(),
  video_id text not null,
  channel_id text,
  channel_name text,
  title text,
  summary text,
  why_it_matters text,
  fit_score integer check (fit_score >= 1 and fit_score <= 10),
  fit_rationale text,
  published_at timestamptz,
  thumbnail_url text,
  view_count integer,
  like_count integer,
  duration_seconds numeric,
  url text,
  used_in_issue_date date,
  discarded boolean default false,
  constraint unique_video unique(video_id)
);
```

### Task 2.2 – Add Index for Ranking Queries

```sql
create index watch_candidates_fit_score_idx 
on watch_candidates (fit_score desc, published_at desc);
```

---

# 3. REST API Configuration

Supabase auto-generates REST endpoints.

### Task 3.1 – Configure Upsert Behavior
- Enable `on_conflict=video_id` for POST routes.
- Ensure Supabase updates fields except:
  - used_in_issue_date  
  - discarded  

### Task 3.2 – Define Shortlist Query

The frontend/agent will call:

```
GET /rest/v1/watch_candidates?
used_in_issue_date=is.null&discarded=is.false&
order=fit_score.desc&limit=5
```

### Task 3.3 – Define Selection Endpoint

```
PATCH /rest/v1/watch_candidates?id=eq.{id}
{ "used_in_issue_date": "<today>" }
```

### Task 3.4 – Define Discard Endpoint

```
PATCH /rest/v1/watch_candidates?id=eq.{id}
{ "discarded": true }
```

---

# 4. n8n Integration Tasks

### Task 4.1 – Add Supabase Upsert Node (HTTP)
Configure:

```
POST {{SUPABASE_URL}}/rest/v1/watch_candidates?on_conflict=video_id
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
```

Map all enriched LLM outputs and metadata.

### Task 4.2 – Validate Deduplication
- Run the ingestion twice for the same set of videos.
- Confirm row count remains constant.
- Confirm updated fields refresh correctly.

---

# 5. Migration of Existing Google Sheet Data

### Task 5.1 – Export Current Sheet Rows
- Extract all rows from the existing Sheet containing:
  - metadata  
  - summary  
  - why-it-matters  
  - fit_score & rationale  

### Task 5.2 – Use n8n Bulk Insert Flow
- Create a Batch Workflow to POST each row into Supabase via upsert.

### Task 5.3 – Validate Migration
- Ensure identical video_id rows did not duplicate.
- Confirm final row count matches unique YouTube videos.

---

# 6. Backend Selection Logic

### Task 6.1 – Implement "Mark as Selected"
- Agent or UI calls PATCH selection endpoint.
- Set `used_in_issue_date = current_date`.

### Task 6.2 – Prevent Re-selection
Shortlist query must never show:
- previously selected videos  
- discarded videos  

---

# 7. Security Configuration

### Task 7.1 – Disable RLS for Phase 1
- Allow all authenticated requests (service role key).
- Read-only anon usage only for frontend retrieval.

### Task 7.2 – Future Hardening (Phase 2)
(not required now)
- Add restrictive RLS policies.
- Enforce read-only for anon clients.

---

# 8. Final Testing Workflow

### Task 8.1 – Full Pipeline Test
1. Run n8n ingestion.  
2. Verify Supabase table updates.  
3. Call shortlist endpoint.  
4. Select a candidate.  
5. Confirm it disappears from shortlist.  

### Task 8.2 – Regression Test for Duplicates
- Re-run ingestion twice.
- Ensure no duplication of video_id.

---

# 9. Deliverables

- Supabase schema live
- REST endpoints functional
- n8n upsert working
- Clean shortlist API
- Selected candidate workflow
- Discard workflow
- Migration completed

---

# 10. Success Criteria

- Zero duplicate videos
- Shortlist always returns 5 top-ranked unused candidates
- Selected videos never reappear
- Schema extensible to Listen, Read, and other categories
- Stable, predictable API for future UI and agents

---

