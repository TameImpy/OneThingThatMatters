# Milestone 1: Backend Foundation - ✅ COMPLETE

## Overview
Milestone 1 has been successfully completed. The backend foundation for the One Thing That Matters newsletter system is now fully operational, providing all required API endpoints for watch candidate management.

## Completed Tasks

### 1.1 Supabase Integration ✅
- ✅ Installed Supabase client (`@supabase/supabase-js`)
- ✅ Configured service role key in server-side env vars
- ✅ Created Supabase helper module (`/lib/supabase.ts`)
- ✅ Added TypeScript types for watch_candidates (`/lib/types.ts`)
- ✅ Added helper: `getRowById(id)` and `getTodayDate()`

### 1.2 Shortlist Endpoint ✅
- ✅ Implemented `GET /api/watch/shortlist`
- ✅ Validates inputs and executes shortlist SQL
- ✅ Returns JSON payload with shortlist candidates
- ✅ Added comprehensive error handling
- ✅ Query logic:
  - `used_in_issue_date IS NULL` (not yet selected)
  - `discarded = false` (not manually rejected)
  - `created_at >= now() - 3 days` (recent items)
  - Ordered by `fit_score DESC`, `published_at DESC`
  - Limit 5 items

### 1.3 Select Endpoint ✅
- ✅ Implemented `POST /api/watch/select`
- ✅ Validates request body `{ id }`
- ✅ Sets `used_in_issue_date = today`
- ✅ Returns updated row
- ✅ Business logic validation:
  - Checks candidate exists
  - Prevents selecting already-used candidates
  - Prevents selecting discarded candidates
  - UUID format validation

### 1.4 Discard Endpoint ✅
- ✅ Implemented `POST /api/watch/discard`
- ✅ Validates request body `{ id }`
- ✅ Sets `discarded = true`
- ✅ Returns updated row
- ✅ Business logic validation:
  - Checks candidate exists
  - Prevents discarding already-discarded candidates
  - Prevents discarding candidates already used in issues

### 1.5 History Endpoint ✅
- ✅ Implemented `GET /api/watch/history`
- ✅ Returns items with `used_in_issue_date != null`
- ✅ Sorted by `used_in_issue_date DESC` (most recent first)

## File Structure

```
OneThingThatMatters/
├── app/
│   ├── api/
│   │   └── watch/
│   │       ├── shortlist/
│   │       │   └── route.ts          # GET shortlist endpoint
│   │       ├── select/
│   │       │   └── route.ts          # POST select endpoint
│   │       ├── discard/
│   │       │   └── route.ts          # POST discard endpoint
│   │       └── history/
│   │           └── route.ts          # GET history endpoint
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── lib/
│   ├── supabase.ts                   # Supabase client & helpers
│   └── types.ts                      # TypeScript type definitions
├── .env                              # Environment variables (configure!)
├── .env.example                      # Environment template
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
└── next.config.js                    # Next.js config
```

## API Documentation

### GET /api/watch/shortlist
Returns a shortlist of watch candidates for editorial review.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "video_id": "string",
      "channel_id": "string",
      "channel_name": "string",
      "title": "string",
      "url": "string",
      "summary": "string",
      "why_it_matters": "string",
      "fit_score": 8,
      "published_at": "2025-12-09T10:00:00Z",
      "thumbnail_url": "string",
      "used_in_issue_date": null,
      "discarded": false,
      "created_at": "2025-12-09T10:00:00Z",
      "updated_at": "2025-12-09T10:00:00Z"
    }
  ],
  "count": 5
}
```

### POST /api/watch/select
Marks a candidate as selected for today's newsletter.

**Request:**
```json
{
  "id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated candidate */ },
  "message": "Candidate selected for issue 2025-12-09"
}
```

### POST /api/watch/discard
Marks a candidate as discarded (editorial rejection).

**Request:**
```json
{
  "id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated candidate */ },
  "message": "Candidate discarded successfully"
}
```

### GET /api/watch/history
Returns previously selected candidates.

**Response:**
```json
{
  "success": true,
  "data": [ /* array of used candidates */ ],
  "count": 10
}
```

## Configuration

### Required Environment Variables
Before running the application, update `.env` with your Supabase credentials:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

Get these values from:
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy Project URL and service_role key

## Running the Application

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at http://localhost:3000

## Testing the API

### Test Shortlist
```bash
curl http://localhost:3000/api/watch/shortlist
```

### Test Select
```bash
curl -X POST http://localhost:3000/api/watch/select \
  -H "Content-Type: application/json" \
  -d '{"id": "your-candidate-uuid"}'
```

### Test Discard
```bash
curl -X POST http://localhost:3000/api/watch/discard \
  -H "Content-Type: application/json" \
  -d '{"id": "your-candidate-uuid"}'
```

### Test History
```bash
curl http://localhost:3000/api/watch/history
```

## Important Notes

### Schema Updated ✅
The `ingested_at` field has been added to the schema as specified in the PRD:
- ✅ Field added to `supabase_schema.sql`
- ✅ Migration script created at `migrations/add_ingested_at.sql`
- ✅ Shortlist endpoint updated to use `ingested_at` for recency queries
- ✅ Index created for optimal query performance

**For existing databases:** Run the migration script in `migrations/add_ingested_at.sql` to add the field to existing tables.

## Security

- ✅ Service role key stored server-side only (never exposed to frontend)
- ✅ All endpoints include comprehensive input validation
- ✅ UUID format validation
- ✅ Business logic validation (prevent invalid state transitions)
- ✅ Comprehensive error handling with detailed logging

## Design Decisions

1. **Clean separation of concerns**: Types, Supabase client, and API routes are clearly separated
2. **Type safety**: Full TypeScript typing for all request/response payloads
3. **Validation-first**: All endpoints validate inputs before database operations
4. **Informative errors**: Detailed error messages for debugging while maintaining security
5. **RESTful design**: Standard HTTP methods and status codes
6. **Idempotency considerations**: Select/discard endpoints check existing state before updating

## Next Steps: Milestone 2

The backend is ready to power the frontend UI. Next milestone tasks:

- 2.1 Frontend project setup (Tailwind CSS)
- 2.2 `/watch` page implementation
  - Fetch and display shortlist
  - Select/Discard buttons with optimistic updates
  - Loading and empty states
- 2.3 Selection confirmation UI

## Architecture Benefits

This implementation provides a solid foundation that:
- ✅ Can be extended to Listen and Read categories with identical patterns
- ✅ Supports frontend development without backend changes
- ✅ Maintains clean separation between data, business logic, and presentation
- ✅ Provides type safety end-to-end
- ✅ Includes robust error handling and validation
