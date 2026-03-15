# Strategic Direction — DKR Product Ecosystem

> **Purpose:** North star for all product, revenue, and skill-building decisions. Every project, feature, and time investment should trace back to this document.
> **Last Updated:** 2026-02-23
> **Location:** Lives in the DKR Hub docs folder, referenced by CLAUDE.md and CONDUCTOR.md.

---

## The Thesis

These apps were built to learn, ship, and establish a foundation. That phase is ending. Three visionOS apps are live (Spatialis v1.2, WaypointHub v2.0, Baoding launching). The pipeline from idea to App Store works. The question is no longer "can I build?" — it's "what's worth building, and how does it pay for itself?"

The next phase is about **sustainable income from products**, **multiplying limited time through automation and agents**, and **stacking skills that compound** as spatial computing goes mainstream.

---

## Revenue Target

### The Number
**$200/month minimum — $500/month goal**

This covers frontier AI tooling costs:
- Claude Code: ~$200/month
- Google Gemini: covered through 2026 (opportunistic deal)
- Grok: ~$300 upcoming
- ChatGPT: variable

### The Math (Apple pays 70%, or 85% under Small Business Program)

| App | Price | Payout (70%) | Payout (85%) | Sales needed for $200/mo |
|-----|-------|-------------|-------------|--------------------------|
| **Baoding** | $5.99 one-time | $4.19 | $5.09 | ~48 (70%) or ~39 (85%) |
| **Spatialis** | ~$15-20 lifetime IAP | $10.50-14.00 | $12.75-17.00 | ~14-19 |
| **WaypointHub** | $4.99/mo or $9.99 lifetime | $3.49/mo or $6.99 | $4.24/mo or $8.49 | ~57 subs or ~29 lifetime |

**Action item:** Enroll in Apple's Small Business Program (15% commission vs 30%) — not automatic, requires manual enrollment. Bumps every dollar earned by ~21%. May do this when changing business entities. Until then, Apple takes 30%.

### Revenue Reality Check
- 19 downloads total across ~3 weeks, zero conversions yet
- Vision Pro install base is small (~1M devices estimated)
- March onward is when revenue should start appearing
- Baoding's flat $5.99 is the simplest conversion path
- WaypointHub subscriptions are the best long-term model but hardest to convert
- Spatialis lifetime IAP has the highest per-sale value

The bottleneck is **distribution, not product quality**.

---

## Four Pillars

### 1. Distribution (Highest immediate ROI)

Building more apps into a vacuum won't generate revenue. The priority is getting eyes on what exists.

**Actions:**
- App Store Optimization — keywords, screenshots, descriptions for all three apps
- Content marketing — visionOS content is scarce, any video/post gets disproportionate attention
  - YouTube: spatial drawing demos (Spatialis), meditation orb showcase (Baoding), productivity setup (WaypointHub)
  - Reddit: r/VisionPro, r/AppleVisionPro — small community, hungry for apps
- Cross-selling between apps (WaypointHub as the hub — see Platform Strategy below)
- WaypointHub free Pro window (before March 1) to build initial user base and goodwill
- Ratings and reviews — prompt users after meaningful actions (TWEAK-15 in Spatialis checklist)

**Measure:** Downloads/week, conversion rate, first $1 earned.

### 2. Skill Stacking (Compounding investment)

Every new skill should serve at least two purposes. Learn by building things that also generate value.

**Current stack:** Swift, SwiftUI, RealityKit, visionOS, ShaderGraph, Supabase, AI agent workflows

**Next skills to stack:**

