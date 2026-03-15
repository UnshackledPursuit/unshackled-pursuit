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
| **Dispatcher (Qwen 9B)** | `AGENTIC/agents/dispatcher.py` | Polls Supabase every 3 min. Qwen 3.5-9B triages items, retries failed agents, generates MLX fallback briefs. Phase 3 dry-run (Mar 12). |
| MLX inference wrapper | `AGENTIC/agents/mlx-inference.py` | CLI for local model inference (Qwen 9B, MedGemma 4B). RAM guard, Claude guard, timeout. |
| Process queue agent | `AGENTIC/agents/process-queue.sh` | Auto-processes iPhone podcast captures (every 30 min, launchd) |
| User-action handler | `AGENTIC/agents/process-user-actions.sh` | Handles Dig Deeper/Implement from FT app (every 30 min, launchd) |
| Intelligence POST | `AGENTIC/agents/intelligence-post.sh` | POSTs briefs/intelligence to Supabase pipeline |
| Morning digest | `AGENTIC/agents/prompts/morning-digest.md` | Daily summary of overnight agent output |
| Knowledge DB search | `AGENTIC/search` | FTS5 + vector search across ecosystem docs |
| Web dashboard | `fleetingthoughts.app` | Board, agents, media queue, analytics, **Intel Report** |
| Intel Report | `fleetingthoughts.app/intel-report` | Interactive intel review — structured cards, ThemeAnalysis, AI Council, archive with undo |
| iOS app | Share Extension + direct capture → Supabase (priority + project chips) |
| Mac app | Hotkey capture, local only |
| This skill (`/fleeting`) | Manual triage when invoked |

**Not running (archived Gen 1):** `folder-watcher.ts`, `process-inbox.ts`, `process-thoughts.ts` in `Websites/.../agents/`. These are old Node scripts. Ignore them.

---

## Dispatcher Integration (Qwen 3.5-9B + MLX)

The dispatcher (`AGENTIC/agents/dispatcher.py`) runs every 3 minutes via launchd. It uses Qwen 3.5-9B locally via MLX to pre-triage items. This skill and the dispatcher work TOGETHER, not in competition.

**Current status (Mar 12):** Phase 3 dry-run. Dispatcher logs decisions to `/tmp/dispatcher-decisions.jsonl` but does NOT execute. Review these daily.

**How they collaborate:**

| Stage | Who Does It | What Happens |
|-------|------------|-------------|
| Capture | User via web/iOS/Mac | User sets priority + project + modifiers via chips. Hits Supabase. |
| Pre-triage | Dispatcher (Qwen 9B) | Classifies category, validates routing, proposes tags. Logs decision. Does NOT change status. |
| Full triage | This skill (Claude) OR dispatcher live mode | Reads pre-triage decision, confirms or overrides, applies status change + ai_analysis. |
| Disagreement | This skill logs correction | If overriding Qwen's decision, log `corrected_from` in breadcrumb. This is the highest-value training signal. |

**When running /fleeting alongside dispatcher:**
1. Check `/tmp/dispatcher-decisions.jsonl` for recent triage proposals
2. If dispatcher already triaged an item, review its decision before overriding
3. Log disagreements with `corrected_from` field in breadcrumb (see below)
4. Items the dispatcher marked as "needs-claude" should get priority processing

**Dispatcher can trigger Claude sessions:** When live (Phase 4), the dispatcher will `launchctl kickstart` agents for retries and can launch `claude -p` in tmux for complex items. The skill doesn't need to know about this — it's infrastructure.

**Enhanced breadcrumb format (when overriding dispatcher):**
```jsonl
{"ts":"...","item_id":"...","content_preview":"...","decision":"route-to-intel","corrected_from":{"qwen_decision":"archive","qwen_confidence":"medium","qwen_reasoning":"Looks like status update"},"reasoning":"Actually contains actionable CVE data — Qwen missed the security signal","confidence":"high"}
```

The `corrected_from` field is the highest-value training signal. It teaches the model exactly where its judgment failed and why.

---

## Capture Form Metadata (fleetingthoughts.app)

The web capture bar sends structured metadata that this skill should use during triage:

**Priority chips (user-set, trust these):** `high`, `medium`, `low`, `someday`
- If user set priority at capture, DO NOT override it. Log it as-is in breadcrumb.
- If no priority set, default to `medium`.

**Project chips:** `agentic`, `media`, `health`, `fleeting-thoughts`, `spatialis`, `waypointhub`, `baoding-orbs`, `utterflow`
- User-set project is ground truth for routing.
- Items captured with a project chip should route to that project's context.

**Modifier chips (planned):** `research`, `ideas`, `feedback`
- `research` — triggers deep-research-loop or AI Council investigation
- `ideas` — triggers quick spec generation, archives for later review
- `feedback` — routes to prompt improvement pipeline (correction → breadcrumb)

**Where to find this data:** Check the item's `metadata` JSONB field and `tags` array. Priority is a top-level field. Project may be in tags or metadata.

---

## Daily Pipeline Improvement Process (MANDATORY)

Every pipeline/fleeting session MUST:
1. **Read previous day's improvement doc** — `AGENTIC/_briefs/intel-pipeline-improvements-YYYY-MM-DD.md`
2. **Skim the last week** of improvement docs for patterns and unresolved items
3. **Process with quality** — depth over volume. AI Council for theme clusters with 3+ items.
4. **Create/update today's improvement doc** — what worked, what didn't, quality issues, recommendations
5. **Update CLAUDE.md** if pipeline architecture changes were made

---

## Intel Report & API (LIVE — fleetingthoughts.app/intel-report)

The Intel Report is the primary user-facing review surface. It renders all `status=intel` items with structured analysis, theme grouping, and interactive actions.

**Server routes (`/api/intel`):**
- `GET` — fetches `status=intel` items (service key, bypasses RLS, limit 200)
- `PATCH` — single item update (`{id, status, notes, append_notes}`) or bulk archive (`{bulk_archive: true, ids: [...]}`)
- `POST` — create new items (AI Council research requests, agent-generated items)

**How it renders:**
1. Items categorized: Podcasts → Research → Intelligence → Tools → Links → X Links → General
2. Categories with >4 items get theme subclustering (9 theme patterns)
3. **ThemeAnalysis** per group: extracts Key Developments, Relevance to Us, Recommended Actions from items' structured `ai_analysis`
4. **Intelligence Briefing** at top: per-theme narrative with WHY IT MATTERS insights
5. Per-card actions: Comment → Agent Queue, Copy Markdown, Archive with undo
6. AI Council button per theme: POSTs structured research request to agent_queue
7. Collapse All / Expand All with lifted state

**ThemeAnalysis requires structured ai_analysis.** Items without ALL CAPS headers (WHAT IT IS, WHY IT MATTERS, ACTION ITEMS) will show "No structured analysis available." Processing MUST produce these headers.

---

## Structured Analysis Format (REQUIRED for all intel items)

Every item moved to `status=intel` MUST have `ai_analysis` with ALL CAPS section headers:

```
[Topic Title]

WHAT IT IS:
[2-3 sentences describing the item and context]

KEY CLAIMS:
- [claim 1 with attribution]
- [claim 2]

WHY IT MATTERS TO US:
[2-3 sentences connecting to DKR ecosystem — apps, pipeline, strategy]

ACTION ITEMS:
1. [Specific action]
2. [Specific action]

SOURCE: [URL, author, date]
```

**Minimum 220 chars.** Thin summaries break ThemeAnalysis and provide no value to the user.

---

## Intent Classification (CRITICAL for iphone-dictation)

When `source=iphone-dictation`, classify intent FIRST:

| Intent | Example | Route |
|--------|---------|-------|
| **Data to catalog** | "Interesting article about AI agents" | Process → intel |
| **Research request** | "Research terminal access from iPhone" | Deep research → intel (tagged `research`) |
| **Feature request** | "Add comments to share extension" | Process as feature request → intel (tagged `feature-request`) |
| **Strategic directive** | "Monitor Big Tech agentic moves" | Process with strategic framing → intel (tagged `strategic`) |
| **Operational complaint** | "Analytics gaps, agents not seeing data" | Process with action items → intel (tagged `operations`) |

