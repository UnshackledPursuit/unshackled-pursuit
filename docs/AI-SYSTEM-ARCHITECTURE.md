# Dylan's AI System Architecture — v3

> **Status:** Living document — single source of truth for the entire AI pipeline, agent system, and automation infrastructure.
> **Last revised:** 2026-02-18
> **Replaces:** All prior pipeline docs (Local AI Pipeline Complete, Macbook Pro Local AI Pipeline, Dylan AI Pipeline Architecture v1/v2)

### Implementation Status (Updated 2026-02-18)

> **READ THIS FIRST** — Several assumptions in this doc have changed since it was written:
>
> - **launchd folder watcher is WORKING.** The `com.fleeting.folder-watcher` launchd agent is loaded and auto-triggers on file drops into `FleetingThoughts/`. Full Disk Access for node was resolved. The SSH-from-Pi-5 workaround (Phase 1.3-1.6) is no longer the critical path for file ingestion.
> - **SSH is still valuable** for always-on processing when Mac is asleep, and for triggering Claude CLI remotely. It's an enhancement, not a blocker.
> - **No Ollama installed yet.** Phase 1.1 (install Ollama + pull models) is still the first build step.
> - **No Telegram bot yet.** Phase 3 is the highest-impact next step — unlocks capture from phone + processing notifications.
> - **process-inbox.ts has no scheduler.** Web/mobile captures land in Supabase but sit unprocessed until `/fleeting` is manually invoked. Adding a launchd timer (since FDA is resolved) or wiring into the Telegram bot would close this gap.
> - **Keyword matcher misroutes infrastructure docs.** Architecture docs mentioning multiple projects get routed to the most-mentioned project instead of Fleeting Thoughts. Known limitation — the graduated autonomy model addresses this.
> - **Recommended build order:** Ollama install → process-inbox on timer → Telegram bot → SSH/Pi 5 → trust scoring → agents
>
> **Pipeline Master Checklist:** `Websites/DKRHUB/unshackled-pursuit/docs/MASTER_CHECKLIST.md`
> **Pipeline Ledger:** `Websites/DKRHUB/unshackled-pursuit/docs/PIPELINE_LEDGER.md`

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [What Exists Today](#2-what-exists-today)
3. [Graduated Autonomy Model](#3-graduated-autonomy-model)
4. [Execution Tiers](#4-execution-tiers)
5. [Intent Detection Layer](#5-intent-detection-layer)
6. [Multi-Agent Architecture](#6-multi-agent-architecture)
7. [Intelligence Selection](#7-intelligence-selection)
8. [Data Architecture](#8-data-architecture)
9. [Learning Loop](#9-learning-loop)
10. [Capture Workflows](#10-capture-workflows)
11. [Ship It Pipeline](#11-ship-it-pipeline)
12. [Hardware & Network](#12-hardware--network)
13. [MCP Server Stack](#13-mcp-server-stack)
14. [Security Model](#14-security-model)
15. [Build Order](#15-build-order)
16. [Future: Mac Studio Migration](#16-future-mac-studio-migration)

---

## 1. System Overview

This system turns loose ideas, links, and thoughts into organized knowledge, actionable specs, and shipped products — with graduated AI autonomy that earns trust through demonstrated accuracy.

**Core philosophy:** The system earns the right to act independently. It starts by proposing and waiting for approval. As it proves reliable in specific categories, it gains permission to act and report. Trust climbs slowly through demonstrated accuracy and drops fast on any correction.

**What this is NOT:** A greenfield design. This builds on a working Fleeting Thoughts pipeline with real data, real routing decisions, and a proven track record in the Pipeline Ledger. Every new component connects to existing infrastructure.

### System Flow (High Level)

```
CAPTURE                    PROCESS                     OUTPUT
─────────                  ───────                     ──────
iPhone Share Sheet ──┐
Telegram Bot ────────┤     ┌─────────────┐
iCloud Folder ───────┼────▶│  Conductor   │────▶ Routed to project
Web Kanban UI ───────┤     │  (intent +   │────▶ Spec generated
Apple Shortcuts ─────┘     │   routing)   │────▶ App built & deployed
                           └──────┬──────┘────▶ Tool evaluated
                                  │           ────▶ Weekly research report
                                  ▼
                           ┌─────────────┐
                           │  Agents      │
                           │  Librarian   │
                           │  Architect   │
                           │  Builder     │
                           │  Scout       │
                           │  Researcher  │
                           └─────────────┘
```

---

## 2. What Exists Today

Everything below is built, working, and processing real data. New components connect to this — they don't replace it.

### Supabase (Source of Truth)

| Table | Purpose |
|-------|---------|
| `fleeting_thoughts` | Every captured idea, link, note. Fields: id, content, source, status, category, project_id, created_at, processed_at |
| `projects` | Active projects with context. Fields: id, name, description, status, tech_stack |

- Row-Level Security enabled
- Service key bypass for server-side scripts
- Web Kanban UI reads/writes at `unshackledpursuit.com/fleeting`

### Pipeline Scripts (Manual Execution)

| Script | Purpose |
|--------|---------|
| `folder-watcher.ts` | Scans `~/iCloud/FleetingThoughts/` for new files, ingests to Supabase |
| `process-inbox.ts` | Processes unrouted items from Supabase inbox |
| `process-thoughts.ts` | Runs classification and routing logic |
| `pipeline-rules.ts` | **Shared guardrails module** — enforces no-graduation rule, valid statuses, routing constraints |

All scripts run manually via Claude Code CLI today. Automation blocked by macOS launchd requiring Full Disk Access for iCloud paths. Solution: SSH from Pi 5 (see [Build Order](#15-build-order)).

### `/fleeting` Claude Code Skill

The existing manual processing interface. Claude Code reads Supabase, classifies items, proposes routing, waits for human confirmation, then executes. This IS the L1 (Propose) trust level already working.

### Pipeline Ledger

`docs/PIPELINE_LEDGER.md` — git-versioned markdown tracking every routing decision. Each entry records: what was classified, where it was routed, reasoning, timestamp. This is the training data for the learning loop. When corrections happen, the ledger captures what changed and why.

### `_processed/` Workflow

Source files in `FleetingThoughts/` move to `_processed/` subfolder after ingestion. Prevents double-processing. Simple and reliable.

### `/api/capture` Endpoint

External POST endpoint on `unshackledpursuit.com`. Accepts content from iOS Shortcuts, feedback forms, external integrations. Writes directly to Supabase `fleeting_thoughts` with status `inbox`.

### No-Graduation Rule

**The foundational safety constraint.** Automation can categorize, route, tag, and organize — but it can never:
- Mark a thought as `done` or `archived`
- Create specs or architecture docs autonomously
- Deploy anything without human confirmation
- Delete or permanently modify source data

This rule is encoded in `pipeline-rules.ts` and enforced at the code level, not just by convention.

---

## 3. Graduated Autonomy Model

The system earns trust through demonstrated accuracy, not assumptions. Trust is tracked per-category, per-project, per-tier.

### Trust Levels

| Level | Name | Behavior | Example |
|-------|------|----------|---------|
| L0 | Observe | Shadow mode. System classifies but doesn't act or propose. Logs decisions for later review. | New project added — system watches how human routes items to it for 2 weeks |
| L1 | Propose | System proposes action, waits for human confirmation. **This is the current `/fleeting` skill.** | "I'd classify this as `tool-evaluation` and route to WaypointHub. Proceed?" |
| L2 | Act & Report | System executes, then notifies human via Telegram. Human can reverse. | Telegram: "Routed 3 items: 2 → Spatialis (visionOS), 1 → Pipeline (infra). Review?" |
| L3 | Silent Auto | Routine operations only. No notification unless anomaly detected. Revocable. | File dedup, timestamp normalization, inbox ingestion from folder watcher |

### Trust Progression Rules

**Climbing (slow):**
- L0 → L1: Manual review shows system's shadow classifications were ≥90% accurate over 20+ items
- L1 → L2: 20+ consecutive correct classifications in a specific category with zero corrections
- L2 → L3: 50+ items processed at L2 with zero reversals in that category

**Falling (fast):**
- Any human correction at L2 → immediate demotion to L1 for that category
- 2 corrections within 7 days at L1 → demotion to L0 for review
- Any error at L3 → demotion to L2 with notification

**Key constraint:** Trust levels are granular. The system might be L3 for "route visionOS links to Spatialis" but L0 for "classify hardware purchase decisions." Trust is earned per-category, not globally.

---

## 4. Execution Tiers

Tiers define what the system CAN do. Trust levels define how much supervision it needs. The combination creates the autonomy boundary.

| Tier | Operations | Max Trust Level | Intelligence |
|------|-----------|----------------|-------------|
| **Tier 0: File Ops** | Move files, timestamps, dedup, inbox ingestion, log formatting | **L3** (can earn full auto) | Local rules or Qwen3-4B |
| **Tier 1: Classify & Route** | Categorize thoughts, assign projects, tag intents, detect duplicates | **L2** (act & report for proven categories) | Claude Code `/fleeting` skill |
| **Tier 2: Build** | Generate specs, create code, build features, produce artifacts | **L1 forever** (always human-confirms) | Claude Code CLI |
| **Tier 3: Deploy** | Push to production, modify live systems, update checklists | **L1 forever** (always human-confirms) | Claude Code CLI + MCPs |

**Why Tier 2-3 stay L1:** Building and deploying have consequences that can't be easily reversed. A misrouted thought costs 10 seconds to fix. A bad deploy costs hours. The asymmetry justifies permanent human oversight.

---

## 5. Intent Detection Layer

Dylan's inputs have varying intents that look similar on the surface. A URL with brief text could mean seven different things. The system must detect intent before routing to the right agent.

### Primary Intents

| Intent | Signal | What Happens | Agent |
|--------|--------|-------------|-------|
| **EVALUATE** | "Is this tool/approach worth adopting?" | Scout fetches, reads, assesses relevance to stack, adds to tools registry with recommendation | Scout |
| **RESEARCH** | "Read this and report back" | Web fetch, summarize, structured report returned | Scout / Researcher |
| **BOOKMARK** | "Remind me later" | Tag, park in Supabase, surface in weekly summary | Librarian |
| **VET** | Multiple similar ideas/tools to compare | Compare, consolidate, deduplicate across database | Librarian + Scout |
| **SPEC** | "Create spec from this idea" | Market research, feasibility, competitive landscape → SPEC.md | Architect |
| **BUILD** | "Build this now, report with live link" | Ship It pipeline (Tier 2-3, always L1) | Builder |
| **BUILD_FROM_SPEC** | "New spec in FleetingThoughts/, implement it" | Builder reads spec, executes phases | Builder |

### Multi-Intent Support

A single input can carry multiple intents. Example: "Check out this MCP server — if it's good, add it to WaypointHub" = EVALUATE (primary) + BUILD (secondary, contingent on eval result).

The Conductor tags primary + secondary intents and routes accordingly. Secondary intents queue behind primary completion.

### Quick Tags (Optional Capture Shortcut)

At capture time, user can optionally include a tag to skip classification:

| Tag | Maps To | Skips |
|-----|---------|-------|
| `/eval` | EVALUATE | Intent detection |
| `/read` | RESEARCH | Intent detection |
| `/spec` | SPEC | Intent detection |
| `/build` | BUILD | Intent detection |
| `/bookmark` | BOOKMARK | Intent detection |

Quick tags also create labeled training data — every tagged item is a ground-truth classification the learning loop can train against.

---

## 6. Multi-Agent Architecture

Specialized roles, not a monolithic processor. Each agent has a focused prompt, specific context, and clear boundaries. Agents are different Claude Code invocations with role-specific system prompts — not separate processes or services.

### The Conductor (Orchestrator)

**Role:** Receives all inputs, detects intent, routes to the right agent, tracks outcomes, manages trust levels, runs the heartbeat loop.

**Responsibilities:**
- Load context from Supabase (current inbox, project list, recent routing history)
- Detect intent using classification logic
- Check trust level for the detected category/project/tier combination
- Route to appropriate agent with full context injection
- Log decisions to Pipeline Ledger
- Track trust metrics in local SQLite
- Run on schedule via heartbeat loop (eventually autonomous for trusted categories)

**Trigger:** Pi 5 cron → SSH → Mac → Claude Code CLI with Conductor prompt.

### The Librarian (Fleeting Thoughts Processor)

**Role:** The current `/fleeting` skill, formalized. Categorizes, routes, deduplicates, maintains the Pipeline Ledger, files items to the correct project.

**Responsibilities:**
- Read unprocessed items from Supabase
- Classify by category and project
- Detect duplicates against existing items
- Update Supabase status and routing
- Append decisions to Pipeline Ledger
- Flag items that don't fit existing categories

**Key trait:** Knows the entire knowledge base. Has context on all projects, all categories, all historical routing patterns.

### The Architect (Idea → Spec)

**Role:** Takes a loose concept and produces a structured SPEC.md following Dylan's established iterative pattern.

**Process:**
1. Receive concept from Conductor
2. Research: market landscape, competitive apps, technical feasibility
3. Assess fit with Dylan's existing stack (visionOS, Swift, RealityKit, Supabase)
4. Generate SPEC.md with: problem statement, target user, feature scope, tech stack, milestones, risks
5. Surface spec for human review (always L1 — never auto-approved)

**Iterative pattern:** Rough spec → human feedback → refined spec → initial build → feedback → iteration. The Architect handles the first three stages. The Builder handles execution.

**Proactive capability:** Based on Researcher's ecosystem monitoring, the Architect can suggest improvements to existing apps. "visionOS 3.2 added volumetric window resizing — Spatialis could use this for canvas scaling. Want a spec?"

### The Builder (Execution)

**Role:** Claude Code in build mode. Reads SPEC.md, reads MASTER_CHECKLIST, builds the next phase, reports results.

**Responsibilities:**
- Parse spec into buildable phases
- Execute code generation following phase-gate progression
- Run builds via XcodeBuildMCP (visionOS) or standard toolchain (web)
- Report results with verification checkpoints
- For Ship It pipeline: build + deploy + return live URL

**Constraint:** Always L1. Never builds without human confirmation of the spec and approach.

### The Scout (Tool Evaluator)

**Role:** Processes links, tool references, and framework discoveries. Answers "is this interesting?" so Dylan doesn't have to read every article.

**Process:**
1. Receive URL or tool reference from Conductor
2. Fetch and read the content
3. Assess relevance to Dylan's active stack:
   - visionOS / Swift / RealityKit (Spatialis, WaypointHub)
   - Pipeline infrastructure (Supabase, Telegram, Claude Code)
   - Home automation (Home Assistant, Frigate, Pi 5)
   - Local AI (Ollama, Qwen, model serving)
4. Compare to existing tools in registry (is this better than what we have?)
5. Add to tools registry with recommendation: adopt / evaluate further / monitor / dismiss
6. Return concise assessment

### The Researcher (Ecosystem Monitor)

**Role:** Weekly systematic scan of everything relevant to Dylan's stack. Produces a scannable report — flags what changed, not what to do.

**Context source:** The Researcher reads `docs/PROJECT_MANIFEST.md` as its primary context file. This single doc contains every active project's tech stack, frameworks, planned versions, and research watch areas. One read = full picture of what matters. Without this, the Researcher would need to read 5+ scattered files to understand context, which is expensive and risks surfacing irrelevant findings.

**Key constraint: Relevance filtering.** The Researcher must NOT return a firehose of generic updates. Findings must cross-reference against the manifest's tech stacks and planned features. Output is capped at a concise at-a-glance format — roughly 3-5 actionable items per project, not exhaustive lists. As the project count grows, filtering becomes more important. The goal is "here's what matters for YOUR apps" not "here's everything that happened in the ecosystem."

**Weekly scan targets:**
- visionOS release notes and beta changes
- GitHub releases for installed MCP servers
- New MCP servers matching Dylan's tech stack
- Apple developer docs for framework updates
- Vision Pro App Store: competitive apps in Spatialis/WaypointHub categories
- Ollama model releases (new models, quantization improvements)
- Tools registry items flagged for re-evaluation

**Output format:** Weekly digest with three priority tiers:
- 🔴 **Action Required** — Breaking changes, security patches, deprecations
- 🟡 **Worth Knowing** — New capabilities, relevant releases, competitive moves
- 🟢 **Background** — Minor updates, ecosystem trends, FYI items

Plus tools registry updates: what was added, what status changed, what's due for re-evaluation.

**Feeds the Architect:** The Researcher's findings inform the Architect's proactive recommendations. Researcher finds → Architect assesses impact → Human decides.

### Future Agents (Not Yet Built)

| Agent | Role | When |
|-------|------|------|
| **Marketer** | App Store descriptions, positioning, social content, ASO | When apps need marketing push |
| **Media Producer** | Preview videos, demos, marketing assets, screenshots | When apps need visual marketing |

---

## 7. Intelligence Selection

Use the right tool, not the smartest tool. Don't waste frontier intelligence on tasks a local model handles fine. Don't trust local models with tasks needing judgment.

| Task Type | Model | Why |
|-----------|-------|-----|
| File operations, dedup, timestamps | Local rules (no model) | Deterministic, no intelligence needed |
| Keyword matching, basic categorization | Qwen3-4B via Ollama | Fast, free, accurate enough for simple patterns |
| Nuanced classification, project context, overlap detection | Claude Code `/fleeting` skill | Needs full context window + judgment |
| Code generation, architecture, complex builds | Claude Code CLI | Frontier intelligence required |
| Quick drafts, formatting, summaries | Qwen3-8B via Ollama | Good enough, instant, free |
| Creative strategy, brainstorming, novel problems | Claude conversation or Gemini | Frontier reasoning + creativity |
| Image generation | Gemini API | Best free option for quality |

### Local Model Role: Orchestration Trigger, Not Classifier

Critical design decision: the local 4B model does NOT do classification (that's a capability downgrade from Claude). Its role is pure scheduling:

1. Pi 5 cron fires every N minutes
2. Simple API call checks Supabase for new inbox items
3. If new items exist → SSH into Mac → trigger Claude Code CLI with `/fleeting` skill
4. Claude Code does the actual processing with full frontier intelligence

The graduated autonomy question then becomes simple: does Claude Code run with `--auto-confirm` or post proposals to Telegram and wait for approval? Much cleaner trust decision — Dylan already knows Claude Code quality from manual sessions.

---

## 8. Data Architecture

### Supabase (Pipeline Data — Source of Truth)

What the web Kanban UI and processing scripts read/write. Clean, focused, UI-facing.

```
fleeting_thoughts
├── id (uuid)
├── content (text)
├── source (text) — "icloud", "telegram", "api", "web"
├── status (text) — "inbox", "routed", "in_progress", "done"
├── category (text)
├── project_id (uuid, FK → projects)
├── intent (text) — "evaluate", "research", "bookmark", "vet", "spec", "build"
├── tags (text[])
├── created_at (timestamptz)
└── processed_at (timestamptz)

projects
├── id (uuid)
├── name (text)
├── description (text)
├── status (text)
└── tech_stack (text[])
```

### Local SQLite (Orchestrator Metadata — Private Workspace)

Things never wanted in Supabase: trust metrics, tool evaluations, execution traces, system health.

```sql
-- Trust levels per category per project per tier
CREATE TABLE trust_levels (
    id INTEGER PRIMARY KEY,
    category TEXT NOT NULL,
    project_id TEXT,
    tier INTEGER NOT NULL,
    trust_level INTEGER DEFAULT 0,
    correct_streak INTEGER DEFAULT 0,
    total_processed INTEGER DEFAULT 0,
    total_corrections INTEGER DEFAULT 0,
    last_correction_at TEXT,
    last_promoted_at TEXT,
    last_demoted_at TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tools registry
CREATE TABLE tools_registry (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,        -- "mcp", "framework", "tool", "library", "approach"
    url TEXT,
    discovered_at TEXT DEFAULT CURRENT_TIMESTAMP,
    source TEXT,               -- "twitter", "hackernews", "researcher_scan", "manual"
    relevant_projects TEXT,    -- JSON array of project names
    status TEXT DEFAULT 'new', -- "new", "evaluating", "adopted", "dismissed", "monitoring"
    evaluation_notes TEXT,
    next_review_at TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- MCP server health tracking
CREATE TABLE mcp_registry (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    install_command TEXT,
    scope TEXT,                -- "user", "project"
    installed_version TEXT,
    latest_version TEXT,
    health_status TEXT DEFAULT 'unknown',
    last_health_check TEXT,
    last_version_check TEXT,
    project_scope TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Session execution logs
CREATE TABLE session_logs (
    id INTEGER PRIMARY KEY,
    session_type TEXT NOT NULL,   -- "heartbeat", "manual", "build", "research"
    agent TEXT NOT NULL,          -- "conductor", "librarian", "architect", etc.
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    items_processed INTEGER DEFAULT 0,
    items_auto_handled INTEGER DEFAULT 0,
    items_flagged INTEGER DEFAULT 0,
    corrections INTEGER DEFAULT 0,
    notes TEXT
);

-- Trust change audit trail
CREATE TABLE trust_changes (
    id INTEGER PRIMARY KEY,
    trust_level_id INTEGER REFERENCES trust_levels(id),
    old_level INTEGER,
    new_level INTEGER,
    reason TEXT NOT NULL,
    changed_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Separation principle:** Supabase answers "what's in the pipeline right now." Local SQLite answers "how well is the system performing and what should change."

---

## 9. Learning Loop

Builds on the existing Pipeline Ledger. The ledger is already a git-versioned record of every routing decision. New additions formalize the feedback cycle.

### Correction Tracking

When a human changes a classification or reassigns a project, the ledger entry includes:

```markdown
### 2026-02-18 — Correction

**Item:** "SwiftUI animation library for visionOS"
**Original:** Routed to Pipeline (category: tool)
**Corrected to:** Routed to Spatialis (category: visionOS-framework)
**Reason:** Animation/UI libraries should route to the app that uses them, not to infrastructure
**Learning:** Route UI frameworks by consuming app, not by type
```

### Trust Level Adjustments

Logged to local SQLite `trust_changes` table with reason for every promotion or demotion. Human-reviewable at any time.

### Weekly Pattern Analysis

The Conductor runs weekly analysis covering:
- Classification accuracy by project over trailing 30 days
- Common correction patterns (what does the system consistently get wrong?)
- Items sitting in `routed` status for 30+ days (stale — needs review or archival)
- Task type distribution (are we capturing more ideas than we can process?)
- Trust level changes (which categories are maturing, which are struggling?)

### Prompt Refinement Cycle

1. Learning loop surfaces evidence from corrections: "3 of last 10 corrections involved misrouting animation tools"
2. System proposes prompt refinement: "Add routing rule: UI/animation frameworks → route to app project, not infra"
3. Human reviews and approves/rejects
4. If approved, Claude Code implements the change
5. Ledger records the refinement and its source evidence

### Self-Improvement Reviews (Monthly)

In periodic review sessions, Claude Code analyzes the full learning DB, ledger, task patterns, and tools registry. Recommendations might include:
- Revised classification prompts addressing known failure modes
- Dedicated lightweight scripts for repetitive patterns
- New MCP servers that would eliminate manual steps
- Offload opportunities: tasks currently using Claude that could use local model or rules
- Architecture improvements based on usage patterns

Human reviews recommendations, approves what makes sense, Claude implements changes. The system literally builds what reduces how much it's needed for routine work — staying in the loop as quality controller and improvement engine while dedicated scripts handle volume.

---

## 10. Capture Workflows

Multiple entry points, all converging on Supabase `fleeting_thoughts` with status `inbox`.

### 1. iOS Share Sheet → `/api/capture`

Build iOS Shortcut called "Fleeting" that takes share sheet input (URL, text, image), POSTs to existing API endpoint. One tap from any app's share sheet. 10-minute setup.

```
Share Sheet → Shortcut "Fleeting" → POST /api/capture → Supabase inbox
```

### 2. iOS Share Sheet + Quick Tag

Shortcut with menu: Capture / Evaluate / Build / Spec / Bookmark. Pick one, paste/share, hits API with tag included. Labeled data from day one.

```
Share Sheet → Shortcut Menu → POST /api/capture?tag=eval → Supabase inbox (pre-tagged)
```

### 3. Telegram Bot

Forward any link or type any thought. Primary capture interface once bot exists.

| Command | Action |
|---------|--------|
| `/thought <text>` | Capture to inbox |
| `/eval <url>` | Capture with EVALUATE intent |
| `/build <description>` | Trigger Ship It pipeline |
| `/spec <concept>` | Route to Architect |
| `/status` | Current inbox count + recent processing summary |
| `/projects` | List active projects with item counts |
| `/review` | Show items awaiting human confirmation |
| `/trust` | Show current trust levels by category |
| `/discoveries` | Recent tools registry additions |

**Security:** Bot hard-locked to Dylan's Telegram user ID. Rejects all other senders.

### 4. iCloud Folder Drop

Existing workflow. Drop files into `~/iCloud/FleetingThoughts/`. Folder watcher ingests to Supabase, moves originals to `_processed/`.

### 5. Web Kanban UI

Existing. Manual capture and management at `unshackledpursuit.com/fleeting`.

---

## 11. Ship It Pipeline

Separate from the Fleeting Thoughts pipeline (which captures and organizes). Ship It builds and deploys.

### Flow

```
iPhone (Telegram /build) → Conductor classifies as BUILD (Tier 2, always L1)
    → Conductor proposes approach:
      "I'd build this as a Next.js landing page, dark theme, deploy to Vercel. Proceed?"
    → Human confirms via Telegram
    → Router structures brief
    → Claude Code CLI builds the project
    → Vercel CLI deploys
    → Live URL returned
    → Telegram reply: "Shipped → https://your-app.vercel.app"
```

### Constraints

- **Always L1.** Every build requires human confirmation before execution.
- **Tier 2-3 operations.** Human initiates, system executes, human verifies.
- **Data stored locally.** Build artifacts in `~/pipeline/builds/`, deployment records in local SQLite. Not in Supabase.

### Builder Capabilities

| Target | Stack | Deploy |
|--------|-------|--------|
| Landing page | Next.js + Tailwind | Vercel |
| Web app | Next.js + Supabase | Vercel |
| API endpoint | Next.js API routes or Edge Functions | Vercel or Supabase |
| visionOS feature | Swift + RealityKit | XcodeBuildMCP → device |
| Prototype | React/HTML | Vercel preview |

---

## 12. Hardware & Network

### Devices

| Device | Role | Key Software |
|--------|------|-------------|
| **MacBook Pro M1 Max 32GB** | Primary dev. Claude Code CLI, Ollama, Xcode, iCloud, all builds. | macOS, Xcode, Ollama, Claude Code, Node.js, Tailscale |
| **Raspberry Pi 5 8GB** | Always-on coordinator. Triggers processing, runs infrastructure. | Tailscale, SSH, Home Assistant, Pi-hole, Frigate NVR, cron |
| **iPhone 15 Pro Max** | Primary capture device. | Telegram, iOS Shortcuts, Safari share sheet, web Kanban |
| **Apple Vision Pro** | Target platform for Spatialis and WaypointHub. | visionOS apps, TestFlight |
| **iPad Pro** | Secondary dev/review surface. | Xcode Playgrounds, TestFlight, web Kanban |

### Network Topology

```
┌──────────────┐     Tailscale WireGuard      ┌──────────────┐
│  MacBook Pro  │◄────────────────────────────►│  Raspberry    │
│  M1 Max       │     SSH (key-based auth)     │  Pi 5         │
│               │                              │               │
│  • Claude Code│     Ollama API (Tailscale)   │  • Cron jobs  │
│  • Ollama     │◄────────────────────────────►│  • Pi-hole    │
│  • Xcode      │                              │  • Home Asst  │
│  • iCloud     │                              │  • Frigate    │
└──────┬───────┘                              └──────────────┘
       │
       │  Tailscale
       ▼
┌──────────────┐
│  iPhone       │
│  15 Pro Max   │
│               │
│  • Telegram   │
│  • Shortcuts  │
│  • Web Kanban │
└──────────────┘
```

All inter-device communication over Tailscale mesh VPN. No ports exposed to public internet.

---

## 13. MCP Server Stack

### Tier 1 — Install Immediately

| # | Server | What It Unlocks |
|---|--------|----------------|
| 1 | **Filesystem** | Read/write iCloud markdown, dev projects, pipeline directory |
| 2 | **GitHub** | Issues, PRs, commits, branches, code search across all repos |
| 3 | **XcodeBuildMCP** | 59 tools: build, test, run, deploy visionOS apps from CLI |
| 4 | **Home Assistant** | Full HA control from Claude Code sessions |

### Tier 2 — High Value

| # | Server | Purpose |
|---|--------|---------|
| 5 | **Apple Shortcuts** | Trigger macOS shortcuts from Claude Code |
| 6 | **Blender** | AI-assisted 3D modeling, USDZ export for visionOS |
| 7 | **Sequential Thinking** | Structured multi-step reasoning scratchpad |
| 8 | **Memory** | Local knowledge graph, persistent across sessions |
| 9 | **Excalidraw** | Architecture diagrams, wireframes, data flows |

### Tier 3 — Future

| # | Server | Purpose |
|---|--------|---------|
| 10 | **Vercel** | Deployment management for Ship It pipeline |
| 11 | **Supabase** | Direct database queries from Claude Code |
| 12 | **Playwright** | Browser automation and E2E testing |
| 13 | **Context7** | Up-to-date library docs for fast-evolving frameworks |

Install commands and detailed setup are in the separate **Claude Code CLI MCP Buildout** guide.

---

## 14. Security Model

### Network & Access

- All inter-device communication via Tailscale WireGuard encryption
- Ollama API bound to Tailscale interface only (not `0.0.0.0`)
- SSH key-based auth between Pi 5 and Mac (password auth disabled)
- Telegram bot hard-locked to single user ID
- Bot token stored in env var or macOS Keychain (never in git)

### Data Boundaries

- Fleeting thoughts processed by local model never leave the machine
- Health/personal data stays local (never sent to cloud APIs)
- Build briefs sent to Claude Code go to Anthropic servers (acceptable)
- Supabase RLS + service key access control for pipeline data

### Automation Safety

- **No-graduation rule** enforced in `pipeline-rules.ts` at the code level
- Tier 2-3 operations always require human confirmation (L1 forever)
- Trust revocation is automatic on any correction (fast demotion)
- Full audit trail via Pipeline Ledger (git-versioned, human-readable)
- MCP tokens stored in env vars, never committed to git
- Local SQLite stores trust/metrics — not exposed via any API

---

## 15. Build Order

Sequential phases. Each produces working, testable results before the next begins.

### Phase 1: Unblock Automation (SSH + Ollama)

**Goal:** Get the existing pipeline running on a schedule instead of manually.

| Step | Task | Time |
|------|------|------|
| 1.1 | Install Ollama on Mac, pull Qwen3-4B + 8B | 15 min |
| 1.2 | Configure Ollama to bind to Tailscale interface | 5 min |
| 1.3 | Set up passwordless SSH from Pi 5 → Mac (key-based) | 15 min |
| 1.4 | Test: Pi 5 SSH into Mac, run `ollama list` | 5 min |
| 1.5 | Convert `process-thoughts.ts` to use Ollama REST for Tier 0 ops | 1 hr |
| 1.6 | Create Pi 5 cron script: check Supabase → SSH → trigger processing | 1 hr |
| 1.7 | Test end-to-end: drop file in iCloud → processed automatically | 15 min |
| 1.8 | Set up daily digest (Telegram or email summary) | 30 min |

**Verification:** Drop a file in FleetingThoughts/. Within 5 minutes, it appears in Supabase, gets classified, and moves to `_processed/`.

### Phase 2: MCP Install

**Goal:** Give Claude Code access to filesystem, GitHub, Xcode, and Home Assistant.

| Step | Task | Time |
|------|------|------|
| 2.1 | Install Tier 1 MCPs (4 servers) | 15 min |
| 2.2 | Verify with `claude mcp list` and `/mcp` in session | 5 min |
| 2.3 | Test each server with a real operation | 15 min |

**Verification:** Claude Code session shows all 4 servers connected and functional.

### Phase 3: Telegram Bot

**Goal:** Capture from phone + receive processing notifications.

| Step | Task | Time |
|------|------|------|
| 3.1 | Create Telegram bot via BotFather | 5 min |
| 3.2 | Build bot server (Python, `python-telegram-bot`) | 1 hr |
| 3.3 | Implement core commands: `/thought`, `/status`, `/projects`, `/review` | 30 min |
| 3.4 | Add user ID lock + token security | 15 min |
| 3.5 | Deploy bot on Mac (launchd or screen session) | 15 min |
| 3.6 | Test from iPhone | 10 min |

**Verification:** Send `/thought Check out new RealityKit API` from iPhone. Appears in Supabase inbox within seconds.

### Phase 4: Orchestrator Core

**Goal:** Conductor that routes inputs to the right agent with trust awareness.

| Step | Task | Time |
|------|------|------|
| 4.1 | Create `~/pipeline/` directory structure | 5 min |
| 4.2 | Build Conductor: context loading, intent detection, agent routing | 1.5 hr |
| 4.3 | Build trust manager: SQLite schema, threshold logic, promotion/demotion | 30 min |
| 4.4 | Connect to Telegram for proposals and approvals | 30 min |
| 4.5 | Connect to heartbeat: Pi 5 cron triggers Conductor on schedule | 15 min |
| 4.6 | Test full loop | 15 min |

**Verification:** Telegram capture → intent detection → agent routing → human approval → Supabase update → Telegram confirmation.

### Phase 5: Ship It Pipeline

**Goal:** Build and deploy from a Telegram command.

| Step | Task | Time |
|------|------|------|
| 5.1 | Build Builder wrapper: Claude Code CLI invocation with context | 45 min |
| 5.2 | Build Deployer wrapper: Vercel CLI with URL capture | 30 min |
| 5.3 | Wire into Conductor: `/build` → propose → confirm → build → deploy → reply | 30 min |
| 5.4 | End-to-end test | 15 min |

**Verification:** `/build` from Telegram → confirmation → approved → built → deployed → live URL in Telegram.

### Phase 6: Learning Loop + Discovery

**Goal:** System improves itself based on accumulated evidence.

| Step | Task | Time |
|------|------|------|
| 6.1 | Add correction tracking to Pipeline Ledger format | 15 min |
| 6.2 | Build weekly analysis script | 45 min |
| 6.3 | Build tools registry + Scout agent prompt | 30 min |
| 6.4 | Build Researcher agent: weekly ecosystem scan + report | 30 min |
| 6.5 | Wire weekly digest combining all reports | 15 min |
| 6.6 | First monthly self-improvement review | 30 min |

**Verification:** Weekly digest arrives via Telegram with accuracy stats, trust summary, ecosystem updates, and tools registry changes.

---

## 16. Future: Mac Studio Migration

When Mac Studio M5 (or equivalent) is acquired, the architecture adapts without redesign:

| Component | Current (MacBook Pro) | Future (Mac Studio) |
|-----------|----------------------|-------------------|
| Ollama + models | MacBook (limited by 32GB) | Studio (70B+ models) |
| Telegram bot + orchestrator | MacBook (sleeps, lid-closed issues) | Studio (always-on, dedicated) |
| Samba file sharing | Pi 5 (SD card speed) | Studio (NVMe speed) |
| Blender + 3D MCP | Not practical (GPU constraints) | Studio (MCP-driven 3D at scale) |
| Claude Code CLI | MacBook | Both (MacBook portable, Studio always-on) |

**What stays:** Pi 5 continues infrastructure (Pi-hole, HA, Frigate). MacBook returns to portable dev. Architecture unchanged — model capability improves, everything else is the same.

---

## Appendix A: Key File Paths

| What | Path |
|------|------|
| This document | `~/pipeline/ARCHITECTURE.md` |
| Master checklist | `~/iCloud/.../FleetingThoughts/MASTER_CHECKLIST.md` |
| Agent context | `~/iCloud/.../FleetingThoughts/AGENTS.md` |
| Pipeline ledger | `~/unshackled-pursuit/docs/PIPELINE_LEDGER.md` |
| Pipeline analysis | `~/unshackled-pursuit/docs/PIPELINE_ANALYSIS.md` |
| Future features | `~/unshackled-pursuit/docs/FLEETING_FUTURE_FEATURES.md` |
| Repo context | `~/unshackled-pursuit/CLAUDE.md` |
| Processing scripts | `~/unshackled-pursuit/agents/` |
| Guardrails module | `~/unshackled-pursuit/agents/pipeline-rules.ts` |
| Orchestrator (new) | `~/pipeline/` |
| Local SQLite (new) | `~/pipeline/data/orchestrator.db` |
| Build artifacts (new) | `~/pipeline/builds/` |

## Appendix B: Intent Detection Examples

| Input | Primary Intent | Secondary | Agent |
|-------|---------------|-----------|-------|
| "https://github.com/some/mcp-server" | EVALUATE | — | Scout |
| "Check this MCP — add to WaypointHub if good" | EVALUATE | BUILD | Scout → Builder |
| "New idea: spatial meditation app with binaural audio" | SPEC | — | Architect |
| "Remind me to check visionOS 3.2 release notes" | BOOKMARK | — | Librarian |
| "Build a landing page for Spatialis" | BUILD | — | Builder |
| "Compare these 3 hand tracking libraries" | VET | — | Librarian + Scout |
| "Read this Apple blog post about Entity Components" | RESEARCH | — | Scout |
| "New spec in FleetingThoughts/spatial-audio-spec.md" | BUILD_FROM_SPEC | — | Builder |
