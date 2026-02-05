# Autonomous Development Infrastructure

A complete system for frictionless idea capture, automated project management, and remote development execution.

**Created:** February 4, 2026  
**Status:** Specification / Implementation Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Cost Model](#cost-model)
3. [Device Architecture](#device-architecture)
4. [Fleeting Thoughts Pipeline](#fleeting-thoughts-pipeline)
5. [Risk Tier System](#risk-tier-system)
6. [Automation Components](#automation-components)
7. [Remote Trigger System](#remote-trigger-system)
8. [Execution Logging](#execution-logging)
9. [Project Templates](#project-templates)
10. [Implementation Phases](#implementation-phases)
11. [Current State & Backlog](#current-state--backlog)

---

## Overview

### Vision

> Mention an idea → Application built → Website created → Marketing documents generated → Ready for App Store review

The system enables:

- **Frictionless capture** — 1-tap from phone, zero decisions at capture time
- **Automated triage** — Local AI classifies and routes content
- **Remote development** — Trigger builds from anywhere via Telegram
- **Safe automation** — Risk-tiered execution with approval gates
- **Full logging** — Every action documented with rollback capability

### Core Principle

**Friction = Death.** If it's not effortless, it won't get used.

---

## Cost Model

| Component | Cost | Notes |
|-----------|------|-------|
| Ollama on Pi 5 | Free | Local inference, your hardware |
| MLX on MacBook | Free | Local inference, Apple Silicon optimized |
| Claude Code CLI | Included in Max plan | No per-token API cost |
| Claude API (direct calls) | Pay per token | Only if calling API separately |
| Supabase | Free tier | 500MB database, 1GB storage |
| Tailscale | Free | Personal use, up to 100 devices |
| GitHub | Free | Public repos (Pro for private) |
| TestFlight | Free | Part of Apple Developer account |
| Telegram Bot | Free | No cost, instant setup |

**Key insight:** SSH → Claude Code CLI has no variable AI costs. Local models handle triage, Claude Code handles heavy lifting under Max subscription.

---

## Device Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVICE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Pi 5 (COORDINATOR)                    │   │
│  │                    Always On · Low Power                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  Services:                                               │   │
│  │  • Telegram Bot (command intake)                        │   │
│  │  • File Watcher (inbox monitoring)                      │   │
│  │  • Ollama (triage AI - llama3.2:3b)                     │   │
│  │  • Task Queue (SQLite)                                  │   │
│  │  • Cron Scheduler                                        │   │
│  │  • Wake-on-LAN sender                                   │   │
│  │  • Home Assistant integration                           │   │
│  │  • Pi-hole (already running)                            │   │
│  │  • Frigate NVR (already running)                        │   │
│  │                                                          │   │
│  │  Responsibilities:                                       │   │
│  │  • Receive all incoming requests                        │   │
│  │  • Triage and classify with local AI                    │   │
│  │  • Queue tasks for Mac                                  │   │
│  │  • Wake Mac when needed                                 │   │
│  │  • Monitor task completion                              │   │
│  │  • Send notifications                                   │   │
│  │  • Generate daily digests                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │ Tailscale (secure mesh)          │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               MacBook Pro M1 Max (EXECUTOR)              │   │
│  │                    Heavy Compute · On-Demand             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  Services:                                               │   │
│  │  • Claude Code CLI                                      │   │
│  │  • MLX (local AI - 8B-22B models)                       │   │
│  │  • Xcode CLI tools                                      │   │
│  │  • Git                                                   │   │
│  │  • fastlane (deployment automation)                     │   │
│  │                                                          │   │
│  │  Responsibilities:                                       │   │
│  │  • Execute development tasks                            │   │
│  │  • Run Claude Code sessions                             │   │
│  │  • Build Xcode projects                                 │   │
│  │  • Run tests                                             │   │
│  │  • Deploy to TestFlight                                 │   │
│  │  • Report results back to Pi 5                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  iPhone (INTERFACE)                      │   │
│  │                    Command & Review                      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  Apps:                                                   │   │
│  │  • Telegram (primary command interface)                 │   │
│  │  • Shortcuts (1-tap capture, existing setup)            │   │
│  │  • TestFlight (build review)                            │   │
│  │  • GitHub (PR review)                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why Telegram?

1. **Free bot API** — no cost, no approval process, create via @BotFather in 30 seconds
2. **Always available** — works on phone, tablet, desktop, web
3. **Push notifications** — instant alerts when system reports back
4. **Rich formatting** — markdown, buttons, inline keyboards for approve/reject
5. **File sharing** — bot can send logs, screenshots, diffs
6. **No infrastructure** — Telegram handles messaging server, you just run a listener

---

## Fleeting Thoughts Pipeline

### Current State

- **Two Apple Shortcuts** exist (1-tap via action button)
- **Currently dump to Notes** → dead end
- **Capture friction is solved** → routing/processing is not
- **Spec file exists:** `/Apps/Construct/Fleeting Thoughts/FLEETING_THOUGHTS.md`
- **Supabase schema designed** but not created
- **Dashboard concept** planned but not built

### Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  FLEETING THOUGHTS PIPELINE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAPTURE (iPhone)                                               │
│  ───────────────                                                │
│  • Existing Shortcuts (voice/text) → redirect to Supabase      │
│  • Share extension (screenshots, PDFs, links) → future         │
│  • Zero decisions at capture time                               │
│                                                                  │
│           │                                                      │
│           ▼                                                      │
│                                                                  │
│  STORE (Supabase)                                               │
│  ────────────────                                               │
│  • Central repository for all captures                         │
│  • Metadata: source, timestamp, content_type                   │
│  • Raw file storage for images/PDFs                            │
│                                                                  │
│           │                                                      │
│           ▼                                                      │
│                                                                  │
│  TRIAGE (Pi 5 - Ollama)                                         │
│  ──────────────────────                                         │
│  • Classify: idea / task / reference / project-related         │
│  • Extract: action items, key concepts, entities               │
│  • Tag: relevant projects, priority level                      │
│  • Route: determine destination                                 │
│                                                                  │
│           │                                                      │
│           ▼                                                      │
│                                                                  │
│  ROUTE (Automated)                                              │
│  ─────────────────                                              │
│  • Project-related → project inbox                             │
│  • Task → Reminders or task queue                              │
│  • Reference → vault/archive                                   │
│  • New project seed → incubator                                │
│  • Connected ideas → link together                             │
│                                                                  │
│           │                                                      │
│           ▼                                                      │
│                                                                  │
│  DIGEST (Daily @ 7am)                                           │
│  ────────────────────                                           │
│  • Summary of yesterday's captures                             │
│  • Pending actions requiring attention                         │
│  • Pattern insights (ideas that connect)                       │
│  • Sent via Telegram                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Supabase Schema

```sql
-- Fleeting thoughts capture table
create table fleeting_thoughts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  content_type text, -- 'text', 'voice', 'image', 'pdf', 'link'
  source text, -- 'shortcut', 'share_extension', 'telegram', 'manual'
  captured_at timestamptz default now(),
  
  -- Processing status
  processed boolean default false,
  processed_at timestamptz,
  
  -- AI analysis
  classification text, -- 'idea', 'task', 'reference', 'project_related'
  routed_to text, -- project name or destination
  priority text, -- 'high', 'medium', 'low', 'someday'
  tags text[],
  related_thoughts uuid[],
  ai_analysis text, -- AI notes/summary
  
  -- File storage
  raw_file_url text -- for images/PDFs in Supabase storage
);

-- Index for unprocessed items (daily digest query)
create index idx_fleeting_unprocessed on fleeting_thoughts(processed, captured_at) 
where processed = false;

-- Index for project routing
create index idx_fleeting_routed on fleeting_thoughts(routed_to) 
where routed_to is not null;
```

### Apple Shortcut Update

Current shortcuts dump to Notes. Update to POST to Supabase:

```
Shortcut: "Fleeting Thought"
────────────────────────────
1. Dictate Text (or Get Clipboard)
2. Get Current Date (ISO format)
3. URL: https://[project].supabase.co/rest/v1/fleeting_thoughts
4. Method: POST
5. Headers:
   - apikey: [anon key]
   - Authorization: Bearer [anon key]
   - Content-Type: application/json
6. Body: {
     "content": [Dictated Text],
     "content_type": "voice",
     "source": "shortcut"
   }
7. Show Notification: "Thought captured ✓"
```

---

## Risk Tier System

### Tier Definitions

| Tier | Name | Action | Examples |
|------|------|--------|----------|
| **1** | Auto-Execute | Execute immediately, log, notify on complete | Static website updates, docs, README, marketing copy |
| **2** | Auto + Review Window | Execute, create PR, wait 30 min, auto-merge if no objection | New feature branches, additive code, tests, minor deps |
| **3** | Review Required | Create branch/PR, send diff summary, WAIT for approval | Modifications to working code, DB schema, API changes |
| **4** | Manual Only | Prepare everything, send checklist, human executes | App Store deploys, main branch merges, infra changes |

### Project Risk Configuration

```yaml
# /automation/config/project-risk-levels.yaml

projects:
  unshackled-pursuit-photography:
    tier_default: 1
    repo: "github.com/dylan/unshackled-pursuit"
    type: static-website
    deployment: vercel
    notes: "Low risk, can auto-deploy"

  personal-website:
    tier_default: 1
    repo: "github.com/dylan/personal-site"
    type: nextjs
    deployment: vercel

  waypoint:
    tier_default: 3
    repo: "github.com/dylan/waypoint"
    type: visionos-app
    deployment: testflight
    notes: "Production app, careful with changes"
    exceptions:
      - path: "docs/*"
        tier: 1
      - path: "marketing/*"
        tier: 1
      - type: "new-feature-branch"
        tier: 2

  spatialis:
    tier_default: 2
    repo: "github.com/dylan/spatialis"
    type: visionos-app
    deployment: testflight
    notes: "In development, more freedom"
    exceptions:
      - path: "Sources/Core/*"
        tier: 3
```

### Example: Waypoint iPad Integration

Request: "Add iPad support to Waypoint"

**Classification:**
- Project: waypoint
- Action: new-feature
- Scope: additive (new platform target, new views)
- Touches existing: minimal (shared models only)
- **Risk tier: 2** (auto-execute with review window)

**Execution plan:**
1. Create feature branch `feature/ipad-support`
2. Add iPad target to Xcode project
3. Create iPad-specific views in `Sources/iPad/`
4. Create shared protocol for cross-platform
5. Add iPad UI tests
6. Run existing visionOS tests (must all pass)
7. Create PR with diff summary
8. Send to Telegram for review
9. Wait for `/approve` or `/reject`

**Safety guarantees:**
- visionOS target unchanged except protocol conformance
- All new iPad code in separate `Sources/iPad/` directory
- Shared models accessed read-only
- Feature flag available to disable iPad if issues found

---

## Automation Components

### Directory Structure

```
# Pi 5
/home/dylan/
├── automation/
│   ├── config/
│   │   ├── project-risk-levels.yaml
│   │   ├── telegram-bot.env
│   │   └── notification-settings.yaml
│   ├── scripts/
│   │   ├── telegram-bot.py      # Command interface
│   │   ├── watch-inbox.sh       # File watcher daemon
│   │   ├── process-item.py      # AI triage logic
│   │   ├── wake-mac.sh          # Wake-on-LAN
│   │   ├── trigger-task.sh      # SSH to Mac
│   │   ├── daily-digest.py      # Morning summary
│   │   └── classify.py          # Ollama classification
│   ├── queue/
│   │   └── tasks.db             # SQLite task queue
│   └── logs/
│       └── YYYY-MM-DD/          # Daily log folders
│           └── task-XXX.yaml    # Individual task logs
├── inbox/                        # Drop zone for file captures
├── processed/                    # After triage
└── supabase-sync/               # Local cache

# MacBook Pro
/Users/dylan/
├── projects/
│   ├── waypoint/
│   ├── spatialis/
│   ├── unshackled-pursuit/
│   └── personal-site/
├── templates/
│   ├── visionos-app/
│   ├── ios-app/
│   └── website/
├── automation/
│   ├── executor.sh              # Receives tasks from Pi
│   └── report-status.sh         # Sends results back
└── .claude/
    └── global-conventions.md
```

### Systemd Services (Pi 5)

```ini
# /etc/systemd/system/telegram-bot.service
[Unit]
Description=Telegram Command Bot
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/dylan/automation/scripts/telegram-bot.py
Restart=always
User=dylan
Environment=TELEGRAM_BOT_TOKEN=xxx
Environment=TELEGRAM_USER_ID=xxx

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/inbox-watcher.service
[Unit]
Description=Inbox File Watcher
After=network.target

[Service]
ExecStart=/home/dylan/automation/scripts/watch-inbox.sh
Restart=always
User=dylan

[Install]
WantedBy=multi-user.target
```

### Cron Jobs (Pi 5)

```cron
# Daily digest at 7am
0 7 * * * /home/dylan/automation/scripts/daily-digest.py

# Supabase sync every 15 minutes
*/15 * * * * /home/dylan/automation/scripts/sync-supabase.py

# Health check every hour
0 * * * * /home/dylan/automation/scripts/health-check.sh
```

---

## Remote Trigger System

### Wake-on-LAN Setup

**Mac Configuration:**
- System Settings → Battery → Options → Wake for network access: ON
- System Settings → General → Sharing → Remote Login: ON

**Pi 5 Wake Script:**
```bash
#!/bin/bash
# /home/dylan/automation/scripts/wake-mac.sh

MAC_ADDRESS="XX:XX:XX:XX:XX:XX"  # Get via: arp -a | grep <tailscale-ip>
TAILSCALE_IP="100.x.x.x"

# Send WoL packet
wakeonlan $MAC_ADDRESS

# Wait for Mac to come online (max 60 seconds)
for i in {1..12}; do
    if ping -c 1 -W 2 $TAILSCALE_IP &> /dev/null; then
        echo "Mac is online"
        exit 0
    fi
    sleep 5
done

echo "Mac failed to wake"
exit 1
```

### Remote Trigger Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REMOTE TRIGGER FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   iPhone                                                         │
│      │                                                           │
│      │ Telegram: "Build Spatialis and test"                     │
│      ▼                                                           │
│   Pi 5 (always on)                                              │
│      │                                                           │
│      │ 1. Parse intent with Ollama                              │
│      │ 2. Classify project and risk tier                        │
│      │ 3. Check if Mac is awake (ping Tailscale IP)            │
│      │ 4. If asleep → Wake on LAN                              │
│      │ 5. Wait for Mac to come online                          │
│      │ 6. SSH to Mac via Tailscale                             │
│      ▼                                                           │
│   MacBook Pro                                                    │
│      │                                                           │
│      │ 1. Receive task via SSH                                  │
│      │ 2. Start Claude Code session (if needed)                │
│      │ 3. Execute: xcodebuild, tests, etc.                     │
│      │ 4. Log all actions                                       │
│      │ 5. Report status back to Pi                             │
│      ▼                                                           │
│   Pi 5                                                           │
│      │                                                           │
│      │ 1. Receive completion status                             │
│      │ 2. Update task database                                  │
│      │ 3. Send result to Telegram                              │
│      ▼                                                           │
│   iPhone                                                         │
│      │                                                           │
│      │ "✅ Build succeeded. TestFlight uploading..."            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Execution Logging

Every automated action creates a structured log:

```yaml
# /home/dylan/automation/logs/2026-02-04/task-001.yaml

task_id: "2026-02-04-001"
timestamp_start: "2026-02-04T14:32:00Z"
timestamp_end: "2026-02-04T14:35:22Z"
status: "completed"  # pending, running, completed, failed, rolled_back

trigger:
  source: "telegram"
  message: "Add specialist page to Unshackled Pursuit"
  user: "dylan"

classification:
  project: "unshackled-pursuit-photography"
  risk_tier: 1
  action_type: "add-page"
  auto_execute: true

execution:
  device: "macbook-pro"
  method: "claude-code-cli"
  session_id: "cc-session-4821"
  
  steps:
    - step: 1
      action: "git checkout main"
      status: "success"
      
    - step: 2
      action: "git pull origin main"
      status: "success"
      
    - step: 3
      action: "create new page component"
      files_created:
        - "src/pages/specialist.tsx"
        - "src/components/SpecialistHero.tsx"
      status: "success"
      
    - step: 4
      action: "update navigation"
      files_modified:
        - path: "src/components/Nav.tsx"
          lines_changed: 3
          diff_summary: "Added specialist link to nav array"
      status: "success"
      
    - step: 5
      action: "git commit"
      commit_hash: "a3b4c5d"
      message: "Add specialist page"
      status: "success"
      
    - step: 6
      action: "vercel deploy triggered"
      deploy_url: "https://unshackled-pursuit-a3b4c5d.vercel.app"
      status: "success"

affected_files:
  created:
    - "src/pages/specialist.tsx"
    - "src/components/SpecialistHero.tsx"
  modified:
    - "src/components/Nav.tsx"
  deleted: []

rollback:
  possible: true
  command: "git revert a3b4c5d"
  instructions: "Run revert, push, Vercel will auto-redeploy"
```

### Daily Digest Format

```
┌─────────────────────────────────────────────────────────────────┐
│                    DAILY DIGEST: Feb 4, 2026                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 SUMMARY                                                      │
│  Tasks completed: 7                                             │
│  Tasks pending review: 2                                        │
│  Tasks failed: 0                                                │
│  Fleeting thoughts captured: 12                                 │
│                                                                  │
│  ✅ AUTO-EXECUTED (Tier 1)                                      │
│  • Unshackled Pursuit: Added specialist page                   │
│  • Personal site: Updated bio section                          │
│  • Waypoint docs: Added iPad roadmap notes                     │
│                                                                  │
│  ⏳ AWAITING REVIEW (Tier 2-3)                                  │
│  • Waypoint: iPad integration branch                           │
│    PR #47: +3 files, 0 modified                                │
│    /approve waypoint-47  or  /reject waypoint-47               │
│                                                                  │
│  💭 FLEETING THOUGHTS                                           │
│  Ideas: 4 (1 tagged #spatialis, 1 tagged #waypoint)            │
│  Tasks: 3 (added to reminders)                                  │
│  References: 5 (filed to vault)                                │
│                                                                  │
│  🔄 ROLLBACK AVAILABLE                                          │
│  /rollback 2026-02-04-001 (specialist page)                    │
│  /rollback 2026-02-04-002 (bio update)                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Templates

### Prevent Documentation Drift

Every project follows this structure:

```
/project-root/
├── CLAUDE.md              ← Claude Code reads FIRST, always
├── CONVENTIONS.md         ← Coding standards, patterns
├── docs/
│   ├── architecture.md    ← System design (auto-updated)
│   ├── decisions/         ← Architecture Decision Records
│   │   ├── 001-use-realitykit.md
│   │   └── 002-usdz-export-approach.md
│   └── changelog.md       ← Auto-updated with each feature
└── .claude/
    └── project-state.json ← Machine-readable current state
```

### Documentation Rules (in CLAUDE.md)

```markdown
## Documentation Rules

1. After completing any feature, UPDATE these files:
   - architecture.md (if structure changed)
   - changelog.md (always)
   - CONVENTIONS.md (if new patterns introduced)

2. Before starting work, READ:
   - This file (CLAUDE.md)
   - CONVENTIONS.md
   - Most recent 3 entries in decisions/

3. If you find contradictory documentation:
   - STOP and ask for clarification
   - Do not proceed with assumptions

4. Deprecated docs go to /docs/archive/ with date prefix

5. Never create documents that duplicate existing ones
```

---

## Implementation Phases

### Phase 1: Foundation (This Week)

**Day 1-2: Local AI Setup**
- [ ] Install Ollama on Pi 5 (if not done)
- [ ] Install MLX on MacBook
- [ ] Test models run correctly
- [ ] Verify Tailscale connectivity Pi ↔ Mac

**Day 2-3: Wake & Connect**
- [ ] Enable Wake on LAN on Mac
- [ ] Get Mac's MAC address
- [ ] Test WoL from Pi 5
- [ ] Set up passwordless SSH (Pi → Mac)
- [ ] Test SSH via Tailscale

**Day 3-4: First Automation**
- [ ] Create Supabase `fleeting_thoughts` table
- [ ] Update Apple Shortcuts to POST to Supabase
- [ ] Test capture flow end-to-end

### Phase 2: Triage & Digest (Next Week)

- [ ] Create file watcher daemon on Pi 5
- [ ] Build classification script (Ollama)
- [ ] Create daily digest script
- [ ] Set up cron job for 7am digest
- [ ] Test full pipeline: capture → classify → digest

### Phase 3: Command Interface (Week 3)

- [ ] Create Telegram bot (@BotFather)
- [ ] Build bot listener on Pi 5
- [ ] Implement basic commands: `/status`, `/digest`, `/list`
- [ ] Add task triggering: parse message → queue task
- [ ] Implement `/approve` and `/rollback`

### Phase 4: Remote Execution (Week 4)

- [ ] Build Mac executor script
- [ ] Integrate Claude Code CLI triggering
- [ ] Build status reporting (Mac → Pi → Telegram)
- [ ] Test full flow: Telegram → Pi → Mac → Build → Report
- [ ] Add error handling and failure notifications

### Phase 5: Polish & Templates (Month 2)

- [ ] Create project risk configuration
- [ ] Build project templates (visionOS, iOS, website)
- [ ] Implement PR creation and diff summaries
- [ ] Add TestFlight upload automation
- [ ] Build review notification system

---

## Current State & Backlog

### What Exists

| Item | Status | Location |
|------|--------|----------|
| Fleeting Thoughts spec | ✅ Exists | `/Apps/Construct/Fleeting Thoughts/FLEETING_THOUGHTS.md` |
| Apple Shortcuts (capture) | ✅ Working | iPhone (dumps to Notes - needs redirect) |
| Supabase schema | 📝 Designed | Not created in database |
| Pi 5 + Tailscale | ✅ Running | Home server |
| Pi 5 + Ollama | ❓ Check | May need install/verify |
| Mac + MLX | ❌ Not installed | Need to set up |
| Telegram bot | ❌ Not created | Need to set up |
| File watcher | ❌ Not built | Need to implement |
| Daily digest | ❌ Not built | Need to implement |

### Immediate Backlog

1. **Verify Ollama on Pi 5** — `ollama --version`, pull llama3.2:3b
2. **Install MLX on Mac** — `pip install mlx-lm`
3. **Create Supabase table** — run schema SQL
4. **Update Shortcuts** — redirect from Notes to Supabase
5. **Create Telegram bot** — via @BotFather

### Documentation to Consolidate

The following should be reviewed and merged into this spec or archived:

- `/Apps/Construct/Fleeting Thoughts/FLEETING_THOUGHTS.md`
- `/Apps/AGENTIC/` folder contents
- Any other automation-related docs in iCloud

---

## Appendix: Key Commands Reference

### Telegram Bot Commands

| Command | Action |
|---------|--------|
| `/status` | Show system status and recent activity |
| `/digest` | Send today's digest immediately |
| `/list [project]` | Show pending tasks for project |
| `/approve [task-id]` | Approve and execute pending task |
| `/reject [task-id]` | Reject pending task |
| `/rollback [task-id]` | Rollback completed task |
| `/build [project]` | Trigger build for project |
| `/test [project]` | Run tests for project |

### Natural Language Examples

The bot should understand:
- "Build Spatialis" → trigger build
- "Add specialist page to Unshackled" → classify and queue
- "What's pending?" → show review queue
- "Roll back the last change to personal site" → find and revert

---

## Appendix: Quick Setup Commands

### Pi 5 - Ollama
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b
systemctl enable ollama
```

### MacBook - MLX
```bash
pip install mlx-lm

# Test it
mlx_lm.generate \
  --model mlx-community/Llama-3.2-8B-Instruct-4bit \
  --prompt "Hello, world"

# Run as server
mlx_lm.server --model mlx-community/Llama-3.2-8B-Instruct-4bit --port 8080
```

### Telegram Bot Creation
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Choose name and username
4. Save the token
5. Get your user ID: message @userinfobot

---

*This document is the single source of truth for the automation infrastructure. Update it as implementation progresses.*
