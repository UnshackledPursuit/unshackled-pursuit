# Tool Inventory

> **Authoritative, version-controlled record of all installed tools, models, and dependencies.**
> Committed and pushed with every change. Memory file (`infrastructure.md`) references this doc.
>
> *Last updated: 2026-02-26*

---

## Hardware

| Spec | Value |
|------|-------|
| Machine | MacBook Pro (MacBookPro18,2) |
| Chip | Apple M1 Max |
| Memory | 32 GB unified |
| OS | macOS (Darwin 25.4.0) |

32GB unified memory means GPU and CPU share the same RAM pool. Models up to ~24GB can run comfortably with headroom for other apps.

---

## CLI Tools

| Tool | Version | Install Method | Installed | Purpose | Update Command |
|------|---------|----------------|-----------|---------|----------------|
| Homebrew | (system) | Pre-existing | — | Package manager | `brew update && brew upgrade` |
| ffmpeg | 8.0.1 | Homebrew | Feb 26 2026 | Video: splitting, transcoding, scene detection | `brew upgrade ffmpeg` |
| Ollama | 0.16.2 | Homebrew | Feb 26 2026 | Local LLM runner (Metal GPU) | `brew upgrade ollama` |
| Whisper CLI | 20250625 | pipx | Feb 26 2026 | Speech-to-text, auto-subtitles | `pipx upgrade openai-whisper` |
| pipx | (system) | Homebrew | Feb 26 2026 | Isolated Python CLI tool installer | `brew upgrade pipx` |
| Git | (system) | Xcode CLT | Pre-existing | Version control | `xcode-select --install` |
| Node.js / npm | (system) | Pre-existing | — | Website build, pipeline scripts | `brew upgrade node` |
| gh (GitHub CLI) | (system) | Homebrew | Pre-existing | GitHub operations from terminal | `brew upgrade gh` |

---

## Local AI Models (Ollama)

Ollama server must be running for API access: `ollama serve`

### Installed Models

| Model | Size | Parameters | Installed | Use Case | Pull Command |
|-------|------|-----------|-----------|----------|--------------|
| llama3.2 | 2.0 GB | 3B | Feb 26 2026 | Pipeline triage, classification | `ollama pull llama3.2` |

### Evaluated / Planned Models

| Model | Size | Parameters | RAM Needed | Rationale | Status |
|-------|------|-----------|------------|-----------|--------|
| **qwen3:4b** | 2.5 GB | 4B | ~5 GB | #1 ranked for classification benchmarks. Non-thinking mode for fast triage. 256K context. | **Recommended next pull** |
| qwen3:8b | 5.2 GB | 8B | ~8 GB | Better zero-shot than 4B. Good general-purpose. | Evaluate after 4B |
| qwen3.5:35b-a3b | ~24 GB | 35B (3B active) | ~18 GB | MoE: 35B knowledge, 3B speed. Fits in 32GB. Best quality option for this hardware. | Evaluate for complex tasks |
| qwen3:0.6b | 523 MB | 0.6B | ~2 GB | Ultra-fast sub-second classification. Minimal footprint. | Evaluate for high-volume batch |
| mistral | ~4 GB | 7B | ~6 GB | Strong at generation/captions. Alternative to Qwen for variety. | On hold |

**MoE models (the "A3B" variants):** Only activate a fraction of parameters per token. The qwen3.5:35b-a3b activates 3B params per pass despite having 35B total -- runs nearly as fast as a 3B dense model with much richer knowledge.

**Qwen3 vs Llama3.2 for our pipeline:**
- Qwen3-4B outperforms Llama3.2-3B on text classification (independent benchmarks by Distil Labs)
- Qwen3 has thinking/non-thinking toggle (non-thinking for fast triage, thinking for complex routing)
- Qwen3 supports 256K context vs Llama's 128K
- Both Apache 2.0 licensed (no restrictions)
- Keeping llama3.2 as baseline, adding qwen3:4b for comparison testing

### Model Management

```bash
# List installed models
ollama list

# Pull a new model
ollama pull <model>

# Remove a model (free disk space)
ollama rm <model>

# Test a model
ollama run <model> "your prompt here"

# API call (for scripts)
curl http://localhost:11434/api/generate -d '{"model":"llama3.2","prompt":"classify: ..."}'
```

### Apprentice Model Accuracy Log

Track model performance on real pipeline tasks to determine when to trust, when to verify.

| Date | Model | Task | Input Summary | Output | Correct? | Notes |
|------|-------|------|---------------|--------|----------|-------|
| Feb 26 | llama3.2 | classify | "Add haptic feedback to Spatialis" | feature_request | Yes | First test. Clean classification. |

