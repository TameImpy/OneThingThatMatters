# One Thing That Matters - Project Status

**Last Updated:** 2025-12-09
**Current Milestone:** Milestone 1 - COMPLETE ✅

---

## Executive Summary

Milestone 1 (Backend Foundation) has been successfully completed. The system now has a fully functional backend with four REST API endpoints for managing watch candidates, complete with TypeScript typing, comprehensive validation, and error handling.

**Build Status:** ✅ Passing
**Test Coverage:** Manual testing ready
**Database Schema:** ✅ Complete (with ingested_at field added)

---

## Milestone Progress

### ✅ Milestone 1: Backend Foundation (COMPLETE)

#### Deliverables:
1. ✅ Next.js project with TypeScript and App Router
2. ✅ Supabase client integration (server-side with service role key)
3. ✅ Complete TypeScript type definitions for watch_candidates
4. ✅ Four production-ready API endpoints:
   - GET /api/watch/shortlist
   - POST /api/watch/select
   - POST /api/watch/discard
   - GET /api/watch/history

#### Key Features Implemented:
- Full request/response validation
- Business logic enforcement (prevent invalid state transitions)
- Comprehensive error handling
- Type-safe API responses
- Clean architectural separation (types, clients, routes)
- Schema updated with ingested_at field (as per PRD requirements)

---

## File Structure

```
OneThingThatMatters/
├── app/
│   ├── api/
│   │   └── watch/
│   │       ├── shortlist/route.ts    ✅ GET shortlist endpoint
│   │       ├── select/route.ts       ✅ POST select endpoint
│   │       ├── discard/route.ts      ✅ POST discard endpoint
│   │       └── history/route.ts      ✅ GET history endpoint
│   ├── layout.tsx                    ✅ Root layout
│   └── page.tsx                      ✅ Home page
│
├── lib/
│   ├── supabase.ts                   ✅ Supabase client & helpers
│   └── types.ts                      ✅ TypeScript types
│
├── migrations/
│   └── add_ingested_at.sql           ✅ Schema migration
│
├── .env                              ⚠️  Needs configuration
├── .env.example                      ✅ Template provided
├── package.json                      ✅ Dependencies defined
├── tsconfig.json                     ✅ TypeScript configured
├── next.config.js                    ✅ Next.js configured
├── supabase_schema.sql               ✅ Updated with ingested_at
├── FULL_PROJECT_PRD.md              ✅ Product requirements
├── FULL_PROJECT_TASKS.md            ✅ Task breakdown
├── MILESTONE_1_COMPLETE.md          ✅ Milestone documentation
└── PROJECT_STATUS.md                ✅ This file
```

---

## Technical Stack

| Component | Technology | Status |
|-----------|-----------|---------|
| Framework | Next.js 15 (App Router) | ✅ |
| Language | TypeScript 5 | ✅ |
| Database | Supabase (PostgreSQL) | ✅ |
| Client Library | @supabase/supabase-js | ✅ |
| Runtime | Node.js 20+ | ✅ |

---

## Configuration Status

### Required Before Running

⚠️ **Action Required:** Update `.env` with your Supabase credentials

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

**Where to get credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to Settings → API
4. Copy Project URL and service_role key

### Database Schema

⚠️ **Action Required:** Run the migration to add `ingested_at` field

If you have an existing database without the `ingested_at` field:

```bash
# Connect to your Supabase SQL editor and run:
cat migrations/add_ingested_at.sql | supabase db execute
```

Or manually execute the migration in the Supabase dashboard SQL editor.

---

## Quick Start

```bash
# 1. Install dependencies
cd /Users/matthewrance/Documents/OneThingThatMatters
npm install

# 2. Configure environment variables
# Edit .env and add your Supabase credentials

# 3. Run database migration (if needed)
# Execute migrations/add_ingested_at.sql in Supabase SQL editor

# 4. Start development server
npm run dev

# 5. Access application
# Open http://localhost:3000
```

---

## API Endpoints Documentation

### 1. GET /api/watch/shortlist
Returns a shortlist of eligible watch candidates.

**Logic:**
- Returns items not yet used (`used_in_issue_date IS NULL`)
- Excludes discarded items (`discarded = false`)
- Shows only recent items (ingested within last 3 days)
- Sorted by fit_score DESC, then published_at DESC
- Limited to 5 items

**Example Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### 2. POST /api/watch/select
Marks a candidate as selected for today's newsletter.

**Request:**
```json
{ "id": "uuid" }
```

**Validation:**
- Candidate must exist
- Cannot select already-used candidates
- Cannot select discarded candidates

**Effect:** Sets `used_in_issue_date` to today's date

### 3. POST /api/watch/discard
Marks a candidate as discarded (editorial rejection).

**Request:**
```json
{ "id": "uuid" }
```

**Validation:**
- Candidate must exist
- Cannot discard already-discarded candidates
- Cannot discard candidates already used in issues

