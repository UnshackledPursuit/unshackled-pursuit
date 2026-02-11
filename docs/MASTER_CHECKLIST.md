# Fleeting Thoughts Pipeline — MASTER CHECKLIST

> **Project:** Fleeting Thoughts Pipeline Automation & AI Enhancement
> **Owner:** Dylan Russell
> **Last Updated:** 2026-02-10
> **Branch:** `feat/pipeline-automation-tier1`
>
> Single source of truth for pipeline buildout. Read this first when working on automation.

---

## Current State

### What Actually Works Today

| Component | Status | Details |
|-----------|--------|---------|
| Web Kanban UI | Working | unshackledpursuit.com/fleeting — capture, drag-drop, project assignment |
| Supabase storage | Working | `fleeting_thoughts` + `projects` tables, RLS with service key bypass |
| `/fleeting` skill | Working | Manual agent processing — categorize, route, file scan, ledger log |
| File scanning | Working | Scans FleetingThoughts/ folder each `/fleeting` session for unprocessed files |
| Pipeline Ledger | Working | `docs/PIPELINE_LEDGER.md` — tracks all routing decisions, version controlled |
| `/api/capture` endpoint | Working | External capture via POST (Shortcuts, feedback forms) |
| Mobile capture | Working | Website text/voice/paste + FleetingThoughts iCloud folder drop |
| `_processed/` workflow | Working | Source files move to `_processed/` at processing or routed status |

### What Infrastructure Exists

| Device | Role | What's Running |
|--------|------|----------------|
| MacBook Pro M1 Max (32GB) | Primary dev + heavy compute | Xcode, Claude CLI, Tailscale, iCloud |
| Raspberry Pi 5 (8GB) | Always-on coordinator | Tailscale, Samba, SSH, Pi-hole, Frigate, Home Assistant |
| iPhone 15 Pro Max | Capture device | Website, iCloud folder, Shortcuts |
| Apple Vision Pro | Target platform | Spatialis, WaypointHub development |

### What Exists But Doesn't Run Automatically

| Script | Location | What It Does | Status |
|--------|----------|-------------|--------|
| `folder-watcher.ts` | `agents/` | Ingests .md/.pdf/.txt from iCloud folder → Supabase | **Rewritten** (Tier 1). Works manually. launchd blocked by iCloud permission. |
| `process-inbox.ts` | `agents/` | Keyword-based categorization of inbox items | **Rewritten** (Tier 1). Works manually. No scheduler yet. |
| `process-thoughts.ts` | `agents/` | AI analysis + SPEC.md generation | **Unchanged.** Uses Anthropic API (costs $), violates no-graduation rule. Tier 2 conversion needed. |
| `pipeline-rules.ts` | `agents/` | Shared module: guardrails, constants, utilities | **Created** (Tier 1). All scripts import from here. |

### Compiled Versions (for launchd)

| File | Location | Purpose |
|------|----------|---------|
| `folder-watcher.js` | `~/bin/fleeting-watcher/` | Compiled JS — runs without ts-node |
| `pipeline-rules.js` | `~/bin/fleeting-watcher/` | Compiled JS — patched with absolute paths |
| `folder-watcher.sh` | `~/bin/fleeting-watcher/` | Bash version — alternative that avoids node entirely |
| `.env.local` | `~/bin/fleeting-watcher/` | Local copy of Supabase creds (keep in sync with project) |
| `run-folder-watcher.sh` | `~/bin/` | Wrapper script called by launchd plist |
| `com.fleeting.folder-watcher.plist` | `~/Library/LaunchAgents/` | launchd agent (currently unloaded) |

### What Doesn't Exist Yet

- No automated processing (scripts work manually, launchd blocked by permission)
- No local AI models installed (Ollama, MLX)
- No Telegram bot
- No SSH remote execution pipeline
- No Wake-on-LAN
- No daily digest

---

## launchd + iCloud Troubleshooting (CRITICAL — Read Before Attempting)

