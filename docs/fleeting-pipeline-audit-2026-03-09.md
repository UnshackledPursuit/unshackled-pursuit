# Fleeting Thoughts Pipeline Audit — 2026-03-09

> Full current-state audit of the Fleeting Thoughts pipeline. Safety net before any restructuring.
> Checklist item: FT-PIPE-01 on `Websites/DKRHUB/unshackled-pursuit/docs/MASTER_CHECKLIST.md`
> **Git-tracked backup:** `Websites/DKRHUB/unshackled-pursuit/docs/fleeting-pipeline-audit-2026-03-09.md` — sync after major updates.

## Why This Audit

The pipeline was built incrementally over a weekend across multiple agent sessions. Parts work, parts don't, agents get confused about which tools to use (old scripts vs AGENTIC agents vs Chrome MCP). The /fleeting skill is 474 lines of mixed instructions, reference material, and stale capability assessments. Need to document everything, then restructure for clarity.

## Current Pipeline Locations

| What | Where | Status |
|------|-------|--------|
| Hub docs | `FleetingThoughts/AGENTS.md` | Active — Supabase access, pipeline overview |
| Skill | `skills/fleeting/SKILL.md` | **REWRITTEN Mar 9** (~200 lines, reflects Gen 2 tools, X link system, POI) |
| Process queue agent | `AGENTIC/agents/process-queue.sh` | Running (every 30 min via launchd) |
| User-action handler | `AGENTIC/agents/process-user-actions.sh` | Running (every 30 min via launchd) |
| Web dashboard | `Websites/DKRHUB/fleeting-thoughts/` | Live at fleetingthoughts.app |
| Legacy web UI | `Websites/DKRHUB/unshackled-pursuit/` | Old Kanban, still works |
| Pipeline ledger | `Websites/DKRHUB/unshackled-pursuit/docs/PIPELINE_LEDGER.md` | In legacy repo |
| Old automation scripts | `Websites/DKRHUB/unshackled-pursuit/agents/` | folder-watcher.ts, process-inbox.ts, process-thoughts.ts — NOT running |
| Native iOS app | `Construct/Ideas/FleetingThoughts/` | Functional, channel tabs live |
| Native Mac app | `Construct/Ideas/FleetingThoughts/` | Functional, hotkey capture |
| Intelligence POST | `AGENTIC/agents/intelligence-post.sh` | Working — POSTs to Supabase |

## What Works (Verified)

| Component | Where | How |
|-----------|-------|-----|
| Supabase storage | Cloud | `fleeting_thoughts` + `projects` tables, RLS + service key bypass |
| Web Kanban UI | `Websites/DKRHUB/unshackled-pursuit/` | unshackledpursuit.com/fleeting — capture, drag-drop |
| Web dashboard (new) | `Websites/DKRHUB/fleeting-thoughts/` | fleetingthoughts.app — command center, board, media, agents |
| `/fleeting` skill | `skills/fleeting/SKILL.md` | Manual agent triage — categorize, route, file scan |
| `/api/capture` endpoint | Unshackled Pursuit website | External capture via POST (Shortcuts, feedback forms) |
| Process queue agent | `AGENTIC/agents/process-queue.sh` | Auto-processes iPhone podcast captures (every 30 min, launchd) |
| User-action handler | `AGENTIC/agents/process-user-actions.sh` | Handles Dig Deeper/Implement from FT app (every 30 min, launchd) |
| Intelligence POST | `AGENTIC/agents/intelligence-post.sh` | POSTs briefs to Supabase pipeline |
| iOS app | `Construct/Ideas/FleetingThoughts/` | Channel tabs (Capture/Intelligence/Activity), swipe gestures, Supabase reads |
| Mac app | `Construct/Ideas/FleetingThoughts/` | Hotkey capture, 11 files |
| Pipeline ledger | `Websites/DKRHUB/unshackled-pursuit/docs/PIPELINE_LEDGER.md` | Tracks routing decisions |
| Morning digest | `AGENTIC/agents/prompts/morning-digest.md` | Daily summary of overnight output (this IS the daily digest) |
| Knowledge DB search | `AGENTIC/search` | FTS5 + vector search across all ecosystem docs |
| Ollama | Local | nomic-embed-text for embeddings, llama3.2 available |

## What Exists But Doesn't Run / Is Stale

| Component | Where | Issue |
|-----------|-------|-------|
| `folder-watcher.ts` | `Websites/.../agents/` | Rewritten Tier 1, launchd plist exists (`com.fleeting.folder-watcher`) but UNLOADED. Compiled JS at `~/bin/fleeting-watcher/`. FDA resolved for bash (not node). |
| `process-inbox.ts` | `Websites/.../agents/` | Rewritten Tier 1, works manually, no scheduler |
| `process-thoughts.ts` | `Websites/.../agents/` | Uses Anthropic API (costs $), unchanged, needs CLI conversion |
| `pipeline-rules.ts` | `Websites/.../agents/` | Shared module for old scripts |
| Compiled JS versions | `~/bin/fleeting-watcher/` | folder-watcher.js, pipeline-rules.js, .env.local copy |
| `com.fleeting.folder-watcher.plist` | `~/Library/LaunchAgents/` | UNLOADED — separate from com.dkr.agent.* fleet |

## Tool Hierarchy (Current State — Confusing)

**The problem:** Three generations of tools exist simultaneously. Agents don't know which to use.

| Generation | Tools | Status |
|------------|-------|--------|
| Gen 1 (Feb) | folder-watcher.ts, process-inbox.ts, process-thoughts.ts | Old website scripts. Not running. Node-based. |
| Gen 2 (Mar 5-6) | AGENTIC/agents/process-queue.sh, process-user-actions.sh | Running via launchd. Bash + claude -p. |
| Gen 3 (Mar 6+) | /fleeting skill, Chrome MCP, Supabase MCP | Manual invocation. Agents sometimes jump straight to Chrome MCP instead of using Gen 2 tools. |

**Preferred hierarchy (TO BE CONFIRMED):**
1. Gen 2 agents handle automated processing (already running)
2. /fleeting skill handles manual triage sessions
3. Gen 1 scripts should be archived or modernized
4. Chrome MCP is supplementary, not primary

## ~~Stale Items in /fleeting Skill~~ — RESOLVED

**DONE (Mar 9 evening).** Skill rewritten from 474 → ~200 lines. All 6 issues fixed: Gen 1 references removed, Gen 2 AGENTIC agents listed, X link processing system integrated, Person of Interest referenced, intelligence routing documented, pipeline redesign pointer added.

## Pipeline Checklist State

