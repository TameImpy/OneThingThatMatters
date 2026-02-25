# tasks.md – One Thing That Matters (Agentic Development Plan)
Version 1.0 (2025)

# MILESTONE 1 — Backend Foundation
Goal: Provide a working backend to power the UI.

## 1.1 Supabase Integration
- [ ] Install Supabase client into backend.
- [ ] Configure service role key in server-side env vars.
- [ ] Configure anon key for frontend reads.
- [ ] Create Supabase helper module.
- [ ] Add TypeScript types for watch_candidates.
- [ ] Add helper: getRowById(id).

## 1.2 Shortlist Endpoint
- [ ] Implement GET /api/watch/shortlist.
- [ ] Validate inputs.
- [ ] Execute shortlist SQL.
- [ ] Return JSON payload.
- [ ] Add error handling.

## 1.3 Select Endpoint
- [ ] Implement POST /api/watch/select.
- [ ] Validate body { id }.
- [ ] Set used_in_issue_date = today.
- [ ] Return updated row.

## 1.4 Discard Endpoint
- [ ] Implement POST /api/watch/discard.
- [ ] Validate body { id }.
- [ ] Set discarded = true.
- [ ] Return updated row.

## 1.5 History Endpoint
- [ ] Implement GET /api/watch/history.
- [ ] Return items with used_in_issue_date != null.
- [ ] Sort by date desc.

# MILESTONE 2 — Frontend: Watch Shortlist UI
## 2.1 Project Setup
- [ ] Create Next.js project.
- [ ] Install Tailwind.
- [ ] Set up base layout.
- [ ] Configure Supabase client for frontend.

## 2.2 /watch Page
- [ ] Fetch shortlist.
- [ ] Render candidate list.
- [ ] Add Select button.
- [ ] Add Discard button.
- [ ] Add loading & empty states.
- [ ] Add optimistic updates.

## 2.3 Selection Confirmation
- [ ] Add modal/toast confirmation.
- [ ] Refresh shortlist after selection.
- [ ] Prevent duplicate selections.

# MILESTONE 3 — Newsletter Draft Builder
## 3.1 Retrieve Selections
- [ ] Implement GET /api/issue/today.
- [ ] Return today’s selected watch item.

## 3.2 Markdown Template Engine
- [ ] Build newsletter Markdown template.
- [ ] Merge selected data into template.
- [ ] Return rendered Markdown.

## 3.3 /issue-builder Page
- [ ] Create page layout.
- [ ] Render Markdown draft.
- [ ] Add editable text area.
- [ ] Add preview panel.
- [ ] Copy-to-clipboard button.

# MILESTONE 4 — History
## /history Page
- [ ] Fetch issue history.
- [ ] Render previous selections.
- [ ] Add pagination.

# MILESTONE 5 — Listen & Read Pipelines (Future)
## LISTEN
- [ ] Create listen_candidates table.
- [ ] Build RSS ingestion.
- [ ] Add enrichment.
- [ ] Add shortlist/select/discard endpoints.
- [ ] Add UI.

## READ
- [ ] Create read_candidates table.
- [ ] RSS/article ingestion.
- [ ] Enrichment.
- [ ] Shortlist/select/discard.
- [ ] Add UI.

# MILESTONE 6 — Advanced Features
## Embeddings
- [ ] Add vector search.
- [ ] Improve fit_score ranking.

## Agent Automation
- [ ] Auto-generate daily newsletter draft.
- [ ] Slack/email preview system.

# MILESTONE 7 — Production Hardening
- [ ] Logging middleware.
- [ ] Error monitoring.
- [ ] Rate limiting.
- [ ] Unit tests.
- [ ] Integration tests.

