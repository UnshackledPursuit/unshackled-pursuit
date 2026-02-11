/**
 * Pipeline Rules — Shared Module
 *
 * Single source of truth for pipeline constants, guardrails, and utilities.
 * All agent scripts (folder-watcher, process-inbox, process-thoughts) import from here.
 *
 * This module enforces the same rules that the /fleeting skill enforces for agent sessions:
 * - Ledger logging for every action
 * - Hub file exclusion
 * - No-graduation guardrail
 * - Correct project IDs
 * - _processed/ workflow
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// ============================================================
// CONSTANTS
// ============================================================

/** Supabase project IDs — must match database */
export const PROJECT_IDS = {
  WAYPOINTHUB: '3e4b5a48-07a7-4a77-8c54-504560208397',
  SPATIALIS: 'be4e8911-df8c-49b0-bcb1-4af7db185eca',
  CONSTRUCT_IDEAS: '291bc648-719d-41d6-bcfc-4334076cb22d',
  FLEETING_THOUGHTS: 'af3cc925-78dd-4ee1-863d-35735619c423',
  UNSHACKLED_PURSUIT: '07cb1d12-0a06-44fd-bc94-a034dd89fca8',
  NETWORK: '85a0105c-6394-45e9-ac86-272a4dde197d',
} as const;

/** Project display names keyed by ID */
export const PROJECT_NAMES: Record<string, string> = {
  [PROJECT_IDS.WAYPOINTHUB]: 'WaypointHub',
  [PROJECT_IDS.SPATIALIS]: 'Spatialis',
  [PROJECT_IDS.CONSTRUCT_IDEAS]: 'Construct Ideas',
  [PROJECT_IDS.FLEETING_THOUGHTS]: 'Fleeting Thoughts',
  [PROJECT_IDS.UNSHACKLED_PURSUIT]: 'Unshackled Pursuit',
  [PROJECT_IDS.NETWORK]: 'Network',
};

/** Owner user ID */
export const USER_ID = '18a92969-5664-4d63-95fc-d8481e6c42e2';

/** Files in FleetingThoughts/ that must NEVER be ingested */
export const HUB_FILES = ['CLAUDE.md', 'AGENTS.md'];

/** File extensions that can be ingested from the FleetingThoughts folder */
export const INGESTIBLE_EXTENSIONS = ['.md', '.pdf', '.txt'];

/** Key paths used across scripts */
export const PATHS = {
  FLEETING_THOUGHTS: path.join(
    process.env.HOME || '',
    'Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/FleetingThoughts'
  ),
  PROCESSED: path.join(
    process.env.HOME || '',
    'Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/FleetingThoughts/_processed'
  ),
  PIPELINE_LEDGER: path.join(__dirname, '..', 'docs', 'PIPELINE_LEDGER.md'),
  ENV_FILE: path.join(__dirname, '..', '.env.local'),
};

// ============================================================
// GUARDRAILS
// ============================================================

/**
 * Valid status transitions for automated scripts.
 * Scripts can move items FORWARD through the pipeline but NEVER graduate them.
 * Graduation (routed → done, done → archived) is human-initiated via /fleeting skill.
 */
const VALID_AUTO_TRANSITIONS: Record<string, string[]> = {
  inbox: ['processing', 'routed'],
  processing: ['routed'],
  // 'routed' → NO automated transitions. Graduation is manual.
  // 'done' → NO automated transitions.
  // 'archived' → NO automated transitions.
};

/**
 * Validate that a status transition is allowed for automated scripts.
 * Throws descriptive error if transition violates the no-graduation rule.
 */
export function validateStatusTransition(from: string, to: string): boolean {
  const allowed = VALID_AUTO_TRANSITIONS[from];
  if (!allowed) {
    console.error(
      `❌ GUARDRAIL: Automated scripts cannot transition from '${from}'. ` +
      `Only the /fleeting skill can move items from '${from}' status.`
    );
    return false;
  }
  if (!allowed.includes(to)) {
    console.error(
      `❌ GUARDRAIL: Invalid transition ${from} → ${to}. ` +
      `Allowed transitions from '${from}': ${allowed.join(', ')}`
    );
    return false;
  }
  return true;
}

// ============================================================
// SUPABASE
// ============================================================

/** Create a Supabase client using service key from .env.local */
export function createSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    console.error('Missing required environment variables:');
    if (!url) console.error('  - SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
    if (!key) console.error('  - SUPABASE_SERVICE_KEY');
    console.error(`Checked .env.local at: ${PATHS.ENV_FILE}`);
    process.exit(1);
  }

  return createClient(url, key);
}

// ============================================================
// FILE HANDLING
// ============================================================

/** Check if a filename is a hub file that should never be ingested */
export function isHubFile(filename: string): boolean {
  return HUB_FILES.includes(filename);
}

/** Check if a file is eligible for ingestion (correct extension, not hidden, not hub) */
export function isIngestibleFile(filename: string): boolean {
  if (filename.startsWith('.') || filename.startsWith('_')) return false;
  if (isHubFile(filename)) return false;
  const ext = path.extname(filename).toLowerCase();
  return INGESTIBLE_EXTENSIONS.includes(ext);
}