| Skill | Why | How to Learn It |
|-------|-----|-----------------|
| **Three.js / WebGL** | Cross-platform 3D. Reaches every browser, not just Vision Pro owners. WebXR bridges to all headsets. | Upgrade existing websites with interactive 3D elements |
| **WebXR** | AR/VR experiences that run everywhere. Three.js is the gateway. | Extend Three.js work to support headset and phone AR |
| **AR glasses dev** | Wearable AR is coming fast (Meta, Apple, others). First movers win. | Monitor SDKs, prototype when hardware arrives, Three.js/WebXR skills transfer directly |
| **On-device AI** | Foundation Models framework (iOS 26), Core ML. Differentiator for apps. | Integrate into existing apps (smart categorization in WaypointHub, AI-assist in Spatialis) |
| **Agent orchestration** | Multiply time. Agents working while you work your day job. | Continue refining the pipeline, build toward autonomous operation |

**The Three.js play specifically:**
- Start with WaypointHub website — interactive 3D portal/orb visualization
- Then Spatialis website — mini 3D drawing demo in browser
- These serve as marketing (interactive demos > screenshots) AND skill building
- WebXR means same code runs on Vision Pro Safari, Quest, phones
- Three.js knowledge transfers directly to AR glasses when SDKs mature

**AR glasses positioning:**
- The tsunami is coming: Meta Orion, Apple smart glasses, others
- visionOS skills + Three.js/WebXR = ready for whatever SDK ships
- Early visionOS experience is the moat — spatial UI patterns, 3D interaction design, gesture systems
- People are already demoing Claude + basic AR glasses for real-time spatial AI — this is weeks/months away from being a product category

### 3. Automation & Agent Leverage (Time multiplier)

48-hour work week + side projects = time is the scarcest resource. Every hour of automation work pays dividends forever.

**Current state:**
- Fleeting Thoughts pipeline: functional but manual
- Ralph build loop: validated (Spatialis) and repeating (Baoding)
- Agent role separation: working (orchestrator/coder pattern)
- Multi-session state: working (progress files, master checklists)

**Next automation targets:**
- Pipeline automation (webhooks, auto-dispatch, command queue) — designed but not built
- Agents that work while you sleep/work — research, processing, monitoring
- Ship prep automation — screenshot generation, ASO optimization, compliance checks
- "Build it once, run it forever" infrastructure

**Goal:** Reduce the ratio of human-hours to shipped-product. The pipeline should get faster with each cycle.

### 4. B2B / Consulting (Simmer — activate when ready)

Three live visionOS apps + AI agent expertise = a compelling pitch to companies wanting spatial experiences.

**Not now, but soon:**
- Companies will want Vision Pro presence, AR experiences, spatial computing prototypes
- visionOS developers are rare
- Your portfolio proves you can ship, not just demo
- The Three.js/WebXR skill adds "we can build for web too" to the pitch
- B2B contracts have higher per-engagement revenue than app sales

**Trigger to activate:** When someone asks, or when app revenue plateaus and you need a new income stream.

---

## Platform Strategy: WaypointHub as the Hub

WaypointHub has a unique position: it's free, broadly useful, and already designed as a launcher. This makes it the **funnel** for the entire ecosystem.

### The Model

```
User discovers WaypointHub (free, useful)
    → Uses it, sees value
    → Discovers other DKR apps via cross-sell links
    → Downloads Baoding ($5.99), Spatialis (freemium + IAP)
    → Optionally upgrades to WaypointHub Pro ($4.99/mo or $9.99 lifetime)
```

### Dual-Role Apps

Build standalone apps that are excellent on their own, then offer a lighter version as a WaypointHub feature. Users get utility from the hub; power users buy the standalone.

**First candidate: Valerian (File Converter)**
- Standalone: Full steampunk transmutation engine, $TBD
- WaypointHub integration: Simpler file conversion utility accessible from the hub
- Build standalone first, get it solid, then port the core functionality

**Future candidates:** Any utility app that makes sense as both standalone and embedded. Focus Timer (v2.1) is already planned as a WaypointHub volume feature — same pattern.

### Cross-Sell Infrastructure
- WaypointHub About section links to all DKR apps
- Each app links back to WaypointHub
- Baoding About section already has cross-sell (confirmed in checklist)
- Every new app gets cross-sell links on day one

