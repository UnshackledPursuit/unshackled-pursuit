# Unshackled Pursuit - Fleeting Thoughts

A personal idea capture and processing system built with Next.js, Supabase, and AI agents.

## Overview

Fleeting Thoughts is an inbox for your brain. Capture ideas quickly, then let AI help categorize and route them to where they belong.

### System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAPTURE METHODS                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Web UI        → Quick capture at /fleeting                  │
│  2. Markdown      → Expanded input for specs/docs               │
│  3. Folder Watch  → Drop .md files in iCloud folder             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        INBOX                                     │
│  All thoughts land here for triage                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI PROCESSING                                 │
│  - Categorize (actionable vs reference)                         │
│  - Assign priority (high/medium/low/someday)                    │
│  - Tag with keywords                                            │
│  - Match to projects                                            │
│  - Suggest destination                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTING DESTINATIONS                          │
├─────────────────────────────────────────────────────────────────┤
│  things     → Tasks with clear next actions                     │
│  reminders  → Time-based reminders                              │
│  calendar   → Events with dates/times                           │
│  notes      → Reference material, documentation                 │
│  reference  → Long-term resources, bookmarks                    │
│  archive    → Completed or no longer relevant                   │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key  # For agents only
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/fleeting](http://localhost:3000/fleeting)

## Capture Methods

### 1. Web UI (Quick Capture)

Go to `/fleeting` and type in the input box. Press Enter to capture.

- Detects URLs automatically
- Detects markdown formatting
- Tags content type (text, link, etc.)

### 2. Expanded Markdown Input

Click the expand icon next to the input to open full-screen markdown editor.

Best for:
- Pasting spec documents
- Multi-paragraph notes
- Formatted content with headers and lists

### 3. Folder Watcher (iCloud Integration)

Drop `.md` files into the FleetingThoughts folder and they'll be automatically ingested.

**Folder Location:**
```
~/Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/FleetingThoughts/
```
Or in Finder: `iCloud Drive > Assets > Learning > Apps > FleetingThoughts`

**Run the watcher:**
```bash
npm run watch-folder
```

**What it does:**
1. Scans the folder for `.md` files
2. Reads each file content
3. Extracts title from first H1 or filename
4. Detects if content is a spec/PRD document
5. Creates a record in Supabase (appears in inbox)
6. Moves processed files to `_processed/` subfolder
7. Prints a summary

**Processed files are moved to:**
```
~/iCloud Drive/.../FleetingThoughts/_processed/
```

This prevents re-processing and keeps originals for reference.

**Schedule with cron (optional):**
```bash
# Run every 5 minutes
*/5 * * * * cd /path/to/unshackled-pursuit && npm run watch-folder
```

## Agent Scripts

Located in `/agents/` folder:

### folder-watcher.ts
Ingests `.md` files from iCloud folder into Fleeting Thoughts inbox.

```bash
npm run watch-folder
```

### process-inbox.ts
Processes unprocessed inbox items with AI categorization.

```bash
npm run process-inbox
```

**Requires:** `SUPABASE_SERVICE_KEY` environment variable.

## Database Schema

### fleeting_thoughts table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner (FK to auth.users) |
| content | text | The captured thought |
| content_type | text | text, voice, image, pdf, link |
| source | text | manual, shortcut, share_extension, agent, folder_watch |
| status | text | inbox, processing, routed, done, archived |
| captured_at | timestamptz | When captured |
| priority | text | high, medium, low, someday |
| tags | text[] | Array of tags |
| ai_analysis | text | AI-generated analysis |
| routed_to | text | Where it was routed |
| project_id | uuid | Associated project |
| is_actionable | boolean | Requires action? |
| suggested_destination | text | things, reminders, calendar, notes, reference, archive |
| processed_at | timestamptz | When AI processed it |
| url | text | Detected URL |
| url_title | text | Fetched page title |
| url_description | text | Fetched page description |

### projects table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| name | text | Project name |
| description | text | Project description |
| status | text | active, completed, archived |
| color | text | Hex color for UI |
| created_at | timestamptz | When created |
| app_path | text | Path to app source code |
| website_path | text | Path to website code |
| feedback_url | text | External feedback form URL |
| custom_instructions | text | Context for Claude sessions |
| sort_order | int | Display order in sidebar |

## Authentication

Uses Google OAuth via Supabase Auth.

**Allowed emails:**
- unshackledpursuit@gmail.com
- drussell2381@gmail.com

Configured in `/src/app/fleeting/page.tsx` via `ALLOWED_EMAILS` constant.

## Deployment

Hosted on Vercel with automatic deployments from GitHub.

**Vercel Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Project Structure

```
unshackled-pursuit/
├── src/
│   ├── app/
│   │   ├── fleeting/
│   │   │   └── page.tsx      # Main Fleeting Thoughts UI
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   └── ui/               # Shared UI components
│   └── lib/
│       └── supabase.ts       # Supabase client & types
├── agents/
│   ├── folder-watcher.ts     # iCloud folder ingestion
│   ├── process-inbox.ts      # AI inbox processing
│   ├── run-processor.sh      # Cron wrapper script
│   └── AGENTS.md             # Agent instructions
└── README.md
```

## Future Enhancements

- **Tier System**: Different automation levels for different project types
  - Tier 1 (Production): Human review required
  - Tier 2 (Internal tools): PRs with lighter review
  - Tier 3 (Experiments): Full automation
- **Spec Generation**: Auto-generate PRDs from triaged ideas
- **Ralph Integration**: Autonomous building for Tier 3 projects (isolated testing)
- **iOS Shortcuts**: Quick capture from iPhone
- **Share Extension**: Capture from any app
