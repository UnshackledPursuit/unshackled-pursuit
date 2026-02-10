# Fleeting Thoughts Pipeline - Agent Context

> **Project:** Unshackled Pursuit / Fleeting Thoughts
> **Type:** Next.js 16 + Supabase + AI Processing
> **Last Updated:** 2026-02-10
> **Canonical Location:** This repo is the single source of truth for all Fleeting Thoughts code and documentation.

---

## What This Is

A frictionless pipeline for capturing fleeting thoughts and routing them to execution. The goal: run `claude "process fleeting thoughts"` and have it work with full context.

**Key Principle:** Use Claude CLI (subscription) or local models - NO API costs.

---

## Architecture Overview

```
Capture (Website/API) → Store (Supabase) → Triage (Claude CLI or Local)
    → Process → Route to Construct/Ideas/ → Generate SPEC.md
```

| Layer | Implementation | Status |
|-------|----------------|--------|
| **Intake** | Website Kanban at unshackledpursuit.com/fleeting | Working |
| **Storage** | Supabase (fleeting_thoughts, projects tables) | Working |
| **Folder Watch** | `agents/folder-watcher.ts` - iCloud → Supabase | Working (not scheduled) |
| **Triage** | `agents/process-inbox.ts` - keyword categorization | Working |
| **AI Processing** | Claude CLI (this conversation) | Working |
| **Output** | Creates folders + SPEC.md in `Construct/Ideas/` | Working |

---

## Key Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | **This file** - start here for context |
| `src/app/fleeting/page.tsx` | Main UI - all components, state, modals |
| `src/lib/supabase.ts` | Types for Thought, Project, constants |
| `src/app/api/process/route.ts` | AI processing endpoint |
| `src/app/api/capture/route.ts` | External capture endpoint |
| `agents/folder-watcher.ts` | Ingests .md files from iCloud → Supabase |
| `agents/process-inbox.ts` | Keyword-based categorization |
| `agents/process-thoughts.ts` | AI analysis (needs API key, prefer CLI) |
| `agents/fleeting-skill-copy.md` | Backup of /fleeting skill (keep in sync with `~/.claude/skills/fleeting/SKILL.md`) |
| `docs/PIPELINE_LEDGER.md` | Routing decision log — tracks all pipeline actions for study/learning |
| `docs/PIPELINE_ANALYSIS.md` | Gap analysis |
| `docs/FLEETING_FUTURE_FEATURES.md` | Feature roadmap |

---

## Agent Scripts

**Location:** `agents/`

| Script | Lines | Purpose | LLM |
|--------|-------|---------|-----|
| `folder-watcher.ts` | 240 | Ingests .md files from iCloud → Supabase | No |
| `process-inbox.ts` | 274 | Keyword-based categorization | No |
| `process-thoughts.ts` | 481 | AI analysis + SPEC.md generation | API (prefer CLI) |
| `fleeting-skill-copy.md` | — | Backup of /fleeting skill | - |
| `AGENTS.md` | 104 | Processing instructions for agents | - |
| `process-inbox.md` | 64 | Prompt file for Claude CLI | - |

---

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
  routed_to: string | null  // Path to generated SPEC.md
  processed_at: string | null
}
```

### projects
```typescript
{
  id: string
  name: string
  description: string | null
  color: string
  app_path: string | null
  website_path: string | null
  feedback_url: string | null
  custom_instructions: string | null
  sort_order: number
}
```

---

## Quick Commands

```bash
# Process thoughts with Claude CLI (recommended - no API cost)
claude "Fetch thoughts in processing status from Supabase, analyze each, create SPEC.md files in Construct/Ideas/"

# Run folder watcher (ingest .md from iCloud)
npx ts-node --project agents/tsconfig.json agents/folder-watcher.ts

# Development
npm run dev          # Start dev server
npm run build        # Build for production
```

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ygcgzwlzyrvwshtlxpsc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard>
SUPABASE_SERVICE_KEY=<service_role key from Supabase>
CAPTURE_TOKEN=<for /api/capture endpoint>
# ANTHROPIC_API_KEY not needed - use Claude CLI instead!
```

---

## Pipeline Flow

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│    Capture      │ ──▶ │   Supabase   │ ──▶ │ process-inbox.ts │
│ (Website/iCloud)│     │   (Store)    │     │   (Categorize)   │
└─────────────────┘     └──────────────┘     └────────┬─────────┘
                                                      │
                                                      ▼ status='processing'
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Construct/     │ ◀── │  Claude CLI  │ ◀── │   Claude CLI     │
│  Ideas/SPEC.md  │     │  (Analyze)   │     │   (or Local LLM) │
└─────────────────┘     └──────────────┘     └──────────────────┘
```

---

## UI Components (in page.tsx)

- `ProjectModal` - Create/edit projects with advanced settings
- `RecycleModal` - Return done/archived items to inbox
- `ArchitectureModal` - Quick reference (? button)
- `ThoughtCard` - Individual thought with long-press actions
- `DroppableColumn` - Kanban column with drag-drop
- `QuickActionsMenu` - Mobile action sheet

---

## Infrastructure

| Device | Role | Connection |
|--------|------|------------|
| **MacBook** | Heavy compute, Claude CLI | Primary |
| **Pi 5** | Always-on coordinator, Ollama (future) | Via Tailscale |
| **iPhone** | Capture via website | Browser |

---

## File Locations (Updated 2026-02-04)

All Fleeting Thoughts code and documentation is now consolidated in this repo:

```
unshackled-pursuit/           ← THIS REPO (canonical location)
├── AGENTS.md                 ← This file (hub context)
├── agents/                   ← Processing scripts
├── docs/
│   ├── PIPELINE_LEDGER.md              ← Routing decision log (new)
│   ├── PIPELINE_ANALYSIS.md
│   └── FLEETING_FUTURE_FEATURES.md
├── src/                      ← Website code
└── .env.local               ← Keys (gitignored)

External (not in this repo):
├── ~/...Apps/Construct/Ideas/   ← Generated SPEC.md files go here
├── ~/...Apps/FleetingThoughts/  ← Hub (CLAUDE.md + AGENTS.md + _processed/)
└── ~/.claude/skills/fleeting/SKILL.md  ← Live /fleeting skill
```

---

## External Integrations

- **WaypointHub Feedback** → POST to `/api/capture` → Creates thought with source "waypoint_feedback"
- **iOS Shortcuts** → POST to `/api/capture` with Bearer token auth

---

*This file provides central context for Claude Code sessions working on the Fleeting Thoughts pipeline.*
