---
name: fleeting
description: Review and process the fleeting thoughts pipeline. Use when asked about fleeting thoughts, the capture pipeline, or autonomous infrastructure.
allowed-tools: Read, Glob, Grep, Bash
---

# Fleeting Thoughts Pipeline

## Quick Start

1. Read hub context: `FleetingThoughts/AGENTS.md`
2. Scan `FleetingThoughts/` folder for unprocessed files (anything not CLAUDE.md, AGENTS.md, or in `_processed/`)
3. Query Supabase for live data (commands below)
4. Act on the request
5. Log actions to Pipeline Ledger

---

## Supabase Access

```bash
ENV_FILE=~/"_Business HUB/3.0_Hub/AGENTIC/.keys/.env.local"
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL "$ENV_FILE" | cut -d'=' -f2)
SERVICE_KEY=$(grep SUPABASE_SERVICE_KEY "$ENV_FILE" | cut -d'=' -f2)

# Read inbox
curl -s "${SUPABASE_URL}/rest/v1/fleeting_thoughts?select=*&status=eq.inbox&order=captured_at.desc" \
  -H "apikey: ${SERVICE_KEY}" -H "Authorization: Bearer ${SERVICE_KEY}" -H "Range: 0-99"

# Read all thoughts
curl -s "${SUPABASE_URL}/rest/v1/fleeting_thoughts?select=*&order=captured_at.desc" \
  -H "apikey: ${SERVICE_KEY}" -H "Authorization: Bearer ${SERVICE_KEY}" -H "Range: 0-99"

# Update a thought (PATCH)
curl -s -X PATCH "${SUPABASE_URL}/rest/v1/fleeting_thoughts?id=eq.<ID>" \
  -H "apikey: ${SERVICE_KEY}" -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"status": "done", "priority": "high"}'

# Insert a thought (POST)
curl -s -X POST "${SUPABASE_URL}/rest/v1/fleeting_thoughts" \
  -H "apikey: ${SERVICE_KEY}" -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"content": "...", "content_type": "text", "source": "agent", "status": "inbox", "user_id": "18a92969-5664-4d63-95fc-d8481e6c42e2"}'
```

**User ID:** `18a92969-5664-4d63-95fc-d8481e6c42e2`

---

## Project IDs

| Project | ID |
|---------|-----|
| WaypointHub | `3e4b5a48-07a7-4a77-8c54-504560208397` |
| Spatialis | `be4e8911-df8c-49b0-bcb1-4af7db185eca` |
| Construct Ideas | `291bc648-719d-41d6-bcfc-4334076cb22d` |
| Fleeting Thoughts | `af3cc925-78dd-4ee1-863d-35735619c423` |
| Unshackled Pursuit | `07cb1d12-0a06-44fd-bc94-a034dd89fca8` |
| Network | `85a0105c-6394-45e9-ac86-272a4dde197d` |

---

## Active Tools (What Actually Runs)

| Tool | Where | What It Does |
|------|-------|-------------|
| Process queue agent | `AGENTIC/agents/process-queue.sh` | Auto-processes iPhone podcast captures (every 30 min, launchd) |
| User-action handler | `AGENTIC/agents/process-user-actions.sh` | Handles Dig Deeper/Implement from FT app (every 30 min, launchd) |
| Intelligence POST | `AGENTIC/agents/intelligence-post.sh` | POSTs briefs/intelligence to Supabase pipeline |
| Morning digest | `AGENTIC/agents/prompts/morning-digest.md` | Daily summary of overnight agent output |
| Knowledge DB search | `AGENTIC/search` | FTS5 + vector search across ecosystem docs |
| Web dashboard | `fleetingthoughts.app` | Board, agents, media queue, analytics |
| iOS app | Share Extension + direct capture → Supabase |
| Mac app | Hotkey capture, local only |
| This skill (`/fleeting`) | Manual triage when invoked |

**Not running (archived Gen 1):** `folder-watcher.ts`, `process-inbox.ts`, `process-thoughts.ts` in `Websites/.../agents/`. These are old Node scripts. Ignore them.

---

## X Link Processing

X links are the highest-signal intelligence source. They require special handling because X blocks non-JS access.

**System docs (read these for full methodology):**
- Grok Extraction SOP: `AGENTIC/agents/prompts/grok-extraction-sop.md`
- Person of Interest: `AGENTIC/PERSON_OF_INTEREST.md` (S/A/B trust tiers)
- Chrome MCP reference: `AGENTIC/agents/prompts/tool-reference-chrome-mcp.md`
- Process documentation: `AGENTIC/_briefs/fleeting-pipeline-audit-2026-03-09.md` (X Link Processing Playbook section)

**Quick process:**
1. Identify X links in inbox (URLs with `x.com/` or `twitter.com/`)
2. Report X links separately from regular items ("12 items + 18 X links")
3. Check author against Person of Interest registry
4. Use Chrome MCP → screenshot to read posts (more reliable than get_page_text on X)
5. For high-signal clusters: Grok Expert + Gemini Thinking for deep research
6. Classify each as Type A or Type B (see Closing the Loop below)
7. PATCH status immediately — don't leave processed items in inbox

**Heuristics for autonomous evaluation** are codified in the audit brief under "User Evaluation Heuristics."

---

## Intelligence Routing

| What | Where It Goes |
|------|-------------|
| Actionable intelligence | Supabase via `intelligence-post.sh` |
| Person of Interest updates | `AGENTIC/PERSON_OF_INTEREST.md` |
| Strategic trends | `AGENTIC/strategic-context.md` |
| Tools/repos to evaluate | Supabase via `intelligence-post.sh` (tag: `tool-candidate`) |
| Buildable features | Project's MASTER_CHECKLIST.md |
| Research/podcasts/articles | Brief in `AGENTIC/_briefs/` |