`Websites/DKRHUB/unshackled-pursuit/docs/MASTER_CHECKLIST.md`:
- Last updated: 2026-02-10 (nearly a month stale)
- Has detailed launchd/iCloud troubleshooting (RESOLVED — FDA on /bin/bash was the fix, discovered in AGENTIC work)
- Tiered automation plan (Tiers 1-4) from February — some items now exist via AGENTIC agents but checklist doesn't know
- Session logs from Feb 10-11 only
- "What Doesn't Exist Yet" lists items that now exist (Ollama, daily digest)
- Does NOT reference any AGENTIC/agents/* tools

## Pipeline Issues Identified (Mar 9 session)

### Capture Funnel Overlap
Multiple capture channels all feed into the same Supabase table with similar/same labels:
- fleetingthoughts.app website (direct capture)
- iOS Share Extension (from any app)
- iOS native app (direct capture)
- Mac native app (hotkey capture)
- `/api/capture` endpoint (Shortcuts, feedback forms)
- Agent intelligence POST (`intelligence-post.sh`)
All overlapping, all labeled similarly. Hard to tell source from destination.

### Status/Category Problems
- "Done" items stay visible and count toward active totals — confusing
- Items don't auto-archive after completion
- X links got their own starting category (weekend change) but processed items just sit in "done" forever
- Need better categories and clearer lifecycle: inbox → processing → research/action → archived
- The distinction between "processed," "researched," "actioned," and "truly done" is blurry

### Automation Gap
- Only trigger for pipeline processing is manual: user opens orchestrator, types `/fleeting`
- Remote terminal sessions die before user can get back to them
- Process-queue and user-actions agents run every 30 min but only handle specific subtypes (podcast captures, dig-deeper/implement actions)
- No general-purpose auto-triage agent exists
- Result: items pile up in inbox with no automated processing path

### Chrome MCP Dynamics
- Weekend unlock: agents now have Chrome access to X (premium plus), SuperGrok, Google Gemini (pro annual)
- Enables AI Council (multi-model research) and independent agent research
- Agents generally used Chrome appropriately — not a huge problem
- BUT: Chrome is a shared resource. If an agent is using Chrome for research, it blocks pipeline processing that also needs Chrome
- Chrome MCP tool hierarchy: use Claude-native tools (WebSearch, WebFetch) first, Chrome when you need a logged-in session
- Key refs: `AGENTIC/agents/prompts/grok-extraction-sop.md`, `tool-reference-chrome-mcp.md`

### Permission Fatigue
- User exhausted from manually approving every agent action
- Defeats the purpose of automation
- Agents stop mid-task waiting for approval, user loses context
- Need: more agents running with acceptEdits or nuclear mode where safe

### ~~Tool Confusion~~ — PARTIALLY RESOLVED
- /fleeting skill no longer misdirects (rewritten Mar 9, Gen 1 refs removed)
- Gen 1 scripts still exist on disk but are no longer referenced by any active doc
- **Remaining:** Gen 1 scripts should be formally archived or deleted (Restructuring item #6)
- **Remaining:** FleetingThoughts/AGENTS.md hub doc still references Gen 1 scripts (last updated Feb 10) — needs update

### Pipeline Vision (North Star — refined Mar 9 evening)

**The circular pipeline:**
1. User sends X links, thoughts, podcast links throughout the day
2. Agents research, extract insight, assess cross-ecosystem relevance
3. An elegant feed comes BACK to the user (iPhone app + dashboard) — NOT 100 items, but curated actionable insight
4. Each item answers: "What can we DO with this?" — implement, research deeper, track, archive
5. User toggles which items to act on (checkbox + send)
6. System executes the selected items autonomously
7. Some items are just FYI/awareness — clearly labeled, no action needed

**Key principles:**
- **Signal extraction > inbox zero.** The goal is harnessing insight, not clearing a queue
- **X is the highest-signal intake channel** — cutting edge, rapid, what practitioners are doing RIGHT NOW (validated by pmarca: 1/4 of his info consumption is X)
- **Pipeline is a workflow engine:** capture → research → feed back → user toggles → execute
- **Don't overwhelm the user** — 5 actionable items is better than 100 raw links
- **Routing destinations:** marketing/media, dev projects, AI Council research, Person of Interest updates, strategic context, knowledge DB, archive
- **Grok is essential for X links** — community commentary, quote tweets, broader discourse. Post text alone is surface-level. S-tier posts MUST go through Grok for the full picture.
- **Some items are "directionally yes, later"** — infrastructure isn't ready yet but the idea is worth tracking for when it is

**The feed the user wants:**
- Insights from X links processed by agents
- New podcast drops with takeaways
- "5 items to consider implementing" — toggle on/off
- FYI items (awareness, no action)
- All visible on iPhone app AND dashboard
- Elegant, not overwhelming

### User's Processing Heuristics (Distilled from Mar 9 running commentary — FOR AGENT AUTOMATION)

> The user provided running commentary while processing links so agents can learn to replicate their evaluation style. These rules codify how the user thinks about incoming intelligence.

**Signal evaluation:**
- **Builders > commentators** — people who ship tools/products (steipete, Tobi Lutke) outrank people who just share/comment (Alex Finn). What someone BUILDS tells you more than what they SAY.
- **"Can we use this?"** is the first question for every link. Specifically: can we use this design, technology, or pattern in our visionOS apps, agent ecosystem, or media pipeline?
- **"Can we build this?"** — visual/3D content (particle effects, shield VFX, Gaussian splatting) gets evaluated as project ideas, not just intelligence items.
- **Marketing filter** — some people (Greg Isenberg, Riley Brown) produce good information but also sell products. Note the angle. Don't take claims at face value. Learn from their tools/processes, not their pitches.
- **Company updates matter as much as people** — Anthropic releases, HuggingFace datasets, Perplexity features are all high-signal events. Track at org level, not just individual level.

**Prioritization rules:**
- **Anthropic updates = near-100% "research and implement"** — proven by memory feature transforming the ecosystem in a week. Boris (Claude Code creator) ships rapidly. Every feature release gets deep-dived.
- **S-tier person + direct ecosystem relevance = breakout item** — skip batch, act now. Tobi using autoresearch overnight validates our exact pattern.
- **Architecture inspiration > direct implementation** — even if we don't use the actual tool (discrawl, Paperclip), the PATTERN it demonstrates might apply to our system. Extract the principle.
- **"Directionally yes, later"** — some ideas are right but infrastructure isn't ready. Track for when it is. Don't discard, don't implement prematurely.
- **Future pipeline research vs implement now** — HuggingFace/synthetic data = future research pipeline. SwiftUI skill = implement today. Know the difference.

**Capture intent (FEATURE REQUEST: Share Extension comments field):**
- User wants to annotate links at capture time: "build this," "check what this company does," "implement into media team," "research this deeply"
- Currently can only tag (x-link, research, general) — no free-text commentary
- This annotation would dramatically improve agent triage (agents know user's intent without guessing)
- Feature request for Fleeting Thoughts native iOS app Share Extension

**Processing flow the user models:**
1. Scan the post — who is it, what are they saying, how many views/engagement
2. Check: is this person a builder or a commentator? Known or new?
3. Ask: can we USE this? Can we BUILD this? Is this a PATTERN we should learn from?
4. Check for marketing bias — is the person selling something?
5. Route: implement now / deep research / tool candidate / project idea / FYI-archive
6. Cross-reference: does this connect to anything else in the inbox? (clustering)
7. Note connected people/companies for Person of Interest / Company of Interest updates

**24/7 autonomous agent target: end of April 2026** — hard goal. Research open frameworks (OpenClaw, Paperclip), training, safety. Currently leveraging frontier models (Claude/Anthropic, Grok/X, Gemini/Google).

### Intelligence Routing (Decided Mar 9)

| What | Where It Goes | How |
|------|-------------|-----|
| Actionable intelligence | Supabase via `intelligence-post.sh` (tags: research, evaluate, implement) | Shows on dashboard, agents pick up |
| Person of Interest updates | `AGENTIC/PERSON_OF_INTEREST.md` | Direct edit |
| Strategic validation/trends | `AGENTIC/strategic-context.md` | Direct edit |
| Tools/repos to evaluate | Supabase via `intelligence-post.sh` (tag: `tool-candidate`) | Shows on dashboard |
| "Directionally yes, later" items | Supabase with tag `future-infrastructure` | Tracked, not acted on |

**Principle: everything routes to an existing system. No new filing cabinets.**

### X Link Processing Learnings (Mar 9 — 5 links processed)

| Link | Author | Signal Type | Route | Grok Used? |
|------|--------|------------|-------|-----------|
| DGX Spark + autoresearch | Alex Finn (unranked) | Derivative of Karpathy | Research: autoresearch for Apple Silicon | No |
| Paperclip orchestration | Ryan Carson / @dotta | Competitive architecture | Evaluate: Docker test when ready | No |
| Death of Marketing | John Rush (now A-tier) | Strategic alignment | Marketing reference + full article read needed | No |
| 1/4 information framework | pmarca (now S-tier) | Strategic validation | strategic-context.md | No |
| Agent collaboration swarms | Karpathy (S-tier) | Core evolution path | AG-56 + AUTORESEARCH_STRATEGY | No |

**Gap identified:** Grok was NOT used on any of these. Surface-level extraction only. S-tier posts (Karpathy, pmarca) should always go through Grok for community discourse, replies, quote tweets. The replies on 764K-view posts contain practitioner insights that the post alone doesn't capture.

### X Link Processing Model (Refined Mar 9 evening)

**Pass 1: Quick scan.** Read each post, assess signal, note author/tier. No Chrome contention needed beyond reading the post. Cluster links by theme as patterns emerge.

**During Pass 1, each link gets triaged into one of:**
- **Implement now** — directly applicable, low risk, clear value (e.g., swiftui-pro skill). Skip batch, just do it.
- **Deep research NOW** — S-tier source + directly relevant + time-sensitive. Gets its own Grok session immediately. May spawn AI Council task.
- **Batch for Pass 2** — interesting, worth clustering. Grok adds more value with full context than individual queries.
- **FYI/archive** — noted, filed. No action unless a pattern emerges.

**Pass 2: Cluster and target.** Group batched links by theme. Build targeted Grok prompts that cross-reference multiple posts. One Grok session per cluster beats 20 individual sessions — better prompts, better insight, less account risk.

**Pass 3: Grok deep dives.** Targeted sessions on clusters or breakout items. Community discourse, practitioner feedback, cross-references. One session can cover 3-5 related posts.

**Pass 4: Route and feed back.** Curated "5 items to consider" — not 100 raw links. User toggles what to implement. System executes.

**Breakout criteria (skip batch, act immediately):**
- S-tier Person of Interest + direct ecosystem relevance
- Time-sensitive (deadline, limited availability, competitor move)
- Zero-risk implementation (skill install, config change, reference doc)
- User explicitly flagged as urgent

**Account safety:**
- Max 5-8 Grok interactions per session
- 30+ seconds between prompts
- No rapid-fire multi-tab Grok
- Stop immediately if CAPTCHA or unusual behavior
- Space large backlogs across days

### Tools & Repos Recommendation Framework

When X links surface tools, repos, or frameworks, they need a structured assessment — NOT blind implementation. User must always know what's being implemented and why.

**Implementation tiers:**

| Tier | Criteria | Example | Action |
|------|----------|---------|--------|
| **Safe install** | Known author, skill/config only, no code execution, trusted source | swiftui-pro from twostraws (Paul Hudson) | Install with user awareness. Explain what it does. |
| **Docker trial** | Interesting architecture, unknown safety, needs evaluation | Paperclip (zero-human company orchestration) | Isolated container test. Never on main system first. |
| **Architecture inspiration** | Great concept, can't/shouldn't run the actual tool, but the MENTALITY applies | Karpathy's autoresearch → inspired our looping agent improvement pattern | Extract the principle, design our own agent/process based on it. |
| **Track for later** | Interesting but infrastructure not ready, or too risky now | GPU-heavy tools, beta APIs, unproven frameworks | Log in tools recommendation list, revisit when conditions change. |
| **Do not implement** | Security risk, unvetted source, unclear benefit, too complex for current state | Random npm packages, unaudited agents, anything requiring broad permissions | Note why, archive. |

**Running tools recommendation list** should live as a section in this brief or as tagged Supabase items (tag: `tool-candidate`). Each entry needs: source, what it does, safety assessment, recommended tier, and WHY.

**Critical rule: NEVER implement without user awareness.** Even "safe" installs get explained first. User must know what was added and be able to verify/remove it. This is non-negotiable for security.

## fleetingthoughts.app — Live Site Audit (Mar 9 Chrome walkthrough)

### Pages & What They Do

| Page | Purpose | State |
|------|---------|-------|
| **Dashboard** | Command center: agent status (22/21 OK), morning digest, action plan, recommendations (7 pending, 1 auto-applied), CRITICAL/IMPORTANT/Stale/Reconciled tags | Working well |
| **Board** | Kanban pipeline: Inbox(26) → Processing(0) → Routed(1) → Links(37) → Review(0) → Done(12) → Archived(279). 355 total items. Filter tabs: All, Links(122), Actions(10), Intel | Core pipeline UX |
| **Media** | Social media queue: 12 posts pending review across 4 apps. Approve/Reject per post. Scheduled times, character counts, media type tags (VIDEO/IMAGE). Per-app counts. | Marketing output stage |
| **Products** | App Store analytics: lifetime totals (880 impressions, 50 downloads, 19 first-time). Per-app breakdown. Smart recommendations (conversion bottlenecks, YouTube targets). | Analytics dashboard |
| **Agents** | Agent directory: 21 agents in 5 categories (Security 2/2, Platform 5/5, Market 4/4, Operations 8/8, Processing 2/2). Descriptions, schedules, run durations. | Agent visibility |
| **Analytics** | Operational metrics: 676 runs (30d), 44% success rate, 2.5m avg duration. Revenue Ladder ($200-$1500 tiers). Agent Activity chart (14d). Pipeline Status donut. App Portfolio with pricing. Most active agents list. | Ops intelligence |

### Board Issues Observed
- **Done (12) not auto-archiving** — items sit in Done, inflate active count, visually confusing
- **Duplicate captures** — same X links appearing twice (amank1412, scobleizer, vercel_dev, huggingface)
- **X links dominate inbox** — 20+ of 26 inbox items are x.com share extension links, drowning dictated thoughts
- **Card detail view** — clicking a card shows full text + 3 buttons: Review, Done, Archive. No "Route to project" or "Research" or "Send to marketing" options. Triage is binary (done/archive), not routing.
- **Source tags visible** — share_extension, iphone-dictation, mobile, manual. Category tags: x-link, general, reference, idea, extracted. Labels work but overlap.

### Pipeline Flow Gaps (from site observation)
- Board has no "Research" column — items that need deeper investigation have nowhere to go except back through the manual process
- No connection visible between Board items and Media queue — the routing from pipeline → marketing is invisible
- Recommendations on Dashboard are agent-generated but the Board items are user-captured — two separate streams with no visible bridge
- The "Actions (10)" filter exists but actions don't have their own column or lifecycle

### What's Working Well
- Dashboard recommendations with criticality tiers (CRITICAL/IMPORTANT/Stale/Reconciled) and approve/auto-apply
- Media queue with per-app posting schedule and approve/reject workflow
- Agent directory with category grouping and health status
- Analytics with revenue targets and conversion recommendations
- Capture bar present on every page (persistent capture)

## Existing X Link Processing System (Discovered Mar 9 — was NOT in /fleeting skill)

The weekend work produced a complete X link processing system that the /fleeting skill and pipeline docs don't reference at all. This is the core of what needs to be integrated.

### Documents That Exist

| Doc | Path | What It Is |
|-----|------|------------|
| Grok Extraction SOP | `AGENTIC/agents/prompts/grok-extraction-sop.md` | Complete 149-line SOP: 3 execution modes, rate limits, gotchas |
| Person of Interest | `AGENTIC/PERSON_OF_INTEREST.md` | **15 people** (updated Mar 9), S/A/B trust tiers, Company of Interest section added, processing rules per tier |
| Batch 1 (Mar 5) | `AGENTIC/_briefs/x-links-batch-2026-03-05.md` | 18-item extraction, first batch |
| Chrome Pipeline Test (Mar 7) | `AGENTIC/_briefs/chrome-grok-pipeline-test-2026-03-07.md` | End-to-end Chrome MCP test, 5/5 extractions, 9.2/10 avg quality |
| Batch 2 (Mar 8) | `AGENTIC/_briefs/intelligence-x-links-2026-03-08.md` | 3-item batch with platform comparison |
| Grok prompts/responses | `AGENTIC/_briefs/grok-prompts.md`, `grok-responses.md` | File-based mode storage for quality tracking |
| Research Prompt Log | `AGENTIC/experiments/RESEARCH_PROMPT_LOG.md` | Every research prompt tracked with quality scoring |
| Chrome MCP reference | `AGENTIC/agents/prompts/tool-reference-chrome-mcp.md` | Chrome MCP capabilities doc |

### Proven Prompt Templates (5 tested, rated)

| Template | Purpose | Quality | Best For |
|----------|---------|---------|----------|
| A: Deep Analysis | Structured technical breakdown | 9/10 | Technical announcements |
| B: Tech Deep-Dive | SDK/framework impacts | 9/10 | Developer-facing releases |
| C: Person/Project Analysis | Key account insights | 10/10 | S/A-tier people posts |
| D: Multi-Post Batch | Prolific posters (3+ posts) | 8/10 | Related topics only |
| E: Revenue/Strategy | Business tactics | 10/10 | Revenue, growth, founder insights |

### Routing Rules (Post-Extraction)

| Content Type | Destination | Priority |
|-------------|-------------|----------|
| Actionable + deadline | Supabase via intelligence-post.sh | High |
| Actionable, no deadline | Supabase via intelligence-post.sh | Medium-High |
| Strategic reference | Supabase via intelligence-post.sh | Medium |
| Technical reference | Knowledge DB (index-documents.py) | — |
| Tangential/tracking | Archive original capture | — |

### Key Philosophy (User-Clarified Mar 9)

**The goal is NOT inbox zero. The goal is harnessing actionable insight.**

- X links are the highest-signal intelligence feed in the ecosystem
- Processing means: extract insight → evaluate cross-ecosystem relevance → route to implementation/research/tracking
- Some items get IMPLEMENTED immediately (e.g., twostraws SwiftUI Agent Skill → goes straight into skills/)
- Some go to AI Council for deeper research (Grok/Gemini)
- Some update Person of Interest registry (new people to track)
- Some are awareness-only (file in knowledge DB, no action)
- Safety/security items get tracked but NOT implemented until user reviews
- The pipeline should answer: "What can we DO with this?" not "How do we file this?"

### What's Missing (Integration Gaps)

1. ~~/fleeting skill (474 lines) doesn't mention ANY of this system~~ **FIXED** — skill rewritten, references X link system + POI + AI Council
2. No auto-triage agent for X links specifically — **STILL OPEN**
3. ~~Person of Interest registry not consulted during processing~~ **PARTIALLY FIXED** — skill now references POI, but no automated consultation yet
4. Prompt template selection is manual (should be automatic based on content/author) — **STILL OPEN**
5. Quality tracking (grok-prompts/responses) not feeding back into template improvement — **STILL OPEN**
6. No bridge between processed intelligence and project checklists/marketing queue — **STILL OPEN**
7. "Done" items on the board don't reflect what was extracted — just that they were touched — **STILL OPEN**

## AG-55 Status Update (Mar 9 evening)
- Today's 22/21 runs were MANUAL tests to verify agents work after the delimiter fix
- **Tonight is the REAL overnight test** (AG-55 Phase 3) — close terminals, let auth-keepalive + bracket fix handle it
- Check results tomorrow morning with `/review-experiment`

## Pipeline Redesign (Emerging — Mar 9 evening discussion)

### Two-Stage Processing Model

**Stage 1: Insight Extraction** — Read the link/thought, pull out what it is, document the content, note the source. This is what we did with the 5 links today. Output: documented insight in a brief or intelligence item. The CARD itself is now just a reference — the value has been extracted into the ecosystem's docs.

**Stage 2: Insight Assessment** — Is this useful for any of our apps? Our ecosystem? Is it a tool candidate? A competitive signal? Just awareness? This is the deeper evaluation that answers "so what?" Cross-reference against current projects, checklists, strategic direction. Maybe involves AI Council (Grok → Gemini → Claude cross-reference).

These might be combined for simple items but are distinct for complex ones. Some items need Stage 1 only (FYI/awareness), some need both stages (tool evaluation, implementation candidate).

### Board Column Redesign (Refined Mar 9 — USER CONFIRMED DIRECTION)

**Current columns:** Inbox → Processing → Routed → Links → Review → Done → Archived

**Problems with current setup:**
- Done is a dead end (118 items in Supabase! Board only shows 12) — agents dump output here
- Agents (intelligence-feed, asc-metrics, reconciler) POST with `status: "done"`, creating massive spam
- Duplicate podcast summaries (~50+), duplicate metrics snapshots (~20+) clogging Done
- Processing and Review columns always empty — dead weight
- Archived (292) inflates the total count (361) — makes active pipeline look overwhelming
- No distinction between "extracted intelligence" and "truly finished"
- No feed-back mechanism for processed intelligence to reach user
- No separation between agent output and user-processed items
- Processed items display as raw URLs — ai_analysis field has readable summaries but board cards don't show them

**Confirmed direction (Refined Mar 9 late — USER CONFIRMED):**

**Kill Processing and Review** — always empty, nobody uses them.

**Separate agent output from user flow.** Agents get their own lane (Agent Queue → Agent Log). User items flow through Intel. No mixing.

**Active count = Inbox + Links + Intel + Agent Queue ONLY.** Agent Log and Archived do NOT count toward active totals.

**Confirmed column flow (6 columns):**
- **Inbox** — user captures (non-URL). Raw, unprocessed.
- **Links** — URLs auto-route here (X links, reference URLs, YouTube, GitHub). Auto-sorted from inbox.
- **Intel** — processed items with readable analysis. User reviews, decides next step. Can have actionable checklists. User toggles what to implement. Items here have been extracted/researched — they're intelligence, not raw captures.
- **Agent Queue** — items user forwards for agent handling ("go research this", "implement this"). Agents pick up and process.
- **Agent Log** — agent output. Both autonomous results (metrics, reconciler, podcast summaries) AND completed Agent Queue items. User glances when they want, archives when reviewed. Replaces "Done" as agent dumping ground.
- **Archived** — end state. Fully consumed. Retains all tags for search/reference. Does NOT count in active totals.

**Flows:**
- User capture: Inbox → Intel → Archived (or → Agent Queue if agent follow-up needed)
- URL capture: Links → Intel → Archived (or → Agent Queue)
- Agent autonomous output: straight to Agent Log (NOT Done, NOT Inbox)
- User→Agent handoff: Intel → Agent Queue → Agent Log → Archived

**Intel is a feed, not a task list.** User can:
- Browse summaries on dashboard + iPhone app
- Toggle recommended actions → agents implement
- Override with custom direction
- Just glance without acting
- Archive when done reviewing (or auto-archive after 24-48h)

**Intel → Archived** when user is done reviewing. Archived items retain ALL tags.

**Agent script changes: DEFERRED.** Agents already POST with `status: "done"`. For now, just rename the "Done" column to "Agent Log" on the board UI. Agents keep using `done` status — no code changes. In a future dedicated session, optionally migrate to a new status value. Don't break working agent code for a rename.

**Display fix needed (NOT NOW):** Board cards show raw URLs. The `ai_analysis` field already contains readable summaries (e.g., "A-tier John Rush. Death of Marketing thesis"). Board should render ai_analysis on cards, not just content. This is a fleetingthoughts.app code change.

**Tag dimensions (two layers):**
1. **Project tags:** Spatialis, WaypointHub, Baoding, UtterFlow, Media, AGENTIC, Construct, Website, Network — specific pipeline destinations
2. **Type tags:** research, tool-candidate, project-idea, implement, reference, x-link, podcast, article, intel, action — what kind of item it is

When a project tag is applied, that item enters the project's pipeline. The project's agents should pick it up, cross-reference against the master checklist, and process/implement accordingly. **This is the endgame: user tags → agents research → agents implement → user gets results.**

**Share Extension upgrade (future — expanded scope):**
- At capture time, user can: add voice commentary, assign to a specific project, add type tags
- Two tag selectors: project (Spatialis, Media, AGENTIC...) + type (research, implement, idea...)
- Free-text annotation field for intent ("build this", "check what this company does", "implement into media team")
- This dramatically improves agent triage — agents know user's intent without guessing
- Future state: user leaves a fleeting thought like "fix this button on the site" → agent picks it up, identifies the project, and just does it

**Intel item structure (what an Intel card looks like):**
- Original content (link, thought, podcast reference)
- AI-generated summary/analysis
- Source + author + trust tier (from Person of Interest)
- Project association (if any)
- **Actionable checklist** — numbered list of recommended next steps, each toggleable
- User can: approve individual actions, dismiss, add notes, or override with custom direction
- Approved actions flow to agent pipeline → autonomous implementation → user gets results

### Auto-Routing Rules (TO BE BUILT)

| Tag | Auto-Route To | Agent Action |
|-----|--------------|-------------|
| `x-link` | Links column | Queue for Pass 1 scan |
| `research` | Research column | AI Council picks up: Grok → Gemini → Claude |
| `implement` | Routed (to relevant project) | Check against project checklists |
| `tool-candidate` | Tool Candidates | Safety assessment + implementation tier |
| `reference` | Links or Archive | Note in knowledge DB, low-priority |

### Research Depth Tiers

| Depth | When | Process |
|-------|------|---------|
| **Quick look** | Interesting but not urgent. Just track trajectory. | Read, note, archive. 2 min. |
| **Standard** | Potentially useful. Worth understanding. | Extract insight, assess relevance, document. 5 min. |
| **Deep research** | High signal, directly relevant, or user-flagged. | Full AI Council: Grok (X community + discourse) → Gemini (cross-reference) → Claude (ecosystem assessment). 15-30 min. |

### Cross-Ecosystem Filter (Applied during Stage 2)

Every assessed item should answer:
1. Is this useful for any of our 4 live apps? Which one(s)?
2. Is this useful for our agent ecosystem (AGENTIC)?
3. Is this a tool we should evaluate?
4. Is this a person we should track?
5. Is this just a snapshot of where the industry is moving? (Track trajectory, no action)
6. Is there a specific implementation we should consider?

### Current Gap: Closing the Loop

The 5 links processed today went through Stage 1 (insight extraction) but:
- Cards are still in Inbox (not moved)
- Intelligence not POSTed to Supabase
- Stage 2 assessment was light (noted in brief but not formally evaluated against ecosystem)
- No auto-archive mechanism exists

**Next session should:** Move ALL 18 processed links to archive (insight is in this brief), POST intelligence items to Supabase, and start designing the auto-routing and two-stage pipeline. **This is the #1 open action item — the loop is not closed until these cards move and intelligence is POSTed.**

## Pass 1 Scan — Session 2 (Mar 9 evening, 13 additional links)

### Scan Results

| # | Author | Handle | Content | Views | Signal | Cluster | Triage |
|---|--------|--------|---------|-------|--------|---------|--------|
| 1 | Peter Steinberger | @steipete | Joining OpenAI, OpenClaw becoming foundation | 5.3M | High | C: steipete tools | POI added (A-tier) |
| 2 | Peter Steinberger | @steipete | gogcli 0.12.0 — Google Workspace CLI (brew install) | 106.7K | Med-High | C: steipete tools | Tool candidate |
| 3 | Peter Steinberger | @steipete | discrawl — Discord crawler, SQLite + FTS5, 660K msgs | 289.2K | Med-High | C: steipete tools | Architecture inspiration |
| 4 | Tobi Lutke | @tobi | Karpathy autoresearch overnight, +19% quality, 37 experiments | — | **HIGH** | A: autoresearch | POI added (S-tier). Breakout. |
| 5 | Three.js | @threejs | Shield VFX demo video | 67.4K | Low-Med | D: 3D/spatial | **PROJECT IDEA**: build similar effects in visionOS |
| 6 | Aman | @amank1412 | AI particle simulator — prompt→generate→export HTML/React/Three.js | 155.7K | Medium | D: 3D/spatial | **PROJECT IDEA**: user wants to build this |
| 7 | Riley Brown | @rileybrown | "Figma for AI Agents" — Paper + Claude Code + OpenClaw design | 144.8K | Med-High | C: steipete tools | Tool candidate. POI added (B-tier) |
| 8 | Zubair Creations | @zubair_dev6 | Gaussian splatting for architecture (WebGL/R3F) | 17.6K | Medium | D: 3D/spatial | Research: Gaussian splatting on Vision Pro |
| 9 | Alex Finn | @alexfinn | "The great equalizer" — autoresearch commentary, own your intelligence | — | Medium | A: autoresearch | Derivative of Karpathy. Sovereignty thesis. |
| 10 | JUMPERZ | @jumperz | Discord as agent orchestration layer, discrawl live | 13.8K | Med-High | B: agent orchestration | Architecture inspiration. POI added (B-tier) |
| 11 | Hsoumix | @kesslerrrx | OpenClaw + Discord + discrawl, agents search SQLite locally | 12.4K | Medium | B: agent orchestration | Duplicate of #10, same thread |
| 12 | Robert Scoble | @scobleizer | Synthetic Data Playbook — 1T tokens, 90 experiments, HuggingFace | 14.7K | **HIGH** | A: autoresearch | Deep dive done (see below). POI added (A-tier) |
| 13 | Greg Isenberg | @gregisenberg | AI agency repo — 55+ agents, 9 depts, includes visionOS spatial computing | — | **HIGH** | B: agent orchestration | Evaluate repo. POI added (A-tier) |

### Clusters Identified

**Cluster A: Autoresearch / Self-Improving Agents** (HIGH — Grok Pass 2 priority)
- Tobi Lutke: Shopify CEO validating overnight autonomous improvement (our exact pattern)
- Alex Finn: "Own your intelligence" sovereignty thesis
- Scoble/HuggingFace: Synthetic Data Playbook (1.35B rows, free, open-source)
- *Session 1:* Karpathy autoresearch, Alex Finn DGX Spark

**Cluster B: Agent Orchestration / AI Company** (HIGH)
- Greg Isenberg: 55+ agent AI agency with visionOS spatial computing dept (10K stars/7 days)
- JUMPERZ + kesslerrrx: Discord orchestration + SQLite local search (our exact pipeline pattern)
- *Session 1:* Paperclip (dotta), John Rush death of marketing

**Cluster C: Steipete Tools Ecosystem** (MEDIUM — tool candidates)
- OpenClaw foundation (agent framework, now backed by OpenAI)
- gogcli: Google Workspace CLI — potential agent tool for Google service integration
- discrawl: Discord→SQLite — architecture inspiration (mirrors our Supabase→SQLite)
- Riley Brown: Paper design tool for Claude Code + OpenClaw

**Cluster D: 3D / Spatial** (PROJECT IDEAS — not intelligence, implementation)
- Three.js shield VFX → can we build in visionOS/RealityKit?
- AI particle simulator → user explicitly wants to build this
- Gaussian splatting → research: how to leverage on Apple Vision Pro?

### Deep Dive: Synthetic Data Playbook (Scoble link)

**FinePhrase** by HuggingFaceFW:
- 1.35 billion rows of synthetic data (FAQ, math, tables, tutorials)
- Generated using SmolLM2-1.7B-Instruct from fineweb-edu educational data
- 90 experiments, 100K+ GPU hours, 1T+ tokens generated
- Free and open source (ODC-BY license)
- Downloadable: `load_dataset("HuggingFaceFW/finephrase", "all")`
- Quality metadata per row: language scores, token counts, generation stats
- Relevant to our autoresearch strategy — reference for quality synthetic data generation
- HuggingFace flagged as high-signal platform for AI Council monitoring

### Project Ideas Captured (from user feedback)

| Idea | Source | What | Priority |
|------|--------|------|----------|
| Three.js-style VFX in visionOS | @threejs shield effect | Port web 3D effects to RealityKit/visionOS | Explore feasibility |
| AI particle simulator | @amank1412 | Prompt→generate→visualize particle systems. User: "I want to build this" | High interest |
| Gaussian splatting on Vision Pro | @zubair_dev6 | Photorealistic rendering via Gaussian splatting in visionOS apps | Research needed |

### Person of Interest Updates (this session)

Added 6 new: Tobi Lutke (S), steipete (A), Scoble (A), Greg Isenberg (A), Riley Brown (B), JUMPERZ (B).
Added HuggingFace + GitHub Trending as monitored platforms.

## Decisions Made

- Intelligence routing goes through existing systems (Supabase, Person of Interest, strategic-context). No new filing cabinets.
- Tools recommendation uses 5-tier framework (safe install → do not implement)
- NEVER implement without user awareness (security-first, non-negotiable)
- Grok is essential for X links but batched by cluster, not per-link (account safety + better prompts)
- Breakout items (S-tier + direct relevance) skip batch, get immediate attention
- swiftui-pro installed as proof of pipeline → implementation pathway

## X Link Processing Playbook (PROCESS DOCUMENTATION — for replication)

> This section documents the exact methodology used in the Mar 9 session so future agents can replicate it without user oversight.

### Tools Used and How

| Tool | How We Used It | Mode/Settings | When to Use |
|------|---------------|---------------|-------------|
| **Chrome MCP → X** | Navigate to each X link, screenshot to read post content. `get_page_text` often fails on X — use `screenshot` as fallback. | Direct URL navigation per link | Pass 1: reading every post |
| **Chrome MCP → SuperGrok** | Open x.com/i/grok, switch to **Expert** mode ("Thinks hard"), type cluster-level research prompt, send and let it cook | Expert mode for deep research. Max 5-8 prompts per session. Be patient. | Pass 2: community discourse on high-signal clusters |
| **Chrome MCP → Gemini** | Open gemini.google.com, switch to **Thinking** mode ("Solves complex problems") via mode picker button (ref_16 in page), type research prompt | Thinking for deep analysis. Pro for code/math. Fast for quick lookups. | Pass 2: cross-referencing, framework evaluation, strategic questions |
| **WebSearch** | Find URLs when Chrome can't extract them (e.g., HuggingFace dataset URL from Scoble's quoted tweet) | Standard | When you need to find a resource URL without clicking links in X |
| **WebFetch** | Read dataset/page content directly when Chrome can't render JS-heavy pages (HuggingFace Spaces failed, dataset page worked) | With detailed extraction prompt | Deep diving into linked resources |
| **Person of Interest registry** | Check incoming author against registry. Update trust tiers based on user feedback. Add new people when user flags them. | Direct file edit | Every link — check author first |
| **Audit brief** | Document everything in real-time. Scan results, clusters, deep dives, decisions, heuristics. Single source of truth. | Append-style edits | Continuously during processing |

### The Multi-Tab Parallel Pattern

**Key insight:** Don't wait on one tool. Open multiple browser tabs and multitask:
1. Fire off Grok Expert prompt on Cluster A → let it think (takes minutes)
2. Switch to Gemini tab, fire off Thinking prompt on Cluster B → let it think
3. Switch to X tab, keep scanning more links while both AI Council members process
4. Come back to read Grok results when ready
5. Come back to read Gemini results when ready

This was the first session using this pattern. It works. Chrome MCP supports multiple tabs in the same tab group. Use `tabs_create_mcp` for new tabs, navigate each independently.

### Pass 1 Methodology (Quick Scan)

**Per link (30-60 seconds each):**
1. Navigate to X link URL in Chrome tab
2. Wait 3s for page load (X is slow)
3. Screenshot to read the post (more reliable than `get_page_text` on X)
4. Capture: author, handle, content summary, view count, engagement, date
5. Check author against Person of Interest registry
6. Quick signal assessment: High / Medium-High / Medium / Low
7. Assign to cluster (or note as standalone)
8. Triage: implement now / deep research / batch for Pass 2 / FYI-archive / project idea
9. Move to next link

**Clustering happens live** — as themes emerge during scanning, group links together. Named clusters make Pass 2 Grok prompts much better (one prompt per cluster > one prompt per link).

### Pass 2 Methodology (AI Council Deep Research)

**Per cluster (one Grok + one Gemini prompt):**
1. Write a targeted prompt that references ALL posts in the cluster and asks specific questions
2. Include context about what we already know and what we need to learn
3. Ask for practitioner perspective, not just hype
4. Ask for limitations and criticisms (not just benefits)
5. Ask about our specific context (Apple Silicon, macOS, visionOS, launchd agents)
6. Use Expert/Thinking mode — this takes time but produces real insight
7. Multitask while AI Council processes

### User Evaluation Heuristics (for autonomous processing)

These rules let an agent evaluate links WITHOUT user input:
1. **Check author tier** — S-tier gets deep dive, A-tier gets thorough analysis, B-tier gets caveats noted, unknown gets standard
2. **Check company** — Anthropic updates = near-100% implement. HuggingFace = research pipeline. Perplexity = evaluate.
3. **Builders > commentators** — someone shipping code (steipete) outranks someone sharing opinions (Alex Finn)
4. **Marketing filter** — if author sells products (Greg Isenberg, Riley Brown), note the angle. Learn from their tools, not their pitches.
5. **"Can we use this?"** — every link gets evaluated against: our visionOS apps, agent ecosystem, media pipeline, strategic direction
6. **"Can we build this?"** — visual/3D content = potential project idea for Spatialis/WaypointHub
7. **Architecture inspiration** — even if we don't use the tool, the PATTERN might apply
8. **"Directionally yes, later"** — some ideas are right but infra isn't ready. Track, don't discard.
9. **Breakout criteria** — S-tier + direct relevance + time-sensitive = skip batch, act immediately

### What Worked Well

- Multi-tab parallel processing (Grok + Gemini + X simultaneously)
- Clustering before Grok prompts (better context = better answers)
- Screenshot as primary X reading method (more reliable than text extraction)
- Running commentary from user during processing (captures nuance for automation rules)
- Real-time audit brief updates (nothing lost between context compactions)

### What to Improve Next Time

- Use Grok on EVERY high-signal link from Session 1 (we skipped Grok entirely in Session 1)
- Add user intent annotation at capture time (Share Extension comments field — feature request)
- POST intelligence to Supabase as links are processed (not as batch at end)
- Move processed cards on board in real-time (not deferred)
- Track Grok prompt quality (rate responses, compare Expert vs Fast)

## Restructuring Plan (Status Updated Mar 9 evening)

1. ~~Trim /fleeting skill to ~200 lines (actionable instructions only)~~ **DONE**
2. Move reference material to FleetingThoughts/ hub docs — TODO
3. ~~Establish clear tool hierarchy (Gen 1 archived, Gen 2 primary, Gen 3 supplementary)~~ **DONE** (in rewritten skill)
4. Update pipeline MASTER_CHECKLIST.md with March state — TODO
5. Decide: ledger stays in legacy repo or moves to FleetingThoughts/? — TODO
6. Address Gen 1 scripts: archive or delete? — TODO
7. Cross-reference AGENTIC agents into pipeline docs — TODO (FleetingThoughts/AGENTS.md still stale, Feb 10)
8. Fix status lifecycle: inbox → processing → done → archived (auto-archive?) — TODO (**CRITICAL** — 18 processed items stuck in inbox)
9. Clarify capture channel labels so source is distinguishable — TODO
10. Build general-purpose auto-triage agent (not just podcast/user-action subtypes) — TODO
11. Evaluate permission modes — which agents can safely run nuclear/acceptEdits? — TODO
12. **NEW:** Close the loop on 18 processed X links — PATCH to archived, POST intelligence to Supabase — **NEXT ACTION**
13. **NEW:** Verify knowledge DB indexed this brief (AG-63, check Mar 10 afternoon)
14. **NEW:** Design unified intake pipeline for X links + podcasts + articles (AG-64)

## AI Council Results — Session 2 (Mar 9 evening)

### Grok Expert: Autoresearch & Self-Improving Agents (Cluster A)

Prompt asked about practitioner reality (not hype) around Karpathy's autoresearch, Tobi Lutke's results, HuggingFace Synthetic Data Playbook, and the "own your intelligence" discourse. Grok Expert thought for 48 seconds, cited 7 X posts.

**Key findings:**

**Autoresearch mechanics:** ~630-line minimalist nanochat LLM trainer. Write `program.md` strategy, agent (typically Claude/Code) edits `train.py`, runs fixed 5-min single-GPU experiments on git feature branch, evaluates validation loss, commits improvements. Loops overnight (50-100+ experiments). Goal: fastest possible indefinite research progress with zero human involvement after the prompt.

**Karpathy's own results:** 650-700 experiments over ~2 days on depth-12 model. Surfaced ~20 additive changes (scaler to Value Embeddings, parameterless QKNorm, regularization, fixing AdamW betas, tuning weight-decay). Transferred to depth-24 model: "Time to GPT-2" from 2.02h → 1.80h (11% real leaderboard improvement). He called it the first time he'd seen an agent execute the full manual-iteration workflow he's done for 20 years.

**Tobi Lutke (Shopify CEO):** Adapted for internal 0.8B query-expansion model. 37 experiments / ~8 hours → **+19% validation score**. Smaller agent-optimized model beat his prior manually-tuned 1.6B version. Highlighted unexpected insights from watching iteration history. This is the practitioner story X is amplifying — real production metric lift on modest hardware with zero manual coding after setup.

**FinePhrase/Synthetic Data Playbook:** Frequently cited as the "manual counterpart" or parallel track — systematic synthetic-data experimentation that pairs naturally with autoresearch-style loops for better training data inside the same self-improving cycle.

**What practitioners are actually doing (not just reposting):**
- Forking and adapting to domain-specific metrics: SSL prototypes on M1, gradient-boosting for stock-signal models, conversion-rate/SEO/prompt-optimization loops, healthcare/legal/finance custom trainers
- Running overnight "wake-up-and-merge" workflows: git history + loss curves + notebook of what the agent tried. Extending with TinyStories or custom small datasets, lowering DEPTH to 4-6 to fit consumer GPUs or Macs
- Pairing with synthetic data playbooks: FinePhrase release seen as data-generation side of the same recursive loop
- Building cheap 24/7 personal labs: Qwen3.5-Max, GLM-4.7, Kimi at $3-10/month do heavy token work; Claude/Code orchestrates. No frontier-scale compute required.

**Apple Silicon / Mac-specific implementations:**
- `trevin-creator/autoresearch-mlx` — native MLX, no PyTorch. "Cheapest ever autonomous research" for Macs
- `miolini/autoresearch-macos` — MPS support. Successful runs on M1 Max and Mac Minis
- Tips circulating: use `--worktree` + safe flags, reduce model size, pair with affordable coding LLMs

**Biggest criticisms (practitioner tone, not hype):**
1. **Hyperparam/arch tuning only** (so far) — validation loss works great; weaker at generating truly novel hypotheses or paradigm shifts
2. **Long-loop context/memory erosion** — by experiment ~50+, agent forgets why earlier ideas were rejected; state management is a pain
3. **Implementation fragility** — many LLM-suggested architecture changes crash 5-min GPU runs. Codex struggles with indefinite loops (GitHub issue #57; Karpathy pinged OpenAI)
4. **Scaling questions** — single-file nanochat is a perfect sandbox, but real codebases need agent swarms, shared knowledge graphs, efficient proxies
5. **Hardware/setup friction** — CUDA-only originally, fixed fast by community forks

**Overall practitioner consensus:** Impressive incremental gains that transfer and surface blind spots, but not yet "PhD-level research." The real unlock is the *loop design* — metric, constraints (5-min runs), and prompt quality — plus the stamina of agents that never get demoralized.

**"Owning your intelligence" vs frontier API discourse:**
- Autoresearch framed as democratizing recursive self-improvement on consumer hardware
- Anyone with a single GPU or Mac can run a personal "research lab" that iterates 24/7, owns the resulting IP/models/data, escapes rate limits/costs/black-box dependency
- Agent may still call Claude for coding decisions, but the training loop, evaluation metric, and final model stay local and customizable
- Practitioners call it the shift from "consumer" to "1-man lab" — especially powerful when paired with open nanochat + synthetic data playbooks
- Frontier labs doing scaled versions internally, but the repo makes the pattern accessible today. Sovereignty, customization for niche domains, and cheap iteration win out for many practitioners over always hitting the API.

**Bottom line from X practitioners:** Autoresearch isn't magic or replacement-level yet, but it's the clearest early demo of the self-improving loop pattern that will compound. The skill ceiling is now "write a great research prompt + design a tight evaluation arena"; the drudge work is gone. People are forking, adapting, and waking up to measurable gains on their own hardware.

### Gemini Thinking: Agent Orchestration & 24/7 Autonomous Operation (Cluster B)

Prompt asked about the agentic landscape in March 2026: the viral 55-agent agency repo, promising open-source frameworks, production coordination patterns for multi-agent systems, and the path from our 27 launchd agents to true 24/7 autonomous operation by April 2026. Gemini used Thinking mode.

**TLDR — The Agentic Landscape in March 2026:**
- **Viral Repo:** `msitarzewski/agency-agents` (aka *The Agency* or *Legion*) by Mateusz Sitarzewski. **61 agents** across 9 divisions, including a high-end Spatial Computing department (Vision Pro/visionOS, WebXR, Metal optimization)
- **Leading Frameworks:** LangGraph (deterministic control), Microsoft Agent Framework (AutoGen successor), **OpenClaw** (now backed by OpenAI)
- **Production Patterns:** Discord/Telegram as "Human-in-the-loop" UI, **SQLite-vec** handles local-first RAG, **Temporal** is the industry standard for durable, multi-day execution
- **State of the Art:** Communication moved beyond raw text to **ACP (Agent Communication Protocol)** and **MCP (Model Context Protocol)** for standardized tool/context sharing
- **24/7 Path:** Move from stateless `launchd` scripts to **durable task queues** (Temporal) and implement a **Heartbeat architecture** to prevent "agent drift"

**1. The Viral "Agency" Repo:**
- `msitarzewski/agency-agents` — treats agents as a full corporate hierarchy, not simple prompts
- **Spatial Computing Division:** specialized agents for Vision Pro (visionOS), WebXR, and Metal optimization
- Architecture: "Division & Persona" model — Core Missions, Critical Rules, Technical Deliverables stored as simple Markdown files
- Why it's viral: bypasses complex Python orchestration for "Vibe Coding" approach — drop personas into Claude Code, Windsurf, or Cursor and they "just work"

**2. Promising Open-Source Frameworks (Q1 2026):**
1. **LangGraph** — currently the "pro" choice. Graph-based (nodes/edges), cycle-based logic, time-travel debugging
2. **OpenClaw** — following steipete's move to OpenAI, became the "OS" for personal agents. Local-first, macOS filesystem to messaging apps, built-in security sandboxing
3. **Microsoft Agent Framework** — unified successor to AutoGen + Semantic Kernel. Enterprise-scale multi-agent swarms with native .NET and Python parity
4. **CrewAI (v3)** — easiest for role-playing "Crews," now focuses on "Flows" — deterministic state machines preventing agents from getting stuck in infinite loops

**3. Production Coordination Patterns (bridging "demo vs. reality" gap):**
- **Discord/Telegram Gateway:** Teams use messaging apps as orchestration layer. Agents "chat" in shared channels; humans interject by simply replying
- **SQLite-vec for Local Memory:** For macOS, `sqlite-vec` has replaced heavy vector DBs. 27+ agents share a single, fast, local `.sqlite` file for RAG without Docker or Pinecone. **(WE ALREADY DO THIS — validates our architecture)**
- **Temporal for Durability:** Production agents are "Durable Functions." If power outage or API timeout hits, Temporal ensures agent resumes exactly where it left off, even after days. **(Our launchd approach lacks this — key evolution target)**

**4. State of the Art: A2A Communication:**
- **MCP (Model Context Protocol):** Anthropic-developed, cross-industry standard. Agents plug into each other's tools/data sources without re-writing code. **(We use this via Supabase MCP + Chrome MCP)**
- **ACP (Agent Communication Protocol):** "TCP/IP of Agents" — schema for agents to negotiate "contracts" (e.g., "I need a design file by 5 PM, what is your cost in tokens?"). New standard to track.
- **Structured Output Enforcements:** Pydantic AI ensures agent-to-agent payloads are strictly typed JSON schema, not conversational text

**5. Limitations & Failure Modes:**
- **"The Ralph Wiggum Loop":** Agents constantly confirm receipt — "Got it!" → "Acknowledged!" → "Thanks!" — until context window is full
- **Context Fragmentation:** As agent count grows, "global state" becomes too large for any single agent. Leading systems use "Summarization Nodes" to compress history
- **Agent Drift:** Without a central "Truth Agent," a team of 55 agents will slowly diverge from original product spec as they iterate on small tasks

**Path to 24/7 Autonomous Operation (macOS/April 2026) — Gemini's recommendations for our specific setup:**
1. **Adopt a "Heartbeat" File:** Instead of `launchd` just firing a script, have it trigger a "Supervisor Agent" that reads a `HEARTBEAT.md` file tracking what every agent is currently doing, preventing collisions
2. **Move to the OpenClaw Gateway:** Replace individual `launchd` schedules with the OpenClaw daemon. Handles "always-on" lifecycle and provides a macOS Menu Bar app to monitor "employees"
3. **Local RAG with SQLite:** Consolidate agent memories to unified SQLite with `vec` extension for cross-agent retrieval **(already doing this)**
4. **Circuit Breakers:** "Token Burn" monitor — if 27 agents start a feedback loop while you're asleep, a local script kills the process if API spend exceeds $X in an hour

### AI Council Cross-Reference (Claude Assessment)

**Where Grok and Gemini converge (high confidence):**
- Autoresearch is real and working on consumer hardware (Apple Silicon specifically)
- SQLite-vec is the right local data layer choice (validates our architecture)
- MCP is the emerging standard for agent interop (we're already on it)
- The "own your intelligence" / local-first thesis is gaining practitioner traction
- FinePhrase/synthetic data is the data-generation complement to autoresearch-style loops

**Where they add different value:**
- Grok excels at X community sentiment, practitioner reality, specific repo forks, engagement data
- Gemini excels at framework landscape, production architecture patterns, migration paths, enterprise patterns

**Actionable for our ecosystem:**
1. **HEARTBEAT.md / Supervisor Agent** — implement as next AGENTIC evolution (prevents agent collisions, enables 24/7)
2. **Circuit Breaker / Token Burn monitor** — critical safety for overnight autonomy
3. **Evaluate OpenClaw** as launchd replacement (steipete now at OpenAI backing it, local-first, macOS-native)
4. **ACP (Agent Communication Protocol)** — track as future standard for our agent-to-agent communication
5. **autoresearch-mlx** — evaluate for Apple Silicon research loops (directly relevant to our overnight agent pattern)
6. **agency-agents repo** — evaluate "Division & Persona" Markdown architecture (similar to what we already do with agent prompts)
7. **Temporal** — research as launchd evolution for durable, multi-day agent execution

---

*This brief is the LIVING design document for the pipeline restructuring. It started as a snapshot but now contains all decisions, AI Council findings, process documentation, and the restructuring plan with status tracking. Read this brief in full before making pipeline changes. Last updated: Mar 9 evening (skill rewrite done, AI Council results captured, restructuring plan updated).*
