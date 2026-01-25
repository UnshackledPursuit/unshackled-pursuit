# AGENTS.md - Claude Context for Fleeting Thoughts

> **Project:** Unshackled Pursuit / Fleeting Thoughts
> **Type:** Next.js 16 + Supabase + AI Processing
> **Last Updated:** 2026-01-25

---

## Quick Context

This is a personal thought capture and processing system. Ideas flow through a kanban pipeline: **Inbox → Processing → Routed → Done → Archived**.

## Key Files

| File | Purpose |
|------|---------|
| `src/app/fleeting/page.tsx` | Main UI - all components, state, modals |
| `src/lib/supabase.ts` | Types for Thought, Project, constants |
| `src/app/api/process/route.ts` | AI processing endpoint |
| `src/app/api/capture/route.ts` | External capture endpoint |
| `docs/PIPELINE_ANALYSIS.md` | Architecture & autonomous pipeline plans |
| `docs/FLEETING_FUTURE_FEATURES.md` | Feature roadmap |

## Data Model

### fleeting_thoughts
```typescript
{
  id: string
  content: string
  status: 'inbox' | 'processing' | 'routed' | 'done' | 'archived'
  priority: 'high' | 'medium' | 'low' | 'someday' | null
  project_id: string | null
  tags: string[] | null
  ai_analysis: string | null
  is_actionable: boolean | null
  suggested_destination: 'things' | 'reminders' | 'calendar' | 'notes' | 'reference' | 'archive' | null
}
```

### projects
```typescript
{
  id: string
  name: string
  description: string | null
  color: string
  app_path: string | null        // Path to app source code
  website_path: string | null    // Path to website code
  feedback_url: string | null    // External feedback form URL
  custom_instructions: string | null  // Context for Claude sessions
  sort_order: number
}
```

## UI Components (all in page.tsx)

- `ProjectModal` - Create/edit projects with advanced settings
- `RecycleModal` - Return done/archived items to inbox with notes
- `ArchitectureModal` - Quick reference (? button in header)
- `ThoughtCard` - Individual thought with long-press actions
- `DroppableColumn` - Kanban column with drag-drop
- `QuickActionsMenu` - Mobile action sheet

## Pipeline Flow

```
Capture → Inbox → [AI Process] → Processing → Routed → Done → Archived
                       ↓
            Sets: priority, project, destination, analysis
```

## Project Context Feature

Each project has `custom_instructions` field. When working on a project:
1. User clicks project in sidebar
2. Project settings bar appears with quick actions
3. "Instructions" button copies context to clipboard
4. Paste into Claude session for full project context

## External Integrations

- **WaypointHub Feedback** → Posts to `/api/capture` → Creates thought with source "waypoint_feedback"
- **iOS Shortcuts** → POST to `/api/capture` with token auth

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run watch-folder # Process iCloud folder (agents/)
npm run process-inbox # AI process pending thoughts
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY      # For API routes
CAPTURE_TOKEN             # For external capture auth
```

## Future Work

See `docs/PIPELINE_ANALYSIS.md` for autonomous pipeline plans:
- Mac polling for remote triggers
- Vercel cron for scheduled processing
- Agent handoff with project context

---

*This file provides context for Claude Code sessions working on this project.*
