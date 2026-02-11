#!/usr/bin/env npx ts-node

/**
 * Fleeting Thoughts Folder Watcher
 *
 * Watches the FleetingThoughts iCloud folder for new files (.md, .pdf, .txt)
 * and ingests them into Supabase as inbox items.
 *
 * Respects pipeline rules:
 * - Skips hub files (CLAUDE.md, AGENTS.md)
 * - Handles PDFs and markdown
 * - Moves ingested files to _processed/
 * - Logs all actions to the Pipeline Ledger
 * - Never graduates items (no-graduation guardrail)
 *
 * Run manually:
 *   npx ts-node --project agents/tsconfig.json agents/folder-watcher.ts
 *
 * Schedule via launchd: see docs/MASTER_CHECKLIST.md for plist template
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  createSupabaseClient,
  isIngestibleFile,
  getContentType,
  moveToProcessed,
  appendToLedger,
  matchProject,
  getProjectName,
  PATHS,
  USER_ID,
  LedgerEntry,
} from './pipeline-rules';

const supabase = createSupabaseClient();

// Extract title from markdown content or filename
function extractTitle(content: string, filename: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();
  // Clean filename
  const ext = path.extname(filename);
  return path.basename(filename, ext).replace(/[-_]/g, ' ');
}

// Detect if content looks like a spec/PRD document
function isSpec(content: string): boolean {
  const specIndicators = [
    /^##?\s*(overview|summary|background|requirements|acceptance criteria|user stor)/im,
    /^##?\s*(problem|solution|goal|objective)/im,
    /^##?\s*(technical|implementation|design|architecture)/im,
    /^\s*[-*]\s+\[[ x]\]/m, // Checkboxes
  ];
  return specIndicators.some(pattern => pattern.test(content));
}

// Read file content — for PDFs, record that it exists (content extraction is manual)
function readFileContent(filepath: string): { content: string; readable: boolean } {
  const ext = path.extname(filepath).toLowerCase();

  if (ext === '.pdf') {
    const filename = path.basename(filepath);
    return {
      content: `[PDF document: ${filename}] — Content extraction pending. Use Claude or Marker for PDF-to-markdown conversion.`,
      readable: false,
    };
  }

  try {
    return { content: fs.readFileSync(filepath, 'utf-8'), readable: true };
  } catch {
    return { content: `[Could not read file: ${path.basename(filepath)}]`, readable: false };
  }
}

async function ingestFile(filepath: string): Promise<LedgerEntry | null> {
  const filename = path.basename(filepath);
  const contentType = getContentType(filename);

  console.log(`📄 Processing: ${filename}`);

  try {
    const { content, readable } = readFileContent(filepath);
    const title = readable ? extractTitle(content, filename) : path.basename(filename, path.extname(filename)).replace(/[-_]/g, ' ');
    const projectMatch = matchProject(readable ? content : filename);
    const isSpecDoc = readable && isSpec(content);

    // Build tags
    const tags: string[] = ['folder-import'];
    if (isSpecDoc) tags.push('spec');
    if (contentType === 'pdf') tags.push('pdf');

    // Build summary for Supabase content field
    const summary = readable
      ? (content.length > 500 ? content.substring(0, 500) + '...' : content)
      : `[PDF: ${filename}] — Awaiting content extraction.`;

    // Build ai_analysis
    const analysisparts: string[] = [];
    if (readable) analysisparts.push(`Imported document: "${title}".`);
    else analysisparts.push(`PDF file imported: "${title}". Content extraction pending.`);
    if (isSpecDoc) analysisparts.push('Detected as spec/PRD document.');
    if (projectMatch) analysisparts.push(`Keyword match → ${projectMatch.name}.`);
    analysisparts.push(`Source: FleetingThoughts/${filename}`);

    // Insert into Supabase
    const { data, error } = await supabase
      .from('fleeting_thoughts')
      .insert({
        content: summary,
        user_id: USER_ID,
        content_type: contentType,
        source: 'folder_watch',
        status: 'inbox',
        tags: tags,
        project_id: projectMatch?.id || null,
        ai_analysis: analysisparts.join(' '),
      })
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Supabase insert error: ${error.message}`);
      return null;
    }

    console.log(`  ✅ Added to inbox (ID: ${data.id.slice(0, 8)}...)`);
    console.log(`     Title: ${title}`);
    if (projectMatch) console.log(`     Project: ${projectMatch.name}`);
    if (isSpecDoc) console.log(`     Type: Spec document`);

    // Move to _processed/
    const processedPath = moveToProcessed(filepath);
    console.log(`  📁 Moved to: ${processedPath}`);

    // Update routed_to with processed path
    await supabase
      .from('fleeting_thoughts')
      .update({ routed_to: processedPath })
      .eq('id', data.id);

    return {
      thoughtId: data.id,
      summary: `${title} (${contentType})`,
      action: 'created from file scan + moved-to-processed',
      project: projectMatch?.name || 'none',
      reasoning: projectMatch
        ? `File in FleetingThoughts/ folder. Keyword match → ${projectMatch.name}.`
        : 'File in FleetingThoughts/ folder. No project match — needs manual assignment.',
      outcome: `Inbox. Source moved to ${processedPath}`,
    };
  } catch (err) {
    console.error(`  ❌ Error: ${err}`);
    return null;
  }
}

async function watchFolder() {
  console.log('🔍 Fleeting Thoughts Folder Watcher');
  console.log('====================================');
  console.log(`📂 Watching: ${PATHS.FLEETING_THOUGHTS}`);
  console.log(`📦 Processed: ${PATHS.PROCESSED}\n`);

  // Ensure folders exist
  if (!fs.existsSync(PATHS.FLEETING_THOUGHTS)) {
    console.log(`Creating folder: ${PATHS.FLEETING_THOUGHTS}`);
    fs.mkdirSync(PATHS.FLEETING_THOUGHTS, { recursive: true });
  }

  if (!fs.existsSync(PATHS.PROCESSED)) {
    fs.mkdirSync(PATHS.PROCESSED, { recursive: true });
  }

  // Get all ingestible files
  const files = fs.readdirSync(PATHS.FLEETING_THOUGHTS).filter(isIngestibleFile);

  if (files.length === 0) {
    console.log('✅ No new files to process.\n');
    return;
  }

  console.log(`Found ${files.length} file(s) to process:\n`);

  const ledgerEntries: LedgerEntry[] = [];
  let processed = 0;
  let failed = 0;

  for (const file of files) {
    const filepath = path.join(PATHS.FLEETING_THOUGHTS, file);
    const entry = await ingestFile(filepath);
    if (entry) {
      ledgerEntries.push(entry);
      processed++;
    } else {
      failed++;
    }
    console.log('');
  }

  // Log to Pipeline Ledger
  appendToLedger('folder-watcher', ledgerEntries);

  console.log('====================================');
  console.log(`📊 Summary: ${processed} processed, ${failed} failed`);
  console.log('');
}

// Run
watchFolder().catch(console.error);
