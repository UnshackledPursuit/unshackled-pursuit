#!/usr/bin/env npx ts-node

/**
 * Fleeting Thoughts Inbox Processor
 *
 * Processes unprocessed inbox items using keyword-based categorization.
 * No AI cost — purely keyword matching for priority, tags, destination, and project.
 *
 * Respects pipeline rules:
 * - Uses shared pipeline-rules module for project matching
 * - Validates status transitions (no-graduation guardrail)
 * - Logs all actions to the Pipeline Ledger
 * - Never creates SPEC files, project folders, or modifies checklists
 *
 * Run manually:
 *   npx ts-node --project agents/tsconfig.json agents/process-inbox.ts
 *
 * Schedule via Vercel cron or launchd: see docs/MASTER_CHECKLIST.md
 */

import {
  createSupabaseClient,
  validateStatusTransition,
  appendToLedger,
  matchProject,
  getProjectName,
  PROJECT_IDS,
  LedgerEntry,
} from './pipeline-rules';

// Types
interface Thought {
  id: string;
  user_id: string;
  content: string;
  content_type: string;
  source: string;
  status: string;
  captured_at: string;
  priority: string | null;
  tags: string[] | null;
  ai_analysis: string | null;
  routed_to: string | null;
  project_id: string | null;
  is_actionable: boolean | null;
  suggested_destination: string | null;
  processed_at: string | null;
  url: string | null;
}

interface ProcessingResult {
  id: string;
  content: string;
  is_actionable: boolean;
  priority: 'high' | 'medium' | 'low' | 'someday';
  tags: string[];
  suggested_destination: 'things' | 'reminders' | 'calendar' | 'notes' | 'reference' | 'archive';
  ai_analysis: string;
  project_id: string | null;
  project_name: string;
  new_status: 'processing' | 'routed';
}

const supabase = createSupabaseClient();

// Keywords for categorization
const PRIORITY_KEYWORDS = {
  high: ['urgent', 'asap', 'critical', 'blocking', 'important', 'today', 'now', 'ship'],
  medium: ['should', 'need', 'want', 'soon', 'this week'],
  low: ['maybe', 'could', 'nice to have', 'eventually'],
  someday: ['someday', 'maybe later', 'idea', 'future', 'one day'],
};

const DESTINATION_KEYWORDS = {
  things: ['task', 'todo', 'do', 'action', 'implement', 'fix', 'build', 'create', 'add', 'update'],
  reminders: ['remind', 'remember', "don't forget", 'appointment', 'meeting'],
  calendar: ['schedule', 'event', 'meeting', 'call', 'date', 'time'],
  notes: ['note', 'document', 'write up', 'spec', 'design'],
  reference: ['reference', 'resource', 'link', 'article', 'bookmark', 'check out'],
  archive: ['done', 'completed', 'finished', 'resolved', 'test'],
};

const TAG_KEYWORDS = {
  feature: ['feature', 'enhancement', 'improvement', 'add'],
  bug: ['bug', 'fix', 'broken', 'issue', 'error', "can't", 'crash'],
  idea: ['idea', 'thought', 'concept', 'brainstorm', 'what if'],
  research: ['research', 'investigate', 'learn', 'study', 'explore', 'check out'],
  feedback: ['feedback', 'user said', 'suggestion'],
  infrastructure: ['pipeline', 'automation', 'infrastructure', 'server', 'deploy'],
  spec: ['spec', 'architecture', 'design doc', 'roadmap'],
};

function analyzeThought(thought: Thought): ProcessingResult {
  const content = thought.content.toLowerCase();

  // Determine if actionable
  const actionablePatterns = ['need to', 'should', 'must', 'have to', 'want to', 'going to', 'will', 'todo', 'task', 'fix', 'build', 'add', 'implement'];
  const isActionable = actionablePatterns.some(p => content.includes(p)) ||
    DESTINATION_KEYWORDS.things.some(k => content.includes(k));

  // Determine priority
  let priority: 'high' | 'medium' | 'low' | 'someday' = 'medium';
  for (const [level, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(k => content.includes(k))) {
      priority = level as typeof priority;
      break;
    }
  }

  // Determine destination
  let destination: 'things' | 'reminders' | 'calendar' | 'notes' | 'reference' | 'archive' = 'things';
  for (const [dest, keywords] of Object.entries(DESTINATION_KEYWORDS)) {
    if (keywords.some(k => content.includes(k))) {
      destination = dest as typeof destination;
      break;
    }
  }

  // If it's a URL, default to reference
  if (thought.url || thought.content_type === 'link') {
    destination = 'reference';
  }

  // If not actionable, route to notes or reference
  if (!isActionable) {
    destination = thought.url ? 'reference' : 'notes';
  }

  // Extract tags
  const tags: string[] = thought.tags ? [...thought.tags] : [];
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(k => content.includes(k)) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  // Match to project using shared pipeline-rules
  const projectMatch = matchProject(thought.content);
  const projectId = thought.project_id || projectMatch?.id || null;
  const projectName = projectMatch?.name || getProjectName(projectId);

  // Generate analysis summary
  const actionText = isActionable ? 'Actionable' : 'Informational/reference';
  const destText = `→ ${destination}`;
  const projectText = projectName !== 'none' ? ` [${projectName}]` : '';
  const aiAnalysis = `${actionText}. ${destText}.${projectText} Auto-categorized by keyword matching.`;

  // Determine new status (respecting guardrails)
  const newStatus = isActionable ? 'routed' : 'processing';

  return {
    id: thought.id,
    content: thought.content,
    is_actionable: isActionable,
    priority,
    tags,
    suggested_destination: destination,
    ai_analysis: aiAnalysis,
    project_id: projectId,
    project_name: projectName,
    new_status: newStatus,
  };
}