> **Status:** UNRESOLVED. The folder watcher works perfectly when run manually. Automating it via launchd is blocked by macOS iCloud Drive permissions.

### The Problem

macOS requires explicit permission for processes to access iCloud Drive (`~/Library/Mobile Documents/`). Interactive terminal sessions inherit Terminal.app's permissions. launchd-spawned processes do NOT — they need **Full Disk Access** granted to the specific binary.

### What Was Tried (Feb 10-11, 2026)

| Attempt | Approach | Result |
|---------|----------|--------|
| 1 | `npx ts-node` directly in plist | `EPERM: uv_cwd` — npx calls `process.cwd()` during init, fails before script runs |
| 2 | Shell wrapper with `cd` before npx | Same `uv_cwd` — npx internal init still calls cwd |
| 3 | Shell wrapper at `~/bin/` (non-iCloud path) | Same — npx fails regardless of wrapper location |
| 4 | `node -r ts-node/register` (skip npx) | `EPERM: uv_cwd` — node's preload module phase calls cwd |
| 5 | plist `WorkingDirectory` set to `~/` + absolute paths | `EPERM: open` on `node_modules/ts-node/register/index.js` — node can't read iCloud |
| 6 | Compiled JS in `~/bin/fleeting-watcher/` (local node_modules) | `EPERM: open` on `.env.local` at iCloud path — ANY iCloud file read fails |
| 7 | Local `.env.local` copy + compiled JS | Works past init, but `EPERM: scandir` on FleetingThoughts/ — node can't list iCloud dir |
| 8 | Pure bash script (no node at all) | Same `Operation not permitted` on `ls` of iCloud dir — bash from launchd also blocked |
| 9 | User granted node "Files and Folders" permission interactively | Only applies to interactive sessions, NOT launchd context |
| 10 | User added node to Full Disk Access | **NOT TESTED** — UI issues prevented confirming. Node may already have FDA. |

### Root Cause

launchd processes run outside any app sandbox. macOS TCC (Transparency, Consent, and Control) blocks access to iCloud Drive for processes without Full Disk Access. The interactive permission grant (the popup you see in Terminal) does NOT carry over to launchd-spawned processes.

### Approaches to Research Next Session

**Option A: Verify Full Disk Access (Quick Check)**
- User may have already added `/opt/homebrew/opt/node@20/bin/node` to Full Disk Access
- If so, just reload the plist with the node/compiled-JS approach (attempt 7) and test
- The compiled JS at `~/bin/fleeting-watcher/folder-watcher.js` with local `.env.local` should work
- Test: `launchctl load ~/Library/LaunchAgents/com.fleeting.folder-watcher.plist`, drop a file, check `/tmp/fleeting-folder-watcher.log`

**Option B: Local Watch Folder (Avoids iCloud Entirely)**
- Create `~/FleetingThoughts/` as the launchd watch target (local, no permissions needed)
- Change plist WatchPaths to `~/FleetingThoughts/`
- Script reads from `~/FleetingThoughts/`, moves to `~/FleetingThoughts/_processed/`
- User drops files there directly (or an Apple Shortcut copies from iCloud → local)
- Trade-off: loses the "drop in iCloud from any device" simplicity

**Option C: macOS Folder Actions (Automator/Shortcuts)**
- macOS Folder Actions run within Finder's context (which already has FDA)
- Create an Automator "Folder Action" on the iCloud FleetingThoughts folder
- The action runs our bash script or a curl command
- Trade-off: Automator is fragile, harder to debug, no good logging

**Option D: Vercel Cron Instead of launchd**
- Skip local file watching entirely
- Folder watcher becomes a Vercel serverless function triggered by cron
- But: Vercel can't access the local iCloud filesystem
- Would need: Shortcut that uploads file content to `/api/capture` instead of dropping in folder
- Trade-off: changes the user workflow (no more drag-and-drop files)

**Option E: fsevents/fswatch with Different Permission Model**
- Research whether `fswatch` or native FSEvents API has different TCC behavior
- May still need FDA — needs testing

