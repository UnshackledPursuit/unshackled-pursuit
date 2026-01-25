# Fleeting Thoughts - Future Features

> **Status:** Reference Document | **Last Updated:** 2026-01-24

---

## Advanced Features Checklist

### Autonomous Agents (Moonshot)

- [ ] **Nightly Check Agent**
  - Agent runs on schedule (cron/launchd)
  - Reviews project status, checks for stale items
  - Could use open source model (Llama, Mistral) to reduce costs
  - Reports summary each morning

- [ ] **Feature Proposal Agent**
  - Monitors ecosystem (Apple docs, GitHub, tech news)
  - Evaluates if new features/APIs benefit existing projects
  - Proposes updates with rationale
  - Human approves before any action taken

- [ ] **Open Source Model Integration**
  - Local Ollama or LM Studio for routine checks
  - Reserve Claude for complex reasoning/building
  - Cost-effective autonomous monitoring

### Automation & Triggers

- [ ] **SSH Build Trigger**
  - SSH into Mac from phone/iPad to trigger Claude Code builds
  - Requires: SSH enabled on Mac, Mac awake, command documented
  - Use case: Start Ralph building while away from desk
  ```bash
  # Example SSH command
  ssh user@mac.local "cd /path/to/project && claude 'You are Ralph...'"
  ```

- [ ] **iCloud Folder Watcher**
  - Drop markdown file into watched folder → auto-creates project
  - Uses `launchd` or `fswatch` to monitor folder
  - Auto-triggers SPEC generation from dropped content
  - Target folder: `~/Library/Mobile Documents/com~apple~CloudDocs/FleetingDropbox/`

- [ ] **Auto Xcode Project Script**
  - Script that creates Xcode project from template
  - Eliminates manual Xcode setup step
  - Could use `xcodegen` or custom Swift script
  ```bash
  # Concept
  ./create-project.sh AirForm visionOS
  # Creates full Xcode project structure
  ```

### UI Enhancements

- [ ] **Quick Copy Actions Panel**
  - Add "Dev Tools" drawer/modal to Fleeting Thoughts page
  - One-tap copy buttons for:
    - Ralph launch command (per project)
    - SSH command template
    - iCloud folder path
    - Process thoughts script path
  - Shows active Ralph sessions status

- [ ] **"Trigger Build" Button**
  - For routed Construct Ideas projects
  - Shows step-by-step instructions
  - Copies relevant command to clipboard
  - Links to project folder

### Processing Pipeline

- [ ] **Daily Digest Notification**
  - Summary of thoughts captured
  - Thoughts awaiting processing
  - Projects ready for build
  - Could use email, push, or Slack webhook

- [ ] **AI Processing Toggle**
  - Per-thought toggle for AI analysis
  - Batch processing option
  - Cost tracking/budget limits

- [ ] **Template Auto-Selection**
  - Detect thought type (app idea, bug, note, etc.)
  - Auto-apply appropriate template
  - Smart routing based on content

### Integration

- [ ] **Apple Shortcuts Integration**
  - "Capture Thought" shortcut
  - "Start Build" shortcut
  - Siri voice capture

- [ ] **Raycast/Alfred Extension**
  - Quick capture from anywhere on Mac
  - Project search and launch

- [ ] **GitHub Integration**
  - Auto-create repo when project starts
  - Link issues to thoughts
  - PR creation from routed items

---

## Implementation Priority

### Phase 1: Quick Wins
1. Quick Copy Actions Panel (UI only)
2. Document SSH setup steps
3. Document iCloud folder path

### Phase 2: Automation
1. iCloud folder watcher (launchd)
2. Auto Xcode script (xcodegen)
3. SSH command templates

### Phase 3: Integration
1. Apple Shortcuts
2. Daily digest
3. GitHub integration

---

## Technical Notes

### SSH Setup (macOS)
```bash
# Enable Remote Login
# System Settings → General → Sharing → Remote Login

# Test connection
ssh username@macbook.local

# Run Claude remotely
ssh username@macbook.local "cd ~/Projects/AirForm && claude 'Build Phase 1'"
```

### iCloud Folder Watcher (launchd)
```xml
<!-- ~/Library/LaunchAgents/com.fleeting.watcher.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.fleeting.watcher</string>
    <key>WatchPaths</key>
    <array>
        <string>/Users/dylanrussell/Library/Mobile Documents/com~apple~CloudDocs/FleetingDropbox</string>
    </array>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/process-new-file.sh</string>
    </array>
</dict>
</plist>
```

### Xcodegen Spec Example
```yaml
# project.yml
name: AirForm
targets:
  AirForm:
    type: application
    platform: visionOS
    deploymentTarget: "2.0"
    sources:
      - AirForm
    settings:
      PRODUCT_BUNDLE_IDENTIFIER: com.unshackledpursuit.airform
```

---

## Related Files

| File | Purpose |
|------|---------|
| `/agents/process-thoughts.ts` | Manual processing script |
| `/src/app/fleeting/page.tsx` | Main Fleeting Thoughts UI |
| `/docs/FLEETING_FUTURE_FEATURES.md` | This document |

---

*Last updated: 2026-01-24*
*For: Unshackled Pursuit / Fleeting Thoughts*
