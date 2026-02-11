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

| Script | Location | What It Does | Issues |
|--------|----------|-------------|--------|
| `folder-watcher.ts` | `agents/` | Ingests .md files from iCloud folder → Supabase | Only handles .md (not PDF), would process CLAUDE.md/AGENTS.md, outdated project aliases, no ledger logging |
| `process-inbox.ts` | `agents/` | Keyword-based categorization of inbox items | No ledger logging, no dotenv import, no _processed/ awareness |
| `process-thoughts.ts` | `agents/` | AI analysis + SPEC.md generation | Uses Anthropic API (costs $), creates project folders (violates no-graduation rule), no ledger logging |

### What Doesn't Exist Yet

- No automated processing (thoughts sit in inbox until `/fleeting` runs)
- No local AI models installed (Ollama, MLX)
- No Telegram bot
- No SSH remote execution pipeline
- No Wake-on-LAN
- No daily digest
- No shared pipeline-rules module for script consistency

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

- [ ] **Create shared `pipeline-rules.ts` module**
  - Ledger append function (writes to `docs/PIPELINE_LEDGER.md`)
  - Hub file exclusion list (`CLAUDE.md`, `AGENTS.md`)
  - Project ID constants matching Supabase
  - `_processed/` move function
  - Status transition validation
  - No-graduation guardrail

- [ ] **Fix and update `folder-watcher.ts`**
  - Add PDF file support (not just .md)
  - Exclude hub files (CLAUDE.md, AGENTS.md)
  - Replace hardcoded project aliases with Supabase project IDs
  - Import shared pipeline-rules module
  - Add ledger logging for every ingestion
  - Fix file naming in `_processed/` (clean names, not timestamp prefix)
  - Add dotenv loading for .env.local

- [ ] **Fix and update `process-inbox.ts`**
  - Import shared pipeline-rules module
  - Add ledger logging for every categorization
  - Add dotenv loading for .env.local
  - Update project matching to use Supabase project IDs
  - Ensure no-graduation guardrail (already doesn't graduate, but make explicit)

- [ ] **Schedule `folder-watcher.ts` via launchd**
  - Create `com.fleeting.folder-watcher.plist` in `~/Library/LaunchAgents/`
  - WatchPaths on FleetingThoughts/ folder
  - Triggers on new file detection
  - Logs output for debugging

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

**In Progress:**
- Tier 1 automation implementation (this session)

**Pipeline State:** 0 inbox, 1 processing, 10 routed, 26 done, 13 archived

---

*This checklist is version-controlled in the Unshackled Pursuit repo. Referenced from `FleetingThoughts/AGENTS.md`.*
