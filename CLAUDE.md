# Unshackled Pursuit

> Next.js website + Fleeting Thoughts web UI + pipeline processing scripts.

## What's Here

This repo serves dual purposes:
1. **Website** - unshackledpursuit.com (deployed via Vercel)
2. **Fleeting Thoughts UI** - Kanban board at `/fleeting` for capturing and managing thoughts
3. **Pipeline scripts** - `agents/` folder has processing scripts (not automated yet)

## Tech Stack

- Next.js 16, React 19, TypeScript
- Supabase (auth + database)
- Tailwind CSS
- dnd-kit (drag and drop)

## Fleeting Thoughts Pipeline

The pipeline code lives in `agents/`:
- `process-thoughts.ts` - AI analysis + SPEC generation (uses paid API)
- `process-inbox.ts` - Keyword-based triage (free)
- `folder-watcher.ts` - iCloud .md file ingestion

**None of these run automatically.** They require manual execution.

For full pipeline context, Supabase access commands, and project IDs, read:
`~/Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/FleetingThoughts/AGENTS.md`

Or run the `/fleeting` skill from any directory.

## Supabase

Env vars in `.env.local`. Service key as `apikey` header bypasses RLS.

## Key Pages

- `src/app/page.tsx` - Landing page
- `src/app/fleeting/page.tsx` - Fleeting Thoughts Kanban (main feature)
- `src/app/api/capture/route.ts` - API endpoint for external thought capture