async function processInbox() {
  console.log('🧠 Fleeting Thoughts Inbox Processor');
  console.log('====================================\n');

  // Fetch unprocessed inbox items
  console.log('📥 Fetching unprocessed inbox items...');
  const { data: thoughts, error: thoughtsError } = await supabase
    .from('fleeting_thoughts')
    .select('*')
    .eq('status', 'inbox')
    .is('processed_at', null)
    .order('captured_at', { ascending: true });

  if (thoughtsError) {
    console.error('Error fetching thoughts:', thoughtsError);
    process.exit(1);
  }

  if (!thoughts || thoughts.length === 0) {
    console.log('✅ No unprocessed items in inbox. All caught up!\n');
    return;
  }

  console.log(`Found ${thoughts.length} unprocessed item(s)\n`);

  const ledgerEntries: LedgerEntry[] = [];
  const summary = {
    total: thoughts.length,
    actionable: 0,
    byDestination: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
  };

  for (const thought of thoughts) {
    const preview = thought.content.substring(0, 50) + (thought.content.length > 50 ? '...' : '');
    console.log(`\n📝 Processing: "${preview}"`);

    const result = analyzeThought(thought);

    // Validate status transition
    if (!validateStatusTransition(thought.status, result.new_status)) {
      console.error(`  ⚠️ Skipping — invalid transition`);
      continue;
    }

    // Update summary stats
    if (result.is_actionable) summary.actionable++;
    summary.byDestination[result.suggested_destination] = (summary.byDestination[result.suggested_destination] || 0) + 1;
    summary.byPriority[result.priority] = (summary.byPriority[result.priority] || 0) + 1;

    // Update in database
    const { error: updateError } = await supabase
      .from('fleeting_thoughts')
      .update({
        is_actionable: result.is_actionable,
        priority: result.priority,
        tags: result.tags.length > 0 ? result.tags : null,
        suggested_destination: result.suggested_destination,
        ai_analysis: result.ai_analysis,
        project_id: result.project_id,
        status: result.new_status,
        processed_at: new Date().toISOString(),
      })
      .eq('id', thought.id);

    if (updateError) {
      console.error(`  ❌ Error updating: ${updateError.message}`);
    } else {
      console.log(`  ✅ ${result.is_actionable ? 'Actionable' : 'Reference'} | ${result.priority} | → ${result.suggested_destination} | ${result.project_name}`);
      if (result.tags.length > 0) {
        console.log(`     Tags: ${result.tags.join(', ')}`);
      }

      ledgerEntries.push({
        thoughtId: thought.id,
        summary: preview,
        action: 'categorized',
        project: result.project_name,
        reasoning: `Keyword match. ${result.is_actionable ? 'Actionable' : 'Reference'}. Priority: ${result.priority}. Destination: ${result.suggested_destination}.`,
        outcome: `Status: ${result.new_status}. Project: ${result.project_name}.`,
      });
    }
  }

  // Log to Pipeline Ledger
  appendToLedger('process-inbox', ledgerEntries);

  // Print summary
  console.log('\n====================================');
  console.log('📊 Processing Summary');
  console.log('====================================');
  console.log(`Total processed: ${summary.total}`);
  console.log(`Actionable: ${summary.actionable}`);
  console.log(`Reference/Info: ${summary.total - summary.actionable}`);
  console.log('\nBy Destination:');
  for (const [dest, count] of Object.entries(summary.byDestination)) {
    console.log(`  ${dest}: ${count}`);
  }
  console.log('\nBy Priority:');
  for (const [pri, count] of Object.entries(summary.byPriority)) {
    console.log(`  ${pri}: ${count}`);
  }
  console.log('\n✅ Inbox processing complete!\n');
}

// Run
processInbox().catch(console.error);
