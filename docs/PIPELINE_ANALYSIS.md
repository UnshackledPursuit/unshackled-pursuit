# Fleeting Thoughts Pipeline Analysis

> **Status:** Current State Assessment | **Last Updated:** 2026-01-25

---

## Current Infrastructure

### Capture Points (Working)
| Source | Status | Method |
|--------|--------|--------|
| Manual Input | ✅ | Web UI quick capture |
| Voice Capture | ✅ | Web UI microphone |
| Shortcuts | ✅ | iOS/macOS Shortcuts → API |
| WaypointHub Feedback | ✅ | Native form → Supabase |
| Folder Watch | 🔶 | Documented, not implemented |

### Data Flow
```
Capture → Inbox → Processing → Routed → Done → Archived
                     ↓
               AI Analysis
                     ↓
            Project Assignment
            Priority Setting
            Destination Suggestion
```

### Database Schema
- `fleeting_thoughts`: Main thoughts table
- `projects`: Project metadata with paths, instructions

### Project Context (New)
Each project now has:
- `app_path`: Path to app source code
- `website_path`: Path to website code
- `feedback_url`: External feedback form
- `custom_instructions`: Agent context

---

## For Autonomous Pipeline

### What's Missing

#### 1. **Auto-Processing Trigger**
Currently: Manual "Process with AI" button click
Needed: Auto-trigger when thought arrives in Inbox

**Options:**
- Supabase Database Webhook → Edge Function
- Vercel Cron job (every 5 min check for unprocessed)
- Real-time subscription in client

#### 2. **Auto-Routing Rules**
Currently: AI suggests, human approves
Needed: Configurable auto-routing based on confidence

**Rules Engine:**
```typescript
// Example auto-route rules
if (ai_confidence > 0.9 && priority === 'high') {
  autoMove('processing')
}
if (suggested_destination && is_actionable === false) {
  autoMove('routed')
}
```

#### 3. **Agent Handoff**
Currently: Manual copy/paste of project instructions
Needed: Auto-spawn agent with context when thought is actionable

**Flow:**
```
Thought tagged to project
  → Check if actionable
  → Pull project.custom_instructions
  → Pull project.app_path or website_path
  → Spawn Claude agent with full context
```

#### 4. **External Triggers**
Currently: Only web UI and API endpoint
Needed: Multiple trigger points

**SSH Bridge (Raspberry Pi):**
```bash
# From iPad/phone
ssh pi@raspberrypi.local "curl -X POST https://unshackled.app/api/trigger-processing"
```

**Folder Watcher (iCloud):**
```bash
# launchd watches folder
# New file → Parse content → Create thought → Auto-process
```

---

## Implementation Roadmap

### Phase 1: Webhooks & Triggers (Quick)
- [ ] Supabase Database Webhook on `fleeting_thoughts` INSERT
- [ ] Edge Function to auto-process new thoughts
- [ ] Add `auto_processed` flag to prevent loops

### Phase 2: Auto-Routing (Medium)
- [ ] Add routing rules table/config
- [ ] Implement confidence threshold settings
- [ ] Auto-move based on rules
- [ ] Add "auto-routed" indicator in UI

### Phase 3: Agent Integration (Complex)
- [ ] Project context injection into Claude
- [ ] "Execute" button for actionable thoughts
- [ ] Agent session tracking
- [ ] Result capture back to thought

### Phase 4: External Triggers (Infrastructure)
- [ ] SSH command documented & tested
- [ ] Raspberry Pi trigger endpoint
- [ ] iCloud folder watcher script
- [ ] Mobile shortcuts for common actions

---

## Quick Wins Available Now

### 1. Manual Batch Processing
Add "Process All Inbox" button that sends all unprocessed thoughts to AI in sequence.

### 2. Project Auto-Assignment
During AI processing, match thought content to project names/keywords and auto-assign.

### 3. Vercel Cron
Add `vercel.json` cron that hits processing endpoint every 15 minutes:
```json
{
  "crons": [{
    "path": "/api/process-pending",
    "schedule": "*/15 * * * *"
  }]
}
```

### 4. Supabase Edge Function
Trigger on new thought → call Claude API → update thought with analysis.

---

## Architecture Decision: Where to Run Agents

| Option | Pros | Cons |
|--------|------|------|
| Vercel Edge | Fast, integrated | 10s timeout, limited |
| Vercel Serverless | 60s timeout | Cold starts |
| External (Raspberry Pi) | No limits, local access | Requires Pi always on |
| GitHub Actions | Long running, free | Slower to trigger |
| Local Mac (SSH) | Full power, Claude CLI | Mac must be awake |

**Recommendation:**
- Quick processing → Vercel Edge Functions
- Complex agents → SSH to Mac (Claude Code)
- Monitoring → Raspberry Pi cron jobs

---

## Related Files

| File | Purpose |
|------|---------|
| `/src/app/api/process/route.ts` | AI processing endpoint |
| `/src/app/api/capture/route.ts` | Thought capture endpoint |
| `/docs/FLEETING_FUTURE_FEATURES.md` | Feature roadmap |
| `/AGENTS.md` | Project context for Claude |

---

*This analysis informs the autonomous pipeline development.*
