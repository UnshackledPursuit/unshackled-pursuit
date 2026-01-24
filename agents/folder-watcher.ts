#!/usr/bin/env npx ts-node

/**
 * Fleeting Thoughts Folder Watcher
 *
 * Watches an iCloud folder for new .md files and ingests them into Fleeting Thoughts.
 *
 * Setup:
 * 1. Set SUPABASE_SERVICE_KEY environment variable
 * 2. Create the inbox folder (default: ~/Library/Mobile Documents/com~apple~CloudDocs/FleetingInbox)
 * 3. Run: npx ts-node agents/folder-watcher.ts
 *
 * Or run via cron every 5 minutes:
 * (asterisk)/5 * * * * cd /path/to/unshackled-pursuit && npx ts-node agents/folder-watcher.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const INBOX_FOLDER = process.env.FLEETING_INBOX_FOLDER ||
  path.join(process.env.HOME || '', 'Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/Construct/FleetingThoughts');
const PROCESSED_FOLDER = path.join(INBOX_FOLDER, '_processed');
const USER_EMAIL = 'unshackledpursuit@gmail.com'; // Your email for user lookup

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ygcgzwlzyrvwshtlxpsc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.error('Get it from: Supabase Dashboard > Settings > API > service_role (secret)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Extract title from markdown (first H1 or filename)
function extractTitle(content: string, filename: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  // Use filename without extension
  return filename.replace(/\.md$/, '').replace(/[-_]/g, ' ');
}

// Detect if content looks like a spec/PRD
function isSpec(content: string): boolean {
  const specIndicators = [
    /^##?\s*(overview|summary|background|requirements|acceptance criteria|user stor)/im,
    /^##?\s*(problem|solution|goal|objective)/im,
    /^##?\s*(technical|implementation|design)/im,
    /^\s*[-*]\s+\[[ x]\]/m, // Checkboxes
  ];
  return specIndicators.some(pattern => pattern.test(content));
}

// Extract project name from content or filename
function extractProjectHint(content: string, filename: string): string | null {
  // Look for project mentions in the content
  const projectPatterns = [
    /project:\s*(.+)/i,
    /for\s+([\w-]+)\s+project/i,
    /^#.*\b(waypointHub|unshackledpursuit|fleeting)/i,
  ];

  for (const pattern of projectPatterns) {
    const match = content.match(pattern);
    if (match) return match[1].trim();
  }

  // Check filename for project hints
  const knownProjects = ['waypointHub', 'unshackledpursuit', 'fleeting'];
  const lowerFilename = filename.toLowerCase();
  for (const project of knownProjects) {
    if (lowerFilename.includes(project.toLowerCase())) {
      return project;
    }
  }

  return null;
}

async function getUserId(): Promise<string | null> {
  const { data, error } = await supabase
    .from('fleeting_thoughts')
    .select('user_id')
    .limit(1)
    .single();

  if (data) return data.user_id;

  // Fallback: look up user by email (requires admin access)
  const { data: userData } = await supabase.auth.admin.listUsers();
  const user = userData?.users?.find(u => u.email === USER_EMAIL);
  return user?.id || null;
}

async function ingestFile(filepath: string): Promise<boolean> {
  const filename = path.basename(filepath);

  // Skip non-markdown files
  if (!filename.endsWith('.md')) {
    return false;
  }

  // Skip hidden files and processed folder
  if (filename.startsWith('.') || filename.startsWith('_')) {
    return false;
  }

  console.log(`📄 Processing: ${filename}`);

  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    const title = extractTitle(content, filename);
    const projectHint = extractProjectHint(content, filename);
    const isSpecDoc = isSpec(content);

    // Get user ID
    const userId = await getUserId();
    if (!userId) {
      console.error('  ❌ Could not determine user ID');
      return false;
    }

    // Build tags
    const tags: string[] = ['folder-import'];
    if (isSpecDoc) tags.push('spec');
    if (projectHint) tags.push(projectHint.toLowerCase());

    // Insert into Supabase
    const { data, error } = await supabase
      .from('fleeting_thoughts')
      .insert({
        content: content,
        user_id: userId,
        content_type: 'text',
        source: 'folder_watch',
        status: 'inbox',
        tags: tags,
        ai_analysis: isSpecDoc
          ? `Imported spec document: "${title}". ${projectHint ? `Likely for project: ${projectHint}.` : ''} Ready for review.`
          : null,
      })
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Error inserting: ${error.message}`);
      return false;
    }

    console.log(`  ✅ Added to inbox (ID: ${data.id.slice(0, 8)}...)`);
    console.log(`     Title: ${title}`);
    if (projectHint) console.log(`     Project hint: ${projectHint}`);
    if (isSpecDoc) console.log(`     Detected as: Spec document`);

    // Move to processed folder
    const processedPath = path.join(PROCESSED_FOLDER, `${Date.now()}-${filename}`);
    fs.renameSync(filepath, processedPath);
    console.log(`  📁 Moved to: _processed/`);

    return true;
  } catch (err) {
    console.error(`  ❌ Error: ${err}`);
    return false;
  }
}

async function watchFolder() {
  console.log('🔍 Fleeting Thoughts Folder Watcher');
  console.log('====================================\n');
  console.log(`📂 Watching: ${INBOX_FOLDER}`);
  console.log(`📦 Processed: ${PROCESSED_FOLDER}\n`);

  // Ensure folders exist
  if (!fs.existsSync(INBOX_FOLDER)) {
    console.log(`Creating inbox folder: ${INBOX_FOLDER}`);
    fs.mkdirSync(INBOX_FOLDER, { recursive: true });
  }

  if (!fs.existsSync(PROCESSED_FOLDER)) {
    fs.mkdirSync(PROCESSED_FOLDER, { recursive: true });
  }

  // Get all .md files in inbox
  const files = fs.readdirSync(INBOX_FOLDER).filter(f =>
    f.endsWith('.md') && !f.startsWith('.') && !f.startsWith('_')
  );

  if (files.length === 0) {
    console.log('✅ No new files to process.\n');
    return;
  }

  console.log(`Found ${files.length} file(s) to process:\n`);

  let processed = 0;
  let failed = 0;

  for (const file of files) {
    const filepath = path.join(INBOX_FOLDER, file);
    const success = await ingestFile(filepath);
    if (success) processed++;
    else failed++;
    console.log('');
  }

  console.log('====================================');
  console.log(`📊 Summary: ${processed} processed, ${failed} failed`);
  console.log('');
}

// Run
watchFolder().catch(console.error);
