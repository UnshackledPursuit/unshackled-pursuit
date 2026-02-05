# Autonomous Development Infrastructure
## Complete System Specification v2

A unified system for frictionless idea capture, automated project management, and remote development execution.

**Created:** February 4, 2026  
**Version:** 2.0  
**Status:** Implementation Ready

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [What Already Exists](#what-already-exists)
4. [Cost Model](#cost-model)
5. [Device Architecture](#device-architecture)
6. [Intake Methods](#intake-methods)
7. [Fleeting Thoughts Pipeline](#fleeting-thoughts-pipeline)
8. [Telegram Bot Interface](#telegram-bot-interface)
9. [Risk Tier System](#risk-tier-system)
10. [Remote Execution System](#remote-execution-system)
11. [Execution Logging & Rollback](#execution-logging--rollback)
12. [Project Documentation Standards](#project-documentation-standards)
13. [Implementation Phases](#implementation-phases)
14. [Technical Reference](#technical-reference)

---

## Executive Summary

### The Vision

> At work, away from computer → mention an idea or command → see it executed and live

This system enables:

- **Multiple intake methods** — Telegram, iCloud folder, website Kanban, Apple Shortcuts
- **Unified processing** — Everything flows to Supabase, appears in existing Kanban
- **Automated triage** — Local AI classifies and routes content
- **Remote development** — Trigger builds and updates from anywhere
- **Safe automation** — Risk-tiered execution with approval gates
- **Full accountability** — Every action logged with rollback capability

### Core Principle

**Friction = Death.** Every step that requires thought or effort reduces usage. The system must be effortless at capture time.

### The Immediate Magic Goal

```
You (at work, via Telegram): "Add dark mode toggle to fleeting thoughts page"
        │
        ▼
System: Parses intent → Wakes Mac → Triggers Claude Code
        │
        ▼
Claude Code: Implements feature → Commits → Deploys to Vercel
        │
        ▼
You (2 minutes later): See it live on your phone
```

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                            INTAKE LAYER                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Telegram   │  │ iCloud Drop  │  │   Website    │  │   Shortcuts  │    │
│  │     Bot      │  │    Folder    │  │   (Kanban)   │  │   (Voice)    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │             │
│         └────────────────┴────────┬────────┴─────────────────┘             │
│                                   │                                         │
│                                   ▼                                         │
│                          ┌───────────────┐                                  │
│                          │   SUPABASE    │  ← Single source of truth       │
│                          │  (Database)   │                                  │
│                          └───────┬───────┘                                  │
│                                  │                                          │
│                                  ▼                                          │
│                         PROCESSING LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Pi 5 (COORDINATOR)                               │   │
│  │  • Telegram listener         • File watcher (iCloud sync)           │   │
│  │  • Ollama classification     • Task queue management                │   │
│  │  • Wake-on-LAN               • Daily digest generation              │   │
│  │  • SSH to Mac                • Status monitoring                    │   │
│  └─────────────────────────────────┬───────────────────────────────────┘   │
│                                    │                                        │
│                                    │ Tailscale (secure mesh)               │
│                                    ▼                                        │
│                          EXECUTION LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │               MacBook Pro M1 Max (EXECUTOR)                          │   │
│  │  • Claude Code CLI           • Xcode builds                         │   │
│  │  • MLX (local AI)            • Git operations                       │   │
│  │  • Project execution         • TestFlight uploads                   │   │
│  └─────────────────────────────────┬───────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│                           OUTPUT LAYER                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │    Vercel    │  │  TestFlight  │  │    GitHub    │  │   Telegram   │   │
│  │   (Deploy)   │  │   (Builds)   │  │    (PRs)     │  │   (Report)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What Already Exists

### ✅ Fully Operational

| Component | Status | Location/Details |
|-----------|--------|------------------|
| **Fleeting Thoughts Kanban** | ✅ Live | unshackledpursuit.com/fleeting (private, Clerk auth) |
| **Supabase Database** | ✅ Live | fleeting_thoughts table with full schema |
| **Project Categories** | ✅ Configured | WaypointHub, Network, Construct Ideas, Fleeting Thoughts, Unshackled Pursuit, Spatialis |
| **Tags System** | ✅ Working | #feedback, #spatialis, #general, etc. |
| **Status Filtering** | ✅ Working | Open (11), Recent (5), External (1), Completed (1), Trash |
| **Apple Shortcuts** | ✅ Working | 1-tap capture via action button (currently → Notes) |
| **Pi 5 Server** | ✅ Running | Tailscale, Pi-hole, Frigate, Home Assistant |
| **Tailscale Mesh** | ✅ Running | Pi 5 connected, Mac connected |
| **Unshackled Pursuit Website** | ✅ Live | Next.js, Vercel, GitHub repo with documentation |
| **GitHub Repos** | ✅ Active | unshackled-pursuit (and others) with project docs |

### Existing Kanban Structure (From Current Implementation)

The Fleeting Thoughts interface already has:

**Filter Tabs:**
- Open (11 items)
- Recent (5 items)  
- External (1 item)
- Completed (1 item)
- Trash

**Project Categories:**
- 🟢 WaypointHub
- 🔵 Network
- 🟡 Construct Ideas
- 🟣 Fleeting Thoughts
- 🔵 Unshackled Pursuit
- 🔵 Spatialis
- ➕ New Project

**Sample Entries:**
```
• Spatialis Feedback - Type: general, Test feedback submission
  Tags: #feedback #spatialis #general | 2/1/2026

• https://x.com/ryancarson/status/... Check out agent looping
  1/29/2026

• I can't access the top menu options on iPhone app on vertical mode.
  Need ability to update projects. Also need a no internet idea queue...
  1/28/2026

• Sigil 1 Loading/shipping module interface of sigil use the bookmark
  beautiful design. 2. Rename and branding. 3 ship asap
  1/28/2026
```

### ⚠️ Partially Complete

| Component | Status | What's Missing |
|-----------|--------|----------------|
| Shortcuts → Supabase | ⚠️ Not redirected | Still dumping to Notes |
| Ollama on Pi 5 | ⚠️ Verify needed | May need install/model pull |
| MLX on Mac | ⚠️ Not installed | Need to set up |
| iCloud Drop Folder | ⚠️ Concept exists | Folder may exist, no watcher |

### ❌ Not Yet Built

| Component | Priority | Notes |
|-----------|----------|-------|
| Telegram Bot | **High** | Core command interface |
| File Watcher Daemon | **High** | Monitor iCloud folder |
| Wake-on-LAN | **High** | Remote Mac triggering |
| Classification Pipeline | **Medium** | Ollama auto-tagging |
| Daily Digest | **Medium** | Morning summary cron |
| Execution Logging | **Medium** | YAML logs + rollback |

---

## Cost Model

| Component | Cost | Notes |
|-----------|------|-------|
| Ollama on Pi 5 | **Free** | Local inference |
| MLX on MacBook | **Free** | Local inference |
| Claude Code CLI | **Included** | Max plan |
| Supabase | **Free tier** | 500MB DB |
| Tailscale | **Free** | Personal use |
| Vercel | **Free tier** | Hobby plan |
| Telegram Bot | **Free** | No cost |

**Key:** SSH → Claude Code CLI = **zero variable AI costs**

---

## Device Architecture

### Pi 5 — Coordinator (Always On)

```
┌─────────────────────────────────────────────────────────────┐
│                         Pi 5                                 │
├─────────────────────────────────────────────────────────────┤
│  SERVICES                        EXISTING                    │
│  • telegram-bot.service          • Home Assistant            │
│  • inbox-watcher.service         • Pi-hole                   │
│  • ollama.service                • Frigate NVR               │
│                                  • Tailscale                 │
│  PATHS                                                       │
│  /home/dylan/automation/         Scripts & config            │
│  /home/dylan/inbox/              Local drop zone             │
│  /home/dylan/icloud-sync/        Synced from iCloud          │
└─────────────────────────────────────────────────────────────┘
```

### MacBook Pro — Executor (On-Demand)

```
┌─────────────────────────────────────────────────────────────┐
│                    MacBook Pro M1 Max                        │
├─────────────────────────────────────────────────────────────┤
│  TOOLS                           SPECS                       │
│  • Claude Code CLI               • 32GB unified memory       │
│  • MLX (8B-22B models)           • M1 Max chip               │
│  • Xcode CLI                     • Wake-on-LAN enabled       │
│  • Git + fastlane                                            │
│                                                              │
│  PATHS                                                       │
│  ~/Developer/                    Xcode projects              │
│  iCloud/.../Apps/Websites/       Documentation               │
│    └── Production/DKRHub/        Unshackled Pursuit docs     │
└─────────────────────────────────────────────────────────────┘
```

---

## Intake Methods

### Method 1: Website Kanban (Primary Review)

**URL:** unshackledpursuit.com/fleeting  
**Best for:** Review, organize, detailed management  
**Note:** Remains primary interface. Other methods feed into it.

### Method 2: Telegram Bot (Commands & Quick Capture)

**Best for:** Commands while mobile, quick thoughts, queries

```
THOUGHT MODE (default):
  You: "Idea: gesture controls for Spatialis"
  Bot: "💭 Captured → #spatialis"

COMMAND MODE (/do prefix):
  You: "/do Add dark mode to fleeting thoughts"
  Bot: "🔧 Task: Add dark mode
        Project: unshackled-pursuit (Tier 1)
        Proceed? /yes /no"
  You: "/yes"
  Bot: "✅ Done. Preview: [url]"

QUERY MODE (/list, questions):
  You: "/list spatialis"
  Bot: "📋 Spatialis (4 open): ..."
```

**Commands:**
- `/do [task]` — Execute task
- `/list [project]` — Show items
- `/status` — System health
- `/digest` — Send digest now
- `/approve [id]` — Approve pending
- `/rollback [id]` — Revert task

### Method 3: iCloud Drop Folder (Files)

**Best for:** Screenshots, PDFs, documents

```
Drop file → iCloud syncs → Pi 5 detects → 
Process by type → Supabase → Kanban
```

**Advantages:** Native drag-drop, batch operations, large files

### Method 4: Apple Shortcuts (Voice)

**Best for:** Hands-free, driving, quick voice notes

**Target:** Redirect existing shortcuts from Notes → Supabase POST

---

## Fleeting Thoughts Pipeline

```
CAPTURE → STORE → TRIAGE → REVIEW → ROUTE → EXECUTE
   │        │        │        │        │        │
 Any      Supa-    Ollama   Kanban  Project  Claude
method    base     auto-    manual  assign   Code
           DB      classify  edits
```

### Daily Digest (7am Telegram)

```
📊 SUMMARY
New captures: 8 | Auto-classified: 6 | Awaiting review: 2

💭 BY PROJECT
Spatialis (3): gesture controls, ink system, brushes
WaypointHub (2): iPad menu fix, offline queue

✅ COMPLETED YESTERDAY
• Dark mode toggle added
• Mobile nav fix

⏳ PENDING REVIEW
• waypoint-48: iPad integration
  /approve waypoint-48
```

---

## Risk Tier System

| Tier | Name | Flow | Examples |
|------|------|------|----------|
| **1** | Auto-Execute | Confirm → Go | Website updates, docs |
| **2** | Auto + Review | Execute → 30min window | New feature branches |
| **3** | Review Required | Diff → Wait for /approve | Modify working code |
| **4** | Manual Only | Prepare → Human executes | App Store deploy |

### Project Defaults

```yaml
unshackled-pursuit: tier 1 (website)
waypoint: tier 3 (production app)
spatialis: tier 2 (in development)
```

---

## Remote Execution System

### Wake-on-LAN Flow

```
Command → Pi 5 → Ping Mac → Asleep? → WoL packet → 
Wait (60s max) → SSH → Execute → Report
```

### Full Execution Flow

```
1. Telegram: "/do Add dark mode"
2. Pi 5: Parse, classify (Tier 1), confirm
3. User: "/yes"
4. Pi 5: Wake Mac, SSH connect
5. Pi 5: Build context (related thoughts, project docs)
6. Mac: Claude Code implements, commits, pushes
7. Vercel: Auto-deploys
8. Pi 5: Log execution, send report
9. Telegram: "✅ Done. Preview: [url]. Rollback: /rollback xxx"
```

---

## Execution Logging

Every task creates YAML log:

```yaml
task_id: "2026-02-05-001"
status: "completed"
trigger: {source: telegram, message: "/do Add dark mode"}
classification: {project: unshackled-pursuit, tier: 1}
execution:
  steps:
    - {action: "git pull", status: success}
    - {action: "implement feature", files_created: [...]}
    - {action: "commit", hash: "a3b4c5d"}
    - {action: "push + deploy", preview_url: "..."}
rollback: {command: "git revert a3b4c5d"}
```

---

## Project Documentation Standards

### Required Per Project

```
/project-root/
├── CLAUDE.md              ← Read first
├── .claude/
│   └── project-config.json
└── docs/
    └── architecture.md
```

### CLAUDE.md Essentials

- Project purpose (2-3 sentences)
- Tech stack
- Key directories
- Current state
- Before/after change procedures

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Verify Ollama on Pi 5
- [ ] Install MLX on Mac
- [ ] Set up Wake-on-LAN
- [ ] Redirect Shortcuts → Supabase

### Phase 2: Telegram Bot (Week 2)
- [ ] Create bot via @BotFather
- [ ] Implement thought capture
- [ ] Implement /list, /status
- [ ] Implement /do with confirmation

### Phase 3: Remote Execution (Week 3)
- [ ] Build executor script on Mac
- [ ] Connect Claude Code triggering
- [ ] Build context from Supabase + docs
- [ ] Implement logging + /rollback

### Phase 4: Polish (Week 4)
- [ ] Daily digest cron
- [ ] iCloud folder watcher
- [ ] CLAUDE.md for all projects
- [ ] Test full flows

---

## Technical Reference

### Environment Variables (Pi 5)

```bash
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_USER_ID=xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
MAC_TAILSCALE_IP=100.x.x.x
MAC_MAC_ADDRESS=XX:XX:XX:XX:XX:XX
```

### Systemd Service Template

```ini
[Unit]
Description=Telegram Bot
After=network.target

[Service]
Type=simple
User=dylan
WorkingDirectory=/home/dylan/automation
EnvironmentFile=/home/dylan/automation/config/.env
ExecStart=/usr/bin/python3 scripts/telegram_bot.py
Restart=always

[Install]
WantedBy=multi-user.target
```

### Quick Commands

```bash
# Wake Mac
wakeonlan XX:XX:XX:XX:XX:XX

# Test SSH
ssh dylan@100.x.x.x "echo connected"

# Bot logs
journalctl -u telegram-bot -f

# Manual digest
python3 /home/dylan/automation/scripts/daily_digest.py
```

---

## Summary

**Existing:** Fleeting Thoughts Kanban at unshackledpursuit.com (fully operational)

**Adding:**
- Telegram for commands + quick capture
- iCloud folder for file drops
- Automation for classification
- Remote development via SSH → Claude Code

**Result:** Mention an idea at work → See it live minutes later

---

*Hand this document to Claude Code to implement any phase.*