**Instructions need EXECUTION, not just routing.** "Research this" means do the research and write findings. "Build this" means evaluate feasibility. "Figure out how" means investigate options.

---

## Project Tagging

Items should be tagged with relevant project names during processing:
`spatialis`, `waypointhub`, `baoding-orbs`, `utterflow`, `fleeting-thoughts`, `agentic`, `valerian`, `media`

Parse user dictations and content for project context. Multiple projects are fine.

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

## Structured Decision Breadcrumbs (MANDATORY)

Every triage decision the orchestrator makes MUST leave a structured breadcrumb. These are training data for local models (Qwen 3.5 via MLX) that will eventually handle triage autonomously.

**When processing ANY item, append a decision record to `AGENTIC/_briefs/triage-log-YYYY-MM-DD.jsonl`:**

```jsonl
{"ts":"2026-03-11T18:30:00Z","item_id":"abc12345","content_preview":"Research terminal access from iPhone","source":"iphone-dictation","decision":"route-to-intel","tags_applied":["research","agentic","infrastructure"],"project":"agentic","priority":"medium","confidence":"high","reasoning":"Infrastructure research request — needs investigation, not just routing","escalated_to":null}
```

**Fields (all required):**

| Field | What | Example |
|-------|------|---------|
| `ts` | ISO timestamp | `2026-03-11T18:30:00Z` |
| `item_id` | First 8 chars of Supabase ID | `abc12345` |
| `content_preview` | First 80 chars of content | `Research terminal access...` |
| `source` | Capture source | `iphone-dictation`, `agent`, `dashboard-capture` |
| `decision` | What you decided | `route-to-intel`, `archive`, `agent-queue`, `route-to-project` |
| `tags_applied` | Tags you set | `["research","agentic"]` |
| `project` | Project assignment | `agentic`, `spatialis`, `none` |
| `priority` | Priority you assigned | `high`, `medium`, `low` |
| `confidence` | How confident in this routing | `high`, `medium`, `low` |
| `reasoning` | WHY you made this decision (1 sentence) | `Matches BDG-90 in Baoding checklist` |
| `escalated_to` | If handed to Claude/agent | `claude`, `process-queue`, `null` |

**Why this matters:** These records teach local models what good triage looks like. The reasoning field is the most valuable — it's the judgment a smaller model needs to learn. Without it, the model can only mimic patterns. With it, it can learn your decision framework.

**Retroactive breadcrumbs:** A dedicated session can query Supabase for all historical items with their status transitions and generate breadcrumbs retroactively. The data exists — every item has `captured_at`, `status`, `tags`, `ai_analysis`, `routed_to`, `source`. A focused orchestrator pass can reconstruct the decision trail for hundreds of past items and bulk-write the training log.

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
| **Pipeline improvements (daily)** | `AGENTIC/_briefs/intel-pipeline-improvements-YYYY-MM-DD.md` |
| Person of Interest | `AGENTIC/PERSON_OF_INTEREST.md` |
| Pipeline audit/redesign | `AGENTIC/_briefs/fleeting-pipeline-audit-2026-03-09.md` |
| **Intel Report source** | `Websites/DKRHUB/fleeting-thoughts/src/app/intel-report/page.tsx` |
| **Intel API route** | `Websites/DKRHUB/fleeting-thoughts/src/app/api/intel/route.ts` |
| **Dashboard CLAUDE.md** | `Websites/DKRHUB/fleeting-thoughts/CLAUDE.md` |
| Web dashboard | `Websites/DKRHUB/fleeting-thoughts/` |
| Pipeline Ledger | `Websites/DKRHUB/unshackled-pursuit/docs/PIPELINE_LEDGER.md` |
| Processed files | `FleetingThoughts/_processed/` |
| **BACKUP: This skill** | `Websites/DKRHUB/unshackled-pursuit/agents/fleeting-skill-copy.md` (git-tracked) |
| **BACKUP: Audit brief** | `Websites/DKRHUB/unshackled-pursuit/docs/fleeting-pipeline-audit-2026-03-09.md` (git-tracked) |

**Sync rule:** When updating this skill or the audit brief, copy to the DKR Hub backups and commit. These are the git-tracked safety copies.

All paths relative to `~/Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/`
