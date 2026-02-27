# Project Manifest

> **Purpose:** Single context file for the Researcher agent (and any agent needing cross-project awareness). One read = full picture of what we build, what we use, and what to watch.
> **Last Updated:** 2026-02-18
> **Status:** Initial draft — expand as projects evolve.

---

## Active Projects

### Spatialis
- **Platform:** visionOS (Apple Vision Pro)
- **Stack:** Swift, SwiftUI, RealityKit, ShaderGraph, RealityKitContent
- **Status:** v1.2 LIVE on App Store (Feb 23, 2026). Breathing — maintenance mode, distribution push.
- **What it does:** 3D/2D spatial drawing app. Draw in your environment, export USDZ/images, precision controls, profile management. Transform Evolution, Showcase, Canvas Expansion shipped in v1.2.
- **Key APIs:** RealityKit rendering, ARKit hand tracking, PhotosUI (export), UniformTypeIdentifiers (USDZ)
- **Planned:** Gallery/Canvas/Studio multi-mode architecture (v2.0 north star), AI-assist features, App Intents + Siri, Liquid Glass
- **Watch areas:** visionOS SDK updates, RealityKit changes, ShaderGraph improvements, competitive drawing/creative apps on Vision Pro, Apple Pencil Pro spatial support rumors, Foundation Models (iOS 26)
- **Checklist:** `Construct/Ideas/Sigil/MASTER_CHECKLIST.md`

### WaypointHub
- **Platform:** visionOS + iOS + iPadOS (universal)
- **Stack:** Swift, SwiftUI, CloudKit (iCloud sync), AppIntents
- **Status:** v2.0 LIVE on App Store (Feb 23, 2026). Free Pro through March 1. Cross-sell hub for all DKR apps.
- **What it does:** Portal launcher. Constellations of link orbs for instant navigation. "Two seconds to anywhere." Dictation capture, shared links inbox, sketch quick capture shipped in v2.0.
- **Key APIs:** CloudKit, AppIntents, SwiftUI animations, LinkPresentation
- **Planned:** v2.1 Focus Timer Volume + App Intents/Siri. v2.2 Widget Power + Volume Polish. v2.5 Intelligence (Fleeting Thoughts integration, Foundation Models). v3.0 MUSE Spatial Notes. Dual-role mini-apps (Valerian file converter first).
- **Watch areas:** visionOS volume APIs, CloudKit changes, App Intents framework updates, Liquid Glass deadline (Apr 28), competitive link/bookmark apps, AR glasses SDKs
- **Checklist:** `Waypoint/MASTER_CHECKLIST.md`

### Baoding
- **Platform:** visionOS
- **Stack:** Swift, SwiftUI, RealityKit, ShaderGraph, SpatialAudio
- **Status:** Ship prep — v1.0 launching (Feb 23, 2026). Code complete: 2 modes (Ambient + Zero-G), 22 patterns, 7 materials, gizmo control, ambient cycling. $5.99 one-time.
- **What it does:** Spatial meditation orbs. Physics-based ball interactions with multiple orbit modes, materials, and formations.
- **Key APIs:** RealityKit physics, ShaderGraph materials, SpatialAudio, ARKit
- **Planned:** v1.1 audio/sound design. Maintenance mode after launch.
- **Watch areas:** RealityKit physics updates, ShaderGraph material nodes, spatial audio improvements
- **Checklist:** `Construct/Ideas/Baoding/MASTER_CHECKLIST.md`

### Fleeting Thoughts Pipeline
- **Platform:** macOS + Raspberry Pi 5 + Vercel
- **Stack:** TypeScript, Node.js, Supabase, Next.js, Ollama (planned), Python (Telegram bot, planned)
- **Status:** Partially automated. Folder watcher running via launchd. Web UI live. Processing manual via `/fleeting`.
- **What it does:** Captures ideas from multiple sources, categorizes, routes to projects, graduates to checklists.
- **Key APIs:** Supabase REST, Ollama REST (planned), Telegram Bot API (planned), Claude Code CLI
- **Planned:** Ollama install, process-inbox automation, Telegram bot, graduated autonomy (L0-L3), multi-agent architecture (Conductor/Librarian/Architect/Builder/Scout/Researcher)
- **Watch areas:** Ollama model releases, Claude Code CLI updates, Supabase features, Telegram bot API, local AI model benchmarks (Qwen, Llama, Phi)
- **Architecture:** `docs/AI-SYSTEM-ARCHITECTURE.md`