**Scoring protocol:**
- Log every test and real pipeline run here initially (tight leash phase)
- Once a model hits 95%+ accuracy on a task type over 20+ samples, it can run that task with spot-check review instead of full review
- Different task types evaluated independently (classification vs caption generation vs summarization)
- If accuracy drops below 90% on spot-checks, revert to full review

---

## Web Stack (unshackled-pursuit)

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16 | Website framework (Vercel-deployed) |
| React | 19 | UI library |
| TypeScript | — | Type safety |
| Tailwind CSS | — | Styling |
| dnd-kit | — | Drag-and-drop (Kanban UI) |
| @supabase/supabase-js | — | Database client |

Managed via `package.json`. Update: `npm update`. Audit: `npm audit` / `npm audit fix`.

---

## MCP Servers

| Server | Project | Status | Config Location |
|--------|---------|--------|-----------------|
| Blender MCP | BlenderWorkshop | Active | `Construct/BlenderWorkshop/.mcp.json` |
| Xcode MCP | — | Not configured | Track for future (Tier 3 in TOOL_REGISTRY.md) |
| Excalidraw MCP | — | Not configured | Concept captured (thought `35119057`) |

---

## Claude Code Configuration

| Feature | Status | Config |
|---------|--------|--------|
| Swift LSP Plugin | Active | `~/.claude/settings.json` |
| Agent Teams | Enabled | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` |
| Auto Memory | Active | `~/.claude/projects/.../memory/` |
| User-Level Rules | Active | `~/.claude/rules/dkr-preferences.md`, `dkr-ecosystem.md` |
| Remote Control | Available, not set up | See `AGENTIC/REMOTE_CONTROL.md` |
| Git Worktrees | Available, not explored | `claude --worktree` |

---

## Cloud Services

| Service | Purpose | Security Notes |
|---------|---------|----------------|
| Supabase | Fleeting Thoughts DB + auth | RLS enabled. Service key in `.env.local` (gitignored). |
| GitHub | Source control (private repos) | SSH key auth. Repos: Media, CaptionFlow, Spatialis, WaypointHub, Baoding, unshackled-pursuit |
| Vercel | Website deployment | Auto-deploys from GitHub. Connected to unshackled-pursuit repo. |
| App Store Connect | App distribution | Spatialis v1.2, WaypointHub v2.0 LIVE. Baoding submitted. |

---

## Not Yet Installed (Planned)

| Tool | Priority | Purpose | Install | Blocked By |
|------|----------|---------|---------|------------|
| MLX | MEDIUM | Apple ML runtime, faster Whisper/LLMs | `pip3 install mlx mlx-lm` | Nothing (next up) |
| WhisperKit | LATER | On-device speech for visionOS apps (Swift SPM) | SPM package | CaptionFlow v1.0 ships first |
| ImageMagick | LATER | Template-based marketing image generation | `brew install imagemagick` | Social media pipeline build |
| PySceneDetect | LATER | Advanced scene detection | `pip3 install scenedetect` | ffmpeg handles basics already |

---

## Security & Maintenance Protocol

### Routine Updates (weekly or at start of session blocks)

```bash
# 1. Update all Homebrew packages
brew update && brew upgrade

# 2. Update Whisper
pipx upgrade openai-whisper

# 3. Check npm vulnerabilities
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/Assets/Learning/Apps/Websites/DKRHUB/unshackled-pursuit
npm audit

# 4. Update Ollama models (if new versions available)
ollama pull llama3.2
ollama pull qwen3:4b  # once installed
```

### Security Posture

- **All CLI tools via Homebrew or pipx** -- managed, auditable, no manual binary downloads
- **npm dependencies** checked via `npm audit`. Fix: `npm audit fix`
- **Supabase service key** stored in `.env.local` (gitignored, never committed)
- **No cloud AI API keys** -- Ollama and Whisper run fully local, zero data leaves the machine
- **GitHub repos are private** -- source code not publicly exposed
- **Privacy-first architecture** -- on-device processing for all AI features

### When to Update This Document

- Tool installed or removed
- Model pulled or retired
- Version bumped (note date)
- Accuracy log entry added (apprentice models)
- Security advisory discovered
- New service connected or decommissioned

Commit and push this file with every change. The version history IS the audit trail.

---

*Cross-references: `AGENTIC/TOOL_REGISTRY.md` (agentic capabilities), `infrastructure.md` (auto-memory quick-reference)*