/** Get the content type string for a file extension */
export function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf': return 'pdf';
    case '.md': return 'text';
    case '.txt': return 'text';
    default: return 'text';
  }
}

/**
 * Move a source file to _processed/.
 * Handles name collisions by appending a timestamp.
 * Returns the destination path (relative to FleetingThoughts/).
 */
export function moveToProcessed(sourcePath: string): string {
  const filename = path.basename(sourcePath);
  let destPath = path.join(PATHS.PROCESSED, filename);

  // Ensure _processed/ exists
  if (!fs.existsSync(PATHS.PROCESSED)) {
    fs.mkdirSync(PATHS.PROCESSED, { recursive: true });
  }

  // Handle name collision
  if (fs.existsSync(destPath)) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const newName = `${base}-${Date.now()}${ext}`;
    destPath = path.join(PATHS.PROCESSED, newName);
  }

  fs.renameSync(sourcePath, destPath);
  return `FleetingThoughts/_processed/${path.basename(destPath)}`;
}

// ============================================================
// PIPELINE LEDGER
// ============================================================

export interface LedgerEntry {
  thoughtId: string;  // Full UUID or 'N/A' for infrastructure actions
  summary: string;
  action: string;     // created, categorized, routed, moved-to-processed, etc.
  project: string;    // Project name or 'none'
  reasoning: string;
  outcome: string;
}

/**
 * Append entries to the Pipeline Ledger.
 * Creates a new automated session section for the current date and script.
 */
export function appendToLedger(
  scriptName: string,
  entries: LedgerEntry[]
): void {
  if (entries.length === 0) return;

  const today = new Date().toISOString().split('T')[0];
  const ledgerPath = PATHS.PIPELINE_LEDGER;

  if (!fs.existsSync(ledgerPath)) {
    console.error(`❌ Ledger not found at ${ledgerPath}`);
    return;
  }

  let content = fs.readFileSync(ledgerPath, 'utf-8');

  // Build session section
  const sessionHeader = `\n### Automated: ${today} — ${scriptName}\n\n` +
    '| Date | Thought ID | Summary | Action | Project | Reasoning | Outcome |\n' +
    '|------|-----------|---------|--------|---------|-----------|---------|';

  const rows = entries.map(e => {
    const idDisplay = e.thoughtId === 'N/A' ? '—' : `\`${e.thoughtId.slice(0, 8)}\``;
    return `| ${today} | ${idDisplay} | ${e.summary} | ${e.action} | ${e.project} | ${e.reasoning} | ${e.outcome} |`;
  }).join('\n');

  // Insert before "## Observations" section if it exists, otherwise append
  const observationsIndex = content.indexOf('## Observations');
  if (observationsIndex > -1) {
    content =
      content.slice(0, observationsIndex) +
      sessionHeader + '\n' + rows + '\n\n' +
      content.slice(observationsIndex);
  } else {
    content += '\n' + sessionHeader + '\n' + rows + '\n';
  }

  fs.writeFileSync(ledgerPath, content);
  console.log(`📋 Logged ${entries.length} action(s) to Pipeline Ledger`);
}

// ============================================================
// PROJECT MATCHING
// ============================================================

/** Keywords mapped to project IDs for content-based project assignment */
export const PROJECT_KEYWORDS: Record<string, { id: string; aliases: string[] }> = {
  WaypointHub: {
    id: PROJECT_IDS.WAYPOINTHUB,
    aliases: ['waypoint', 'waypointhub', 'constellation', 'orb', 'link launcher'],
  },
  Spatialis: {
    id: PROJECT_IDS.SPATIALIS,
    aliases: ['spatialis', 'sigil', 'drawing app', 'volume drawing', '3d drawing', 'realitykit draw'],
  },
  'Construct Ideas': {
    id: PROJECT_IDS.CONSTRUCT_IDEAS,
    aliases: ['construct', 'app idea', 'new app', 'visionos app'],
  },
  'Fleeting Thoughts': {
    id: PROJECT_IDS.FLEETING_THOUGHTS,
    aliases: ['fleeting', 'pipeline', 'automation', 'infrastructure', 'process-inbox', 'folder-watcher'],
  },
  'Unshackled Pursuit': {
    id: PROJECT_IDS.UNSHACKLED_PURSUIT,
    aliases: ['unshackled', 'unshackledpursuit', 'photography website'],
  },
  Network: {
    id: PROJECT_IDS.NETWORK,
    aliases: ['network', 'pi 5', 'raspberry pi', 'tailscale', 'home server', 'ollama', 'local ai'],
  },
};

/**
 * Match content to a project using keyword matching.
 * Returns the first matching project or null.
 */
export function matchProject(content: string): { id: string; name: string } | null {
  const lower = content.toLowerCase();
  for (const [name, { id, aliases }] of Object.entries(PROJECT_KEYWORDS)) {
    for (const alias of aliases) {
      if (lower.includes(alias)) {
        return { id, name };
      }
    }
  }
  return null;
}

/**
 * Get project name from project ID.
 */
export function getProjectName(projectId: string | null): string {
  if (!projectId) return 'none';
  return PROJECT_NAMES[projectId] || 'unknown';
}
