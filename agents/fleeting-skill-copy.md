# Fleeting Skill — Reference Copy

> **THIS IS A BACKUP COPY.** The live skill is at `~/.claude/skills/fleeting/SKILL.md`.
> When either copy is updated, the other should be synced to match.
> Last synced: 2026-02-10

---
name: fleeting
description: Review and process the fleeting thoughts pipeline. Use when asked about fleeting thoughts, the capture pipeline, or autonomous infrastructure.
allowed-tools: Read, Glob, Grep, Bash
---

# Fleeting Thoughts Pipeline

## Quick Start

1. Read the hub context file for architecture and current state:
   `~/Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/FleetingThoughts/AGENTS.md`

2. **Scan the FleetingThoughts folder for unprocessed files** (see File Scanning below)

3. Query Supabase for live data (see commands below)

4. Act on the request (review, process, status, organize, next)

5. **Log all actions to the pipeline ledger** (see Ledger below)

---

## File Scanning (CRITICAL — Do This Every Session)

Before querying Supabase, scan the FleetingThoughts folder for files that aren't tracked yet.

**Folder:** `~/Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/FleetingThoughts/`

**What to scan for:** Any PDF, .md, or other document files in the top-level folder that are NOT:
- `CLAUDE.md`, `AGENTS.md` (hub docs — always stay)
- Files already in `_processed/` subfolder

**What to do with unprocessed files:**
1. Read each file to understand its contents
2. Report them to the user as "unprocessed files found in FleetingThoughts folder"
3. For each file, suggest: project assignment, priority, tags
4. If approved, create a Supabase entry (POST) with:
   - `content`: Text summary of the document
   - `content_type`: pdf, text, etc.
   - `source`: "manual"
   - `routed_to`: Original file path (e.g., `FleetingThoughts/filename.pdf`)
   - `ai_analysis`: Detailed breakdown of contents
5. Move the file to `_processed/` (see File Processing below)

This ensures nothing dropped into the FleetingThoughts folder gets lost or forgotten.

---

## File Processing (_processed/ Workflow)

When a thought reaches **processing** or **routed** status and has an associated source file:

1. **Move the source file** from `FleetingThoughts/` to `FleetingThoughts/_processed/`
2. **Convert PDF to Markdown** if the file is a PDF:
   - Use Claude's PDF reading capability to extract content
   - Write an .md version in `_processed/` with the same base name
   - Keep the original PDF in `_processed/` as backup until the .md is confirmed good
3. **Update the Supabase entry** `routed_to` field to reflect the new path in `_processed/`

This keeps the main FleetingThoughts folder clean — only new/unprocessed files sit at the top level.

---

## Pipeline Ledger (CRITICAL — Log Every Action)

**Location:** `~/Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/Websites/DKRHUB/unshackled-pursuit/docs/PIPELINE_LEDGER.md`

Every processing action MUST be logged to the ledger. This serves two purposes:
1. **Archive/tracking** — what moved where, when, and why
2. **Learning** — study agent routing accuracy and identify process tweaks

**What to log (append a new entry for each action):**

```markdown
| Date | Thought ID | Summary | Action | Project | Reasoning | Outcome |
```

- **Date**: ISO date of the action
- **Thought ID**: First 8 chars of the UUID
- **Summary**: Brief description of the thought
- **Action**: What was done (created, categorized, routed, graduated, archived, deleted, merged, split)
- **Project**: Which project it was assigned to (or "none")
- **Reasoning**: Why this routing decision was made
- **Outcome**: Where it ended up (checklist path, archive, reference, etc.)

**Always log:** status changes, project assignments, file moves, merges, splits, deletions, graduations to checklists.

The ledger is version-controlled in the Unshackled Pursuit repo and should be committed after each processing session.

---

## Supabase Access (CRITICAL)

**Instance:** `https://ygcgzwlzyrvwshtlxpsc.supabase.co`

**Auth:** RLS is enabled. The anon key returns empty results because there's no user session.
You MUST use the service key as the `apikey` header to bypass RLS.

```bash
# Load credentials from .env.local (NEVER hardcode keys)
ENV_FILE=~/Library/Mobile\ Documents/com~apple~CloudDocs/Assets/Learning/Apps/Websites/DKRHUB/unshackled-pursuit/.env.local
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL "$ENV_FILE" | cut -d'=' -f2)
SERVICE_KEY=$(grep SUPABASE_SERVICE_KEY "$ENV_FILE" | cut -d'=' -f2)
```