**Effect:** Sets `discarded` to `true`

### 4. GET /api/watch/history
Returns candidates previously selected for newsletters.

**Logic:**
- Returns items with `used_in_issue_date IS NOT NULL`
- Sorted by `used_in_issue_date DESC` (most recent first)

---

## Testing Checklist

### Manual Testing
- [ ] Configure `.env` with valid Supabase credentials
- [ ] Run `npm run dev`
- [ ] Test GET /api/watch/shortlist (should return recent candidates)
- [ ] Test POST /api/watch/select (select a candidate)
- [ ] Test GET /api/watch/history (verify selected item appears)
- [ ] Test POST /api/watch/discard (discard a candidate)
- [ ] Verify discarded items don't appear in shortlist

### cURL Test Commands
```bash
# Shortlist
curl http://localhost:3000/api/watch/shortlist

# Select (replace with actual UUID)
curl -X POST http://localhost:3000/api/watch/select \
  -H "Content-Type: application/json" \
  -d '{"id": "your-uuid-here"}'

# Discard
curl -X POST http://localhost:3000/api/watch/discard \
  -H "Content-Type: application/json" \
  -d '{"id": "your-uuid-here"}'

# History
curl http://localhost:3000/api/watch/history
```

---

## Key Architectural Decisions

### 1. Server-Side Service Role Key
- Service role key stored in server env vars only
- Never exposed to frontend/client
- All database operations through API routes

### 2. Type Safety
- Full TypeScript types for all database models
- Typed request/response interfaces
- Compile-time error prevention

### 3. Validation-First Design
- All endpoints validate inputs before database operations
- UUID format validation
- Business logic validation (state transitions)
- Informative error messages

### 4. Clean Separation of Concerns
```
Types (lib/types.ts)
  ↓
Supabase Client (lib/supabase.ts)
  ↓
API Routes (app/api/watch/*/route.ts)
  ↓
Frontend (future Milestone 2)
```

### 5. ingested_at Timestamp
- **Critical field** for shortlist recency logic
- Immutable (set once on insert, never updated)
- Differentiates from `created_at` (row creation) and `updated_at` (any update)
- Schema updated to include this field
- Migration provided for existing databases

---

## Known Issues & Notes

### 1. Schema Migration Required
If you have an existing `watch_candidates` table without `ingested_at`, you must run the migration:
```bash
migrations/add_ingested_at.sql
```

### 2. Workspace Root Warning
Next.js shows a warning about multiple lockfiles. This is cosmetic and doesn't affect functionality. To silence:
```js
// next.config.js
module.exports = {
  outputFileTracingRoot: '/Users/matthewrance/Documents/OneThingThatMatters'
}
```

---

## Next Steps: Milestone 2

**Goal:** Build the frontend Watch Shortlist UI

### Planned Tasks:
1. Set up Tailwind CSS styling
2. Create `/watch` page with:
   - Candidate list display (thumbnails, titles, summaries)
   - Select/Discard action buttons
   - Loading and empty states
   - Optimistic UI updates
3. Add selection confirmation modal/toast
4. Auto-refresh shortlist after actions

### Dependencies:
✅ Backend API ready
✅ TypeScript types defined
⚠️ Tailwind CSS needs installation
⚠️ Frontend Supabase client configuration needed (anon key)

---

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Explicit return types for all functions
- Error handling in all async operations
- Descriptive variable names
- Comments for complex logic

### Security
- Never expose SUPABASE_SERVICE_KEY to frontend
- Validate all user inputs
- Use prepared statements (Supabase client handles this)
- Log errors server-side, return generic messages to client

### Performance
- Database queries optimized with indexes
- Shortlist limited to 5 items
- No N+1 queries
- Future: Consider adding response caching

---

## Resources

- **PRD:** `FULL_PROJECT_PRD.md` - Complete system specification
- **Tasks:** `FULL_PROJECT_TASKS.md` - All milestone tasks
- **Milestone 1 Details:** `MILESTONE_1_COMPLETE.md` - Implementation details
- **Schema:** `supabase_schema.sql` - Database structure
- **Migration:** `migrations/add_ingested_at.sql` - Schema update
- **Environment Template:** `.env.example` - Configuration guide

---

## Support & Troubleshooting

### Build Fails
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Type Errors
```bash
# Regenerate TypeScript declarations
npx tsc --noEmit
```

### Supabase Connection Issues
1. Verify credentials in `.env`
2. Check network connectivity
3. Verify service role key has database access
4. Check Supabase project status

### API Errors
- Check server console for detailed error logs
- Verify database schema matches types
- Test database connection independently
- Check Supabase project logs

---

## Version History

| Version | Date | Milestone | Notes |
|---------|------|-----------|-------|
| 0.1.0 | 2025-12-09 | M1 Complete | Backend foundation, 4 API endpoints, schema with ingested_at |

---

**Ready for Milestone 2!** 🚀