---

## Product Roadmap Summary

### Shipped & Breathing (maintenance mode)
| App | Version | Focus |
|-----|---------|-------|
| **Spatialis** | v1.2 LIVE | Distribution push. Fix rough edges only if blocking conversions. |
| **WaypointHub** | v2.0 LIVE | Free Pro window through March 1. Cross-sell hub. v2.1 roadmap exists. |
| **Baoding** | v1.0 launching | Launch, then breathe. |

### Planned (in order of priority)
| Item | Why | When |
|------|-----|------|
| **WaypointHub v2.1** | Focus Timer Volume + App Intents/Siri. The "show your friends" feature. | Next WaypointHub cycle |
| **Website Three.js upgrades** | Skill building + marketing. Interactive demos > static screenshots. | When bandwidth opens |
| **Valerian** | File converter. Standalone + WaypointHub dual-role. SPEC exists. | After distribution push shows results |
| **AI integration** | On-device AI in existing apps (WaypointHub auto-categorize, Spatialis AI-assist). | iOS 26 timeframe |

### Not Building Right Now
- No new apps until distribution proves the existing ones can convert
- No features that don't directly serve revenue or skill-stacking goals
- The pipeline is ready when a clear opportunity appears

---

## Decision Framework

When evaluating what to build or work on next:

1. **Does this generate revenue?** (directly or by driving distribution)
2. **Does this stack a skill that compounds?** (Three.js, AI, agent orchestration, AR)
3. **Does this multiply my time?** (automation, agents, reusable infrastructure)
4. **Does it serve at least two pillars?** (best use of limited hours)

If it only serves one pillar, it better be pillar 1 (revenue). If it serves zero, don't do it.

---

## Research Moat Philosophy

### The Core Principle

**Anyone can build the app. Nobody else will read the papers.**

The competitive advantage isn't code — it's the science underneath. A caption app with uniform word timing is a weekend project. A caption app where "the" passes at 0.7x speed and sentences decelerate at boundaries because Goldman-Eisler (1968), Klatt (1975), and Szarkowska (2018) proved that's how human speech works — that's a product nobody can casually replicate. Users feel the difference without knowing why. That's the moat.

### The Szarkowska Principle

Named after the eye-tracking researcher whose work proved 180 WPM is the cognitive load ceiling for on-screen text. The principle:

**Bake obscure, rigorous science into consumer products so deeply that the research becomes invisible — the user just feels "this is better" without being able to articulate why. Competitors would have to read the same papers to match it, and they won't.**

This applies beyond pacing. Every domain has decades of research that practitioners ignore:
- Haptic feedback has psychophysics research on perception thresholds
- Color has opponent-process theory and chromatic adaptation studies
- Spatial layout has proxemics and personal space research
- Audio has psychoacoustics and masking curves
- Animation has perceptual studies on motion coherence

The opportunity isn't building apps. It's applying science that nobody in the app ecosystem reads.

### The Infrastructure That Makes This Work

The knowledge DB is LIVE — not planned, built. `./search` CLI queries 482 indexed docs (7,287 chunks) across the entire ecosystem via FTS5. The nightly auto-indexer re-crawls and the curator agent surfaces connections automatically. Any session can run:

```bash
./search "cognitive load"        # finds Szarkowska, caption research, XR text studies
./search "phrase-final"          # finds Klatt, prosody research, PacingEngine implementation
./search "haptic perception"     # finds cross-project patterns you didn't know existed
```

This is how research compounds automatically. No manual linking needed — the indexer discovers new docs, the curator finds convergences, and `./search` makes it queryable from any terminal session. Semantic vector search (sqlite-vec + Ollama embeddings) extends this further once Ollama is running.

### Case Study: PacingEngine.swift (Session 15)

The UtterFlow pacing engine traces directly from citation to implementation:

| Research | Finding | Implementation |
|----------|---------|----------------|
| Goldman-Eisler 1968 | 150 WPM conversational baseline | Default pace preset |
| Klatt 1975 | Phrase-final lengthening (30-60% stretch) | Last word before period: 1.5x duration |
| Szarkowska 2018 | 180 WPM cognitive load ceiling (eye-tracking) | Yellow warning at 180 WPM, red above |
| Pellegrino et al. 2011 | Function words = 40% of text, 25% of time | 60+ function words at 0.7x speed |
| BBC Guidelines | 160-180 WPM subtitle standard | Comfort score calibration |
| ElevenLabs patterns | Breathing pauses every 5-8 words | Punctuation pause hierarchy |

Anyone can copy the UI. They can't copy the research depth without doing the research.

### Project Evaluation: The Research Filter

Before committing to build anything, apply these three questions in addition to the four-pillar framework:

**1. Does this connect to research we've already stacked?**
The ecosystem has 40+ research docs, 50+ academic citations, and cross-project patterns. New projects that leverage existing depth compound faster than projects starting from zero. A new speech-related app leverages all the prosody research. A new visual app leverages the cognitive load research. A project with no connection to existing research starts cold.

**2. Can we do one thing impossibly well — with science others won't read?**
The bar isn't "can we build it" — anything can be built. The bar is "can we do it so well that users feel the difference without understanding it, and competitors can't match it without doing the same research?" If the answer is no, it's just another app.

**3. Is it focused enough to be one thing, not five?**
Depth beats breadth. An app that does one thing backed by research beats an app that does five things at surface level. Every feature added dilutes the research advantage. The pacing engine works because it's three layers deep on one problem, not three problems at one layer each.

### Knowledge Compounding Strategy

Research isn't a one-time investment — it compounds:

```
Session N:   Deep dive on speech prosody
Session N+1: Pacing engine uses prosody research
Session N+2: New app idea? Check: does it connect to prosody research?
Session N+3: Marketing copy uses the same timing data
Session N+4: Competitor tries to match — has to start from scratch
```

The more research stacks up, the higher the barrier for anyone else to match the product quality. This is the opposite of code — code depreciates, research appreciates. And with the knowledge DB live, this compounding is automatic — the nightly indexer discovers new research, the curator surfaces connections, and `./search` makes it queryable without knowing where to look.

### Convergence Over Novelty

The most valuable ideas aren't new — they're unique combinations of existing knowledge that nobody else would think to combine. The pacing engine combines:
- 1960s psycholinguistics (Goldman-Eisler)
- 1970s phonetics (Klatt)
- 2018 eye-tracking cognitive science (Szarkowska)
- Broadcasting industry standards (BBC, Netflix)
- Commercial scriptwriting craft (Steve Jobs, teleprompter standards)
- TTS system design (ElevenLabs, SSML)

No single source gives you this. The convergence of all six is what makes it work. Future projects should look for similar convergences — where do multiple research streams intersect in a way nobody has combined before?

---

## Key Dates & Triggers

| Date/Trigger | Action |
|-------------|--------|
| **March 1, 2026** | WaypointHub free Pro window ends. Evaluate download/conversion data. |
| **March 2026** | First month with all three apps live. Revenue baseline established. |
| **April 28, 2026** | Liquid Glass SDK deadline. Affects WaypointHub and Spatialis. |
| **iOS 26 / visionOS 3** | Foundation Models API available. AI integration window opens. |
| **First B2B inquiry** | Activate pillar 4. Have portfolio ready. |
| **$200/month revenue** | AI tooling is self-sustaining. Reinvest in growth. |
| **Business entity change** | Enroll in Apple Small Business Program (15% vs 30% commission) at that time. May coincide with new entity setup. |
| **AR glasses SDK ships** | Immediate prototype sprint. Three.js/WebXR skills ready. |

---

*This document is the "why" behind every "what." Read it when priorities feel unclear.*