### Read All Thoughts
```bash
curl -s "${SUPABASE_URL}/rest/v1/fleeting_thoughts?select=*&order=captured_at.desc" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Range: 0-99"
```

### Read All Projects
```bash
curl -s "${SUPABASE_URL}/rest/v1/projects?select=*" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Range: 0-99"
```

### Filter by Status
```bash
# Get inbox items only
curl -s "${SUPABASE_URL}/rest/v1/fleeting_thoughts?select=*&status=eq.inbox" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```

### Update a Thought (PATCH)
```bash
curl -s -X PATCH "${SUPABASE_URL}/rest/v1/fleeting_thoughts?id=eq.<THOUGHT_ID>" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"status": "done", "priority": "high", "project_id": "<PROJECT_ID>"}'
```

### Insert a New Thought (POST)
```bash
curl -s -X POST "${SUPABASE_URL}/rest/v1/fleeting_thoughts" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"content": "...", "content_type": "text", "source": "agent", "status": "inbox", "user_id": "18a92969-5664-4d63-95fc-d8481e6c42e2"}'
```

### Delete a Thought (DELETE)
```bash
curl -s -X DELETE "${SUPABASE_URL}/rest/v1/fleeting_thoughts?id=eq.<THOUGHT_ID>" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```

---

## Project IDs (for assigning thoughts)

| Project | ID | Color |
|---------|-----|-------|
| WaypointHub | `3e4b5a48-07a7-4a77-8c54-504560208397` | green |
| Spatialis | `be4e8911-df8c-49b0-bcb1-4af7db185eca` | cyan |
| Construct Ideas | `291bc648-719d-41d6-bcfc-4334076cb22d` | amber |
| Fleeting Thoughts | `af3cc925-78dd-4ee1-863d-35735619c423` | purple |
| Unshackled Pursuit | `07cb1d12-0a06-44fd-bc94-a034dd89fca8` | blue |
| Network | `85a0105c-6394-45e9-ac86-272a4dde197d` | slate |

**User ID (owner):** `18a92969-5664-4d63-95fc-d8481e6c42e2`

---

## Pipeline Flow

```
Capture (Web UI, Mobile, Voice, Shortcuts, Feedback Forms, FleetingThoughts folder)
    ↓
Inbox (Supabase: status='inbox')
    ↓
Processing (categorized, assigned project/priority/tags)
    ↓                              ↓
    └── Source file moves to _processed/ (PDF → MD conversion)
    ↓
Routed (destination assigned, ready for action)
    ↓                              ↓
    └── Source file moves to _processed/ if not already moved
    ↓
Done → Graduated to project MASTER_CHECKLIST.md
    ↓
Archived (fully consumed, reference only)
```

**Key rule:** Both **processing** and **routed** statuses trigger moving source files to `_processed/`.

---

## Key Locations

| Purpose | Path |
|---------|------|
| Hub (start here) | `~/Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/FleetingThoughts/` |
| Hub AGENTS.md | `FleetingThoughts/AGENTS.md` |
| Processed files | `FleetingThoughts/_processed/` |
| Website Code | `Websites/DKRHUB/unshackled-pursuit/` |
| Agent Scripts | `Websites/DKRHUB/unshackled-pursuit/agents/` |
| Pipeline Ledger | `Websites/DKRHUB/unshackled-pursuit/docs/PIPELINE_LEDGER.md` |
| Skill Backup | `Websites/DKRHUB/unshackled-pursuit/agents/fleeting-skill-copy.md` |
| Output Folder | `Construct/Ideas/` |
| Conductor | `Construct/CONDUCTOR.md` |

All paths relative to: `~/Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/`

---

## Master Checklists (Graduation Destinations)

| Project | Checklist Location |
|---------|-------------------|
| Spatialis | `Construct/Ideas/Sigil/MASTER_CHECKLIST.md` |
| WaypointHub | `Waypoint/MASTER_CHECKLIST.md` |
| Construct Ideas (incubator) | `Construct/Ideas/MASTER_CHECKLIST.md` |

**Fleeting Thoughts pipeline tasks** are tracked in the Pipeline Ledger, not a separate checklist.

