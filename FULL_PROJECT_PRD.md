# PROJECT_PRD.md
## One Thing That Matters – Full System Product Requirements Document (PRD)
Version 1.0 (2025)

## 1. Purpose and Vision
The One Thing That Matters (OTTM) system is an agent-assisted daily newsletter workflow designed to surface one high-quality item to Watch, Listen To, and Read each day. The goal is to reduce editorial workload while maintaining high standards of relevance, clarity, and insight.

The system:
- Automates content ingestion across categories.
- Enriches items with LLM summaries, contextual insights, and fit scoring.
- Stores and ranks candidates in Supabase.
- Surfaces shortlists through a UI.
- Allows the user to select one item per category.
- Generates a newsletter draft automatically.

This PRD covers the end-to-end architecture for the Watch category and defines the foundation for future Listen and Read categories.

## 2. System Overview
### A. Ingestion Layer (n8n + LLM)
- Fetches YouTube videos from curated channels.
- Summarises videos.
- Generates “why it matters”.
- Assigns a fit_score (1–10).
- UPSERTS items into Supabase.

### B. Supabase Backend
- Stores all candidate items.
- Ensures deduplication via video_id.
- Tracks first discovery (`ingested_at`), updates, selections, and discards.
- Provides shortlist, selection, discard, and history queries.

### C. Backend Service (Next.js API or Supabase Edge)
Exposes:
- shortlist endpoint
- select endpoint
- discard endpoint
- issue-builder support endpoint

### D. Frontend UI (Next.js)
- Displays shortlists.
- Supports selection or discard actions.
- Provides a newsletter builder.
- Shows history of past issues.

### E. Agent Layer (Later)
- Auto-generates newsletter drafts.
- Provides daily recommendations.

## 3. Data Model
### Table: watch_candidates

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| id | uuid | yes | PK |
| video_id | text | yes | Unique YouTube ID |
| channel_id | text | yes | YouTube channel ID |
| channel_name | text | yes | Channel title |
| title | text | yes | Video title |
| url | text | yes | Full YouTube URL |
| summary | text | yes | LLM summary |
| why_it_matters | text | yes | LLM explanation |
| fit_score | int | yes | 1–10 |
| fit_rationale | text | optional | Optional LLM rationale |
| published_at | timestamptz | yes | YouTube publish time |
| thumbnail_url | text | optional | Thumbnail URL |
| view_count | int | optional |  |
| like_count | int | optional |  |
| duration_seconds | numeric | optional |  |
| used_in_issue_date | date | default null | Newsletter selection |
| discarded | boolean | default false | Editorial reject |
| created_at | timestamptz | yes | Row creation time |
| updated_at | timestamptz | yes | Auto-updated on any change |
| ingested_at | timestamptz | yes | First discovery, immutable |

## 4. Timestamps Explained
### created_at
When Supabase inserted the row (not necessarily editorial discovery time).

### updated_at
Updates whenever **any** field changes: scoring refresh, metadata update, enrichment, etc.

### ingested_at
Critical. The first time the pipeline **discovered** this item.  
Used for shortlist and recency logic.  
Does not change on update.

### used_in_issue_date
Date the item was selected for a newsletter.

## 5. Backend Requirements
### 5.1 Shortlist Query
```
SELECT *
FROM watch_candidates
WHERE used_in_issue_date IS NULL
  AND discarded = false
  AND ingested_at >= now() - interval '3 days'
ORDER BY fit_score DESC, published_at DESC
LIMIT 5;
```

### 5.2 Endpoints
#### GET /api/watch/shortlist
Returns shortlist.

#### POST /api/watch/select
Body: { id }  
Effect: sets used_in_issue_date = today.

#### POST /api/watch/discard
Body: { id }  
Effect: sets discarded = true.

#### GET /api/watch/history
Returns previously selected items.

## 6. Frontend Requirements
### /watch
Displays shortlist with:
- thumbnail
- title
- channel name
- summary
- why_it_matters
- fit_score
- select/discard buttons

### /issue-builder
- Shows today's selected items.
- Generates Markdown newsletter draft.
- Renders editor with preview.

### /history
- Displays past issues sorted by date.

## 7. Non-Functional Requirements
- Fast queries (target <150ms).
- No duplicate candidates.
- Shortlist resilient to reprocessing.
- Minimalistic UI with high information clarity.
- Secure: service key server-side only; anon key client-side only.
- Architecture must support Listen and Read categories with identical flows.

## 8. Roadmap
### Phase 1 — Watch MVP
- Backend shortlist + selection + discard.
- Watch shortlist UI.
- Newsletter builder.

### Phase 2 — Listen + Read
- Mirror ingestion, enrichment, and UI.

### Phase 3 — Agent Automation
- Auto-generate newsletter draft daily.

### Phase 4 — Intelligence Layer
- Fit-score improvement via embeddings.
- Relevance ranking.