### BlenderWorkshop
- **Platform:** macOS (Blender 5.0.1 + Blender MCP)
- **Stack:** Blender, Python (Blender API via MCP), USDZ export
- **Status:** Set up (2026-02-19). First request pending: Baoding orb materials.
- **What it does:** Dedicated 3D asset creation workspace. Project agents submit request docs, Blender session creates assets, exports land in project-specific folders.
- **Key APIs:** Blender Python API (via MCP), USDZ export, PBR metallic/roughness materials
- **Serves:** Baoding (orb materials), WaypointHub (v2 portal orbs), Spatialis (occasional 3D assets)
- **Watch areas:** Blender MCP updates, USDZ export improvements, RealityKit material compatibility, new Blender 5.x features
- **Checklist:** `Construct/BlenderWorkshop/MASTER_CHECKLIST.md`
- **Learnings:** `Construct/BlenderWorkshop/LEARNINGS.md`

### Unshackled Pursuit
- **Platform:** Web (Vercel)
- **Stack:** Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS, dnd-kit
- **Status:** Live at unshackledpursuit.com. Fleeting Thoughts Kanban UI is the main feature.
- **What it does:** Hub website + Fleeting Thoughts web capture/management UI.
- **Key APIs:** Supabase client, Next.js App Router, dnd-kit drag-and-drop
- **Planned:** UI improvements as pipeline evolves
- **Watch areas:** Next.js releases, Supabase client updates, Vercel platform changes

---

## Cross-Project Technologies

These frameworks/APIs matter across multiple projects. Changes here ripple everywhere.

| Technology | Used By | Why It Matters |
|-----------|---------|---------------|
| SwiftUI | Spatialis, WaypointHub, Baoding | Primary UI framework for all Apple apps |
| RealityKit | Spatialis, WaypointHub (v2), Baoding | 3D rendering, physics, spatial computing |
| visionOS SDK | Spatialis, WaypointHub, Baoding | Target platform — any SDK change affects all three |
| App Intents | WaypointHub, Spatialis | Siri integration, Shortcuts exposure. Feb 23 beta deadline. |
| Liquid Glass | WaypointHub, Spatialis | Mandatory UI update. Apr 28 SDK deadline. |
| Foundation Models | WaypointHub, Spatialis, Pipeline | On-device 3B LLM. Zero cloud cost classification/tagging. |
| CloudKit | WaypointHub | iCloud sync — paid tier feature |
| Supabase | Pipeline, Unshackled Pursuit | Backend for capture system + web UI |
| Ollama | Pipeline | Local AI inference for classification/enrichment |
| Tailscale | Pipeline, Network | Mesh VPN connecting all devices |

---

## Research Output Guidelines

When the Researcher agent runs, findings should be:
- **Filtered against this manifest** — if it doesn't relate to a listed technology or watch area, skip it
- **Capped at ~3-5 items per project** — at-a-glance, not exhaustive
- **Cross-referenced against checklists** — "this update impacts FUT-XX" is 10x more useful than "this update exists"
- **Prioritized by deadline proximity** — items near shipping deadlines surface first

---

## Research Vetting Framework

Items in `processing` status with `needs-research` tag are the Researcher's backlog. For each item, answer these questions:

### Relevance Assessment
1. **Is this relevant to our ecosystem?** — Does it connect to any project, technology, or watch area listed above?
2. **Is this useful now or later?** — Can we act on this today, or is it something to monitor as it matures?
3. **Does this change our direction?** — Should we pivot, add a new tool, or reconsider an approach?

### Implementation Assessment
4. **Can we integrate this into our system?** — Is there a concrete path to using this in our stack?
5. **Is it worthwhile given our resources?** — Everything is doable — but is the ROI there? Time vs. value.
6. **What's the implementation cost?** — Quick win (hours), medium effort (days), or major undertaking (weeks+)?

### Strategic Assessment
7. **Should we monitor this?** — Even if not actionable now, is this a technology/trend that could become critical?
8. **Who else is building with this?** — Community adoption, open-source activity, corporate backing.
9. **Does this compound with things we already have?** — Best tools are ones that multiply existing capabilities.

### After Vetting — Decision Outcomes
| Outcome | Action |
|---------|--------|
| **Actionable now** | Move to `routed` with specific next steps in `ai_analysis`. Assign to project. |
| **Monitor** | Move to `archived` with tag `monitor`. Rich `ai_analysis` with what to watch for. |
| **Not relevant** | Move to `archived`. Brief note on why. Don't delete — context may change. |
| **Needs deeper dive** | Keep in `processing`. Add findings so far to `ai_analysis`. Flag what's still unknown. |
| **Spawns new idea** | Create new fleeting thought for the idea. Archive the original reference. |

### Pipeline Status Definitions (Updated)

| Status | Meaning | Who acts on it |
|--------|---------|---------------|
| **inbox** | Raw capture, untouched | `/fleeting` session categorizes |
| **processing** | Categorized, needs research/vetting | Researcher agent or manual session |
| **routed** | Researched, specific next action identified | Project agent or builder |
| **done** | Action completed, value extracted | Ready for archive |
| **archived** | Fully consumed, searchable reference | Nobody — it's the library |