When graduating thoughts:
1. Consolidate routed items into the relevant project's MASTER_CHECKLIST.md
2. Mark "done" in Supabase with `routed_to` referencing the checklist
3. Log the graduation in the Pipeline Ledger

---

## Current Capabilities (Honest Assessment)

### What Actually Works Right Now
- **Web Kanban UI** at unshackledpursuit.com/fleeting (capture + drag-drop)
- **Supabase storage** with RLS (fleeting_thoughts + projects tables)
- **This skill** (`/fleeting`) - Claude can read, categorize, update, and organize thoughts
- **File scanning** - checks FleetingThoughts folder for unprocessed documents
- **Pipeline Ledger** - tracks all routing decisions for study/learning
- **API capture endpoint** at `/api/capture` (Shortcuts, feedback forms)
- **Mobile capture** via website (text, voice, paste)

### What Exists But Doesn't Run Automatically
- `folder-watcher.ts` - works when manually invoked, no scheduler
- `process-inbox.ts` - keyword triage, works manually, no scheduler
- `process-thoughts.ts` - uses Anthropic API (costs money), needs CLI conversion

### What Doesn't Exist Yet
- No automated processing (thoughts sit in inbox until manually handled)
- No Telegram bot
- No SSH remote execution pipeline
- No local AI (Ollama/MLX) installed
- No Wake-on-LAN
- No daily digest
- No auto-routing

### What /fleeting CAN Do Today
When invoked, Claude can:
1. Scan FleetingThoughts folder for unprocessed files
2. Pull all thoughts from Supabase
3. Categorize them (app idea, feature request, bug, reminder, reference, test)
4. Assign projects to untagged items
5. Set priorities and tags
6. Move items between statuses
7. Move source files to `_processed/` (with PDF → MD conversion)
8. Identify stuck/stale items
9. Suggest what to work on next
10. Create SPEC.md files for actionable ideas (in Construct/Ideas/)
11. Log all actions to the Pipeline Ledger

This is the **manual processing step** until automation exists.

---

## Thought Categories

When processing inbox items, classify each as:

| Category | Action | Route |
|----------|--------|-------|
| **App Idea** (new project) | Create SPEC.md in Construct/Ideas/ | Routed → Construct Ideas project |
| **App Feature** (existing project) | Assign to project, set priority | Processing → Routed |
| **Bug Report** | Assign to project, priority high | Processing → Routed |
| **Pipeline Improvement** | Assign to Fleeting Thoughts project | Processing → Routed |
| **Infrastructure/Automation** | Assign to Fleeting Thoughts project | Processing → Routed |
| **Personal Reminder** | Flag for Reminders routing | Routed (destination: reminders) |
| **Reference/Research** | Tag, set destination: reference | Routed (destination: reference) |
| **App Feedback** | Assign to project, tag: feedback | Processing → Routed |
| **Test Data** | Archive immediately | Archived |

---

## Actions by Request Type

### "review" or "status"
1. **Scan FleetingThoughts folder** for unprocessed files
2. Query all thoughts and projects
3. Count by status (inbox/processing/routed/done/archived)
4. Identify stuck items (in processing with no ai_analysis)
5. Report unassigned items (no project_id)
6. Report any unprocessed files in the folder
7. Compare to spec for gaps

### "process"
1. **Scan FleetingThoughts folder** for unprocessed files
2. Pull inbox items
3. Categorize each (see table above)
4. Assign projects, priorities, tags
5. Update via PATCH
6. Move items to appropriate status
7. Move source files to `_processed/` (convert PDF → MD)
8. **Log all actions to Pipeline Ledger**

### "organize"
1. Pull all thoughts
2. Identify misplaced items (wrong status, missing project)
3. Clean up test data
4. Ensure processing items have analysis or move back to inbox
5. Update stale items
6. **Log all actions to Pipeline Ledger**

### "next"
1. Check current state
2. Identify highest-impact unblocked action
3. Consider: what would make the pipeline more autonomous?

---

## Constraints
- NO Anthropic API costs - use Claude CLI (subscription) or local models
- Tailscale connects Pi 5 and MacBook
- Conductor (CONDUCTOR.md) orchestrates agents: Ralph (builder), Explorer (research)
- All SPEC files go in `Construct/Ideas/{ProjectName}/SPEC.md`
- All processing actions logged to Pipeline Ledger
- Skill backup kept in sync at `unshackled-pursuit/agents/fleeting-skill-copy.md`