---

## Thought Categories

| Category | Route |
|----------|-------|
| **App Idea** (new) | Create SPEC.md in `Construct/Ideas/` |
| **App Feature** (existing) | Assign to project, graduate to checklist |
| **Bug Report** | Assign to project, priority high |
| **X Link** | Separate pipeline (see above) |
| **Research/Podcast/Article** | Brief to `AGENTIC/_briefs/` |
| **Strategic Awareness** | `AGENTIC/strategic-context.md` |
| **Pipeline Improvement** | Assign to Fleeting Thoughts project |
| **Personal Reminder** | Flag for reminders |
| **Reference** | Tag, archive with URL |
| **Test Data** | Archive immediately |

---

## Board Columns (Confirmed Mar 9)

| Column | Status Value | Purpose |
|--------|-------------|---------|
| **Inbox** | `inbox` | User captures (non-URL), raw/unprocessed |
| **Links** | `links` | URLs auto-route here (X links, YouTube, GitHub, references) |
| **Intel** | `intel` | Processed items with readable analysis. User reviews, decides action. |
| **Agent Queue** | `agent_queue` | Items forwarded to agents for processing |
| **Agent Log** | `done` | Agent output — autonomous results + completed queue items. (Agents already POST as `done` — just rename the column on the board. Change status value later in dedicated session.) |
| **Archived** | `archived` | End state. Fully consumed. Retains all tags. |

**Active count** = Inbox + Links + Intel + Agent Queue. Agent Log and Archived do NOT count.

## Pipeline Flow

```
User capture → Inbox → (process) → Intel → Archived
                                       └──→ Agent Queue → Agent Log → Archived
URL capture  → Links → (process) → Intel → Archived
Agent output → Agent Log (directly)
```

**Rules:**
- Always set `ai_analysis` with readable summary (not just the URL)
- Always tag with project + type
- CLOSE THE LOOP every session — no processed items left in inbox
- Source files in FleetingThoughts/ move to `_processed/` when processing/routed

---

## Closing the Loop (MANDATORY after processing)

Every processed item MUST be moved out of inbox. Classify as:

| Type | What It Is | Status | Tags | Example |
|------|-----------|--------|------|---------|
| **A: Extracted** | Insight captured, no action needed | `archived` | project + type tags | Alex Finn commentary, duplicates |
| **B: Intel** | Extracted + actionable, needs user eyes | `intel` | `intel` + project + type tags | Tobi Lutke validation, tool evaluations |
| **C: Agent Handoff** | Needs agent research/implementation | `agent_queue` | project + type tags | "evaluate this repo", "implement this feature" |

**Every PATCH must include:**
- `status` — archived, intel, or agent_queue
- `tags` — array with project + type (e.g., `["x-link","intel","research","agentic"]`)
- `ai_analysis` — what it is, who posted it, trust tier, why it matters
- `routed_to` — where the insight lives (brief path, strategic-context.md, checklist, etc.)

**Duplicates:** Tag as `["duplicate"]`, archive, set `routed_to` to "duplicate".

---

## Actions by Request

| Request | What to Do |
|---------|------------|
| "review" / "status" | Scan folder, query Supabase, count by status, identify stuck items |
| "process" | Scan folder, pull inbox, categorize each, assign projects, update via PATCH, log to ledger |
| "organize" | Find misplaced items, clean up test data, fix stale statuses |
| "graduate" / "cleanup" | Move routed→done where value extracted, archive completed items |
| "next" | Check state, suggest highest-impact action |

---

## Processing Discipline

1. Understand user's current focus before routing anything
2. Surface relevant items first — don't default to "clear inbox"
3. Read full content before categorizing
4. Routing accuracy > inbox zero
5. Similar thoughts are NOT duplicates — preserve distinct angles
6. iPhone → Supabase, Mac → local. Don't cross the streams.

---

## Pipeline Ledger

**Location:** `Websites/DKRHUB/unshackled-pursuit/docs/PIPELINE_LEDGER.md`

Log every action: date, thought ID (first 8 chars), summary, action, project, reasoning, outcome.

---

## Pipeline Redesign (IN PROGRESS)

The pipeline is actively being restructured. Full design docs, AI Council research, heuristics, and restructuring plan live in:

**`AGENTIC/_briefs/fleeting-pipeline-audit-2026-03-09.md`**

Read that brief before making structural changes. It contains: two-stage processing model, board column redesign, auto-routing rules, AI Council methodology, and the 11-item restructuring plan.

---

## Key Locations

| What | Where |
|------|-------|
| Hub docs | `FleetingThoughts/AGENTS.md` |
| This skill | `skills/fleeting/SKILL.md` |
| AGENTIC agents | `AGENTIC/agents/` |
| Intelligence briefs | `AGENTIC/_briefs/` |
| Person of Interest | `AGENTIC/PERSON_OF_INTEREST.md` |
| Pipeline audit/redesign | `AGENTIC/_briefs/fleeting-pipeline-audit-2026-03-09.md` |
| Web dashboard | `Websites/DKRHUB/fleeting-thoughts/` |
| Pipeline Ledger | `Websites/DKRHUB/unshackled-pursuit/docs/PIPELINE_LEDGER.md` |
| Processed files | `FleetingThoughts/_processed/` |

All paths relative to `~/Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/`