**Option F: Swift Helper App**
- Build a tiny Swift app that watches the folder and runs the script
- An actual .app can request and receive FDA through the normal macOS permission flow
- Most "proper" macOS solution but highest effort
- Trade-off: maintaining another binary

### Recommendation for Next Agent

Start with **Option A** — just verify if FDA is already granted. If it works, done. If not, research **Options B and F** in parallel:
- Option B is the fastest fallback (30 min to implement)
- Option F is the cleanest long-term solution (might be worth it since we're building apps anyway)

Do NOT spend time retrying the same launchd approaches listed above. They all fail for the same root cause (TCC/FDA). The only variables are: does the binary have FDA, or can we avoid iCloud in the launchd path entirely.

---

## Automation Guardrails

These rules apply to ALL automated scripts. The `/fleeting` skill enforces them for agent sessions. Scripts must enforce them in code.

### No-Graduation Rule

Automated scripts may:
- Assign `project_id` and tags (categorize)
- Move status forward: inbox → processing → routed
- Move source files to `_processed/`
- Log actions to the Pipeline Ledger
- Set `priority`, `ai_analysis`, `suggested_destination`

Automated scripts must NEVER:
- Write to any project's MASTER_CHECKLIST.md
- Mark items as "done" (graduation is human-initiated)
- Create SPEC.md files or project folders in Construct/Ideas/
- Modify anything outside the Fleeting Thoughts pipeline

Graduation (routed → done) remains a human + `/fleeting` skill decision.

### Ledger Enforcement

Every script that modifies Supabase data MUST append to `docs/PIPELINE_LEDGER.md`. This is non-negotiable. The ledger serves as archive AND learning tool.

### Shared Pipeline Rules

All scripts import from a shared `pipeline-rules.ts` module that contains:
- Ledger append function
- `_processed/` move function with PDF→MD conversion support
- Hub file exclusion list (CLAUDE.md, AGENTS.md)
- Project ID constants (from Supabase)
- Status transition validation
- No-graduation guardrail enforcement

This ensures the skill and scripts follow the same rules.

---

## Pipeline Automation Tiers

### Tier 1 — Highest ROI, Smallest Effort

> **Goal:** Pipeline does basic work when you're away. You review results, not raw inbox.

- [x] **Create shared `pipeline-rules.ts` module** *(done 2026-02-11)*
  - Ledger append, hub file exclusion, project IDs, `_processed/` move, status validation, no-graduation guardrail

- [x] **Fix and update `folder-watcher.ts`** *(done 2026-02-11)*
  - PDF support, hub file exclusion, pipeline-rules imports, ledger logging, clean file naming, dotenv

- [x] **Fix and update `process-inbox.ts`** *(done 2026-02-11)*
  - pipeline-rules imports, ledger logging, dotenv, project matching, status validation

- [ ] **Schedule `folder-watcher.ts` via launchd** *(BLOCKED — see launchd troubleshooting section above)*
  - plist created, wrapper script created, compiled JS exists at `~/bin/fleeting-watcher/`
  - Blocked by macOS iCloud Full Disk Access permission
  - User may have already granted FDA to node — needs verification

- [ ] **Schedule `process-inbox.ts` execution**
  - Option A: Vercel cron endpoint (every 15 min)
  - Option B: launchd periodic on Mac
  - Evaluate which is simpler and more reliable

**Tier 1 outcome:** Files dropped in iCloud auto-ingest to Supabase. Inbox items get keyword-categorized automatically. All actions logged to ledger. You open `/fleeting` and everything is pre-sorted.

### Tier 2 — Local AI + Enrichment

> **Goal:** AI-powered classification and analysis without API costs.
> **Cross-project benefit:** Classification prompts developed here port directly to Foundation Models in Waypoint.

- [ ] **Install Ollama on MacBook**
  - `brew install ollama`
  - Pull Llama 3.2 3B (fast classification, ~2GB)
  - Pull Qwen 2.5 14B (deeper analysis, ~9GB)
  - Verify API at `localhost:11434`

- [ ] **Convert `process-thoughts.ts` from Anthropic API to local**
  - Option A: Ollama API calls (free, local)
  - Option B: Claude CLI subprocess (subscription, no variable cost)
  - Option C: Google CLI / Gemini (explore availability)
  - Remove SPEC.md generation (violates no-graduation rule)
  - Add ledger logging
  - Script enriches `ai_analysis` field only — does NOT create files or folders

- [ ] **PDF-to-Markdown automation**
  - Install Marker (`pip install marker-pdf`) or use Claude's PDF reading
  - Wire into folder-watcher or as post-processing step
  - 4 PDFs currently in `_processed/` need MD conversion

- [ ] **Schedule enriched processing**
  - Once Ollama/CLI conversion done, run periodically
  - Full pipeline: capture → store → keyword categorize → AI enrich → route

**Tier 2 outcome:** Full autonomous pipeline — thoughts arrive, get categorized, get AI-enriched by local model, get routed. You just review and graduate.

### Tier 3 — Always-On Infrastructure

> **Goal:** Pipeline runs even when Mac is asleep. Pi 5 becomes real coordinator.

- [ ] **Install Ollama on Pi 5**
  - Llama 3.2 3B or Phi-3 Mini for classification
  - Pi 5 handles lightweight triage, calls Mac for heavy inference

- [ ] **SSH from Pi 5 to Mac**
  - Passwordless SSH setup
  - Mac Remote Login enabled
  - Test via Tailscale hostname

- [ ] **Wake-on-LAN**
  - Enable on Mac (System Settings → Battery → Options → Wake for network access)
  - Get Mac's MAC address for Pi 5 wake script
  - Test WoL from Pi 5

- [ ] **Daily digest**
  - Cron on Pi 5 (7am)
  - Queries Supabase for pipeline state
  - Sends summary via Telegram or email
  - Covers: new captures, auto-classified items, items awaiting review

- [ ] **Telegram bot**
  - Create via @BotFather
  - Thought capture mode (default): text → Supabase inbox
  - Command mode: `/list`, `/status`, `/digest`
  - NOT executing builds or graduating items (Tier 4)

**Tier 3 outcome:** Pi 5 coordinates. Pipeline runs 24/7. Morning briefing of overnight activity.

### Tier 4 — Long-Term Vision (M5 Ultra Era)

> **Goal:** Full autonomous development infrastructure. Deferred until hardware upgrade (~late 2026).

- [ ] Multi-agent orchestration (Conductor, Ralph, Explorer)
- [ ] Risk tier system (auto-execute vs. review-required)
- [ ] RAG/embeddings knowledge base (ChromaDB/Qdrant on Pi 5)
- [ ] Auto-routing with confidence thresholds
- [ ] n8n workflow automation on Pi 5
- [ ] EXO distributed inference (pool memory across M5 Ultra + M1 Max)
- [ ] Feature Proposal Agent (monitors Apple docs, suggests updates)
- [ ] Remote build execution via Telegram → Pi 5 → Mac → Claude CLI
- [ ] TestFlight upload automation via fastlane

---

## Cross-Project R&D Note

The classification work in this pipeline (categorize, tag, route thoughts) is the **same fundamental task** as Waypoint's planned AI layer:

| Pipeline Runtime | Waypoint Runtime | Task |
|-----------------|-----------------|------|
| `process-inbox.ts` keywords | — | v0 classifier |
| Ollama Llama 3.2 3B | — | v1 classifier (local) |
| Ollama Qwen 2.5 14B | Local server enhancement tier | v2 classifier (deep) |
| — | Foundation Models on-device | v3 classifier (shipping) |

Prompts and logic transfer directly. Building for the pipeline is R&D for Waypoint's AI features. Track this in both checklists when relevant.

---

## Reference Documents

These are source material — consumed and distilled into this checklist. They remain as reference in `_processed/` and are tracked in Supabase.

| Document | Location | Supabase ID | Content |
|----------|----------|-------------|---------|
| Autonomous Infrastructure Spec v1 | `_processed/AUTONOMOUS_INFRASTRUCTURE_SPEC.md` | `7922d618` | Full 5-phase vision (835 lines) |
| Autonomous Infrastructure Spec v2 | `_processed/AUTONOMOUS_INFRASTRUCTURE_SPEC_v2.md` | `3f7fd349` | Condensed version (520 lines) |
| Local AI Setup Overview | `_processed/local-ai-setup-overview.pdf` | `9d24412a` | Ollama/MLX setup, SSH, Pi 5, M5 Ultra roadmap |
| Open Source AI Models Reference | `_processed/open-source-ai-models-spec.md` | `b8e4650b` | Model catalog by use case (351 lines) |
| Pipeline Analysis | `docs/PIPELINE_ANALYSIS.md` | — | Gap analysis with implementation roadmap |
| Future Features | `docs/FLEETING_FUTURE_FEATURES.md` | — | Feature roadmap: agents, automation, UI |
| Agent Looping Reference | X post | `203e9e4b` | Agent looping patterns for evaluation |

**Note:** The AI models reference and local AI setup docs are also relevant to the Network project for future infrastructure work beyond the pipeline.

---

## Session Log

### 2026-02-10 — Pipeline Overhaul + Master Checklist Creation

**Branch:** `feat/pipeline-automation-tier1`

**Completed:**
- Pipeline Ledger created with full historical data (38+ entries, 6 sessions)
- `/fleeting` skill updated: file scanning, `_processed/` workflow, ledger logging, PDF→MD conversion
- Skill backup created at `agents/fleeting-skill-copy.md`
- FleetingThoughts/ folder cleaned: all files moved to `_processed/`
- 5 source files tracked in Supabase with `routed_to` paths
- Duplicate spec files deleted from `docs/`
- All hub docs refreshed (AGENTS.md, CLAUDE.md, repo AGENTS.md)
- Automation inventory completed (reviewed 7 documents, all active Supabase items)
- This MASTER_CHECKLIST.md created
- Read and analyzed all 3 agent scripts for gaps and update needs

**Pipeline State:** 0 inbox, 1 processing, 10 routed, 26 done, 13 archived

### 2026-02-11 — Tier 1 Implementation + Graduation Workflow

**Branch:** `feat/pipeline-automation-tier1` (3 commits, pushed)

**Completed:**
- `pipeline-rules.ts` created — shared module with guardrails, constants, utilities
- `folder-watcher.ts` rewritten — hub file exclusion, PDF support, ledger logging
- `process-inbox.ts` rewritten — status validation, project matching, ledger logging
- Both scripts tested successfully (manual run)
- Compiled JS deployed to `~/bin/fleeting-watcher/` for launchd
- Bash fallback script also created at `~/bin/fleeting-watcher/folder-watcher.sh`
- launchd plist created with WatchPaths on FleetingThoughts folder
- Graduation workflow documented in `/fleeting` skill (checklist + feature doc + archive)
- Split-before-graduate rule added
- Feature doc folder convention established by project
- Thought `7f62bf93` (Apple Ecosystem 2026) split into 3 project-specific children
- All actions logged to Pipeline Ledger
- 10 different launchd approaches tried — all blocked by macOS TCC/iCloud permissions
- Full troubleshooting documented in this checklist for next agent

**Blocked:**
- launchd auto-trigger: macOS Full Disk Access needed for node to read iCloud from launchd context. User may have already added it — needs verification next session.

**Pipeline State:** 3 new split-children (routed), original marked done

### Next Session: SSH + Ollama Sprint (Tiers 1-3 Collapse)

**Insight:** SSH from Pi 5 → Mac via Tailscale runs scripts in a full user session with iCloud access. This bypasses the entire launchd/FDA permission problem AND sets up the infrastructure for Tiers 2-3 simultaneously.

**Proposed architecture:**
```
Pi 5 (cron every 5 min)                    Mac (via SSH over Tailscale)
├── Check: is Mac awake?                    ├── folder-watcher.ts (iCloud → Supabase)
│   └── WoL if needed                      ├── process-inbox.ts (keyword triage)
├── SSH into Mac ──────────────────────────→├── process-thoughts.ts (Ollama enrichment)
├── Lightweight triage (Ollama on Pi 5)     └── Ollama API at localhost:11434
├── Daily digest (7am, curl Supabase)
└── Telegram bot (capture → Supabase)
```

**What to implement (in order):**

1. **Ollama on Mac** (~10 min)
   - `brew install ollama && ollama serve`
   - `ollama pull llama3.2:3b` (fast classifier, ~2GB)
   - Verify: `curl http://localhost:11434/api/generate -d '{"model":"llama3.2:3b","prompt":"test"}'`

2. **Passwordless SSH: Pi 5 → Mac** (~15 min)
   - On Pi 5: `ssh-keygen` (if not already done)
   - Copy key: `ssh-copy-id dylanrussell@<mac-tailscale-ip>`
   - Enable Remote Login on Mac: System Settings → General → Sharing → Remote Login
   - Test: `ssh dylanrussell@<mac-tailscale-ip> "echo hello"`
   - Test with iCloud: `ssh dylanrussell@<mac-tailscale-ip> "ls ~/Library/Mobile\ Documents/com~apple~CloudDocs/Assets/Learning/Apps/FleetingThoughts/"`

3. **Convert `process-thoughts.ts`** (~45 min)
   - Replace Anthropic API calls with Ollama REST (`http://localhost:11434/api/generate`)
   - Remove SPEC.md generation (no-graduation rule)
   - Add pipeline-rules imports + ledger logging
   - Enrich `ai_analysis` field only
   - Test manually first

4. **Pi 5 cron script** (~15 min)
   - Create `~/scripts/fleeting-pipeline.sh` on Pi 5
   - SSH into Mac, run the three scripts in sequence:
     ```bash
     ssh mac "cd /path/to/unshackled-pursuit && npx ts-node agents/folder-watcher.ts && npx ts-node agents/process-inbox.ts && npx ts-node agents/process-thoughts.ts"
     ```
   - Add to crontab: `*/5 * * * * ~/scripts/fleeting-pipeline.sh >> /tmp/fleeting-pipeline.log 2>&1`

5. **Daily digest** (~20 min)
   - Bash script on Pi 5 that curls Supabase directly (no SSH needed)
   - Counts by status, lists new items since yesterday
   - Output to terminal or file (Telegram integration later)
   - Cron: `0 7 * * * ~/scripts/fleeting-digest.sh`

**Items this solves across tiers:**
| Checklist Item | Tier | How It's Solved |
|---------------|------|----------------|
| Schedule folder-watcher | T1 (blocked) | Pi 5 cron + SSH |
| Schedule process-inbox | T1 | Same cron chain |
| Install Ollama on Mac | T2 | brew install |
| Convert process-thoughts to local | T2 | Ollama REST API |
| Schedule enriched processing | T2 | Same cron chain |
| SSH from Pi 5 to Mac | T3 | Prerequisite for everything |
| Daily digest | T3 | Pi 5 cron + Supabase curl |

**Items NOT solved (still separate work):**
- Wake-on-LAN (needed if Mac sleeps — research if SSH over Tailscale auto-wakes)
- Ollama on Pi 5 (lightweight triage — nice-to-have, not blocking)
- Telegram bot (separate project, Pi 5 only)
- PDF-to-Markdown automation (can add to pipeline later)

**Pre-session research questions (run deep research agents in parallel):**
1. Does SSH over Tailscale wake a sleeping Mac, or do we need WoL first?
2. What's the best Ollama model for thought classification? (Llama 3.2 3B vs Phi-3 vs Qwen 2.5)
3. Can Ollama run as a launchd service on Mac so it's always available?
4. What's the Pi 5's Tailscale hostname? (check `tailscale status` on Pi 5)
5. Is Mac Remote Login already enabled?

---

*This checklist is version-controlled in the Unshackled Pursuit repo. Referenced from `FleetingThoughts/AGENTS.md`.*
