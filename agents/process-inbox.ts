#!/usr/bin/env npx ts-node

/**
 * Fleeting Thoughts Inbox Processor
 *
 * This script processes unprocessed inbox items using AI analysis.
 * Run with: npx ts-node agents/process-inbox.ts
 *
 * Required environment variables:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_KEY (service_role key, not anon key)
 */

import { createClient } from '@supabase/supabase-js';

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

interface Project {
  id: string;
  name: string;
  description: string | null;
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
  new_status: 'processing' | 'routed';
}

// Initialize Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
  console.error('- SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Keywords for categorization
const PRIORITY_KEYWORDS = {
  high: ['urgent', 'asap', 'critical', 'blocking', 'important', 'today', 'now'],
  medium: ['should', 'need', 'want', 'soon', 'this week'],
  low: ['maybe', 'could', 'nice to have', 'eventually'],
  someday: ['someday', 'maybe', 'idea', 'future', 'one day'],
};

const DESTINATION_KEYWORDS = {
  things: ['task', 'todo', 'do', 'action', 'implement', 'fix', 'build', 'create'],
  reminders: ['remind', 'remember', 'don\'t forget', 'appointment', 'meeting'],
  calendar: ['schedule', 'event', 'meeting', 'call', 'date', 'time'],
  notes: ['note', 'document', 'write up', 'spec', 'design'],
  reference: ['reference', 'resource', 'link', 'article', 'bookmark'],
  archive: ['done', 'completed', 'finished', 'resolved'],
};

const TAG_KEYWORDS = {
  feature: ['feature', 'enhancement', 'improvement', 'add'],
  bug: ['bug', 'fix', 'broken', 'issue', 'error'],
  idea: ['idea', 'thought', 'concept', 'brainstorm'],
  research: ['research', 'investigate', 'learn', 'study', 'explore'],
  personal: ['personal', 'home', 'family', 'life'],
  work: ['work', 'job', 'project', 'client'],
};

function analyzeThought(thought: Thought, projects: Project[]): ProcessingResult {
  const content = thought.content.toLowerCase();

  // Determine if actionable
  const actionablePatterns = ['need to', 'should', 'must', 'have to', 'want to', 'going to', 'will', 'todo', 'task'];
  const isActionable = actionablePatterns.some(p => content.includes(p)) ||
    Object.values(DESTINATION_KEYWORDS.things).some(k => content.includes(k));

  // Determine priority
  let priority: 'high' | 'medium' | 'low' | 'someday' = 'medium';
  for (const [level, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(k => content.includes(k))) {
      priority = level as 'high' | 'medium' | 'low' | 'someday';
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
  const tags: string[] = [];
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(k => content.includes(k))) {
      tags.push(tag);
    }
  }

  // Match to project
  let projectId: string | null = null;
  for (const project of projects) {
    const projectName = project.name.toLowerCase();
    const projectDesc = (project.description || '').toLowerCase();
    if (content.includes(projectName) || (projectDesc && content.includes(projectDesc))) {
      projectId = project.id;
      break;
    }
  }

  // Generate AI analysis
  const actionText = isActionable ? 'This is actionable' : 'This is informational/reference';
  const destText = `Routing to ${destination}`;
  let nextAction = 'No immediate action required';
  if (isActionable) {
    const destStr = destination as string;
    if (destStr === 'things') {
      nextAction = 'Next action: Review and create task';
    } else if (destStr === 'reminders') {
      nextAction = 'Next action: Review and set reminder';
    } else {
      nextAction = 'Next action: Review and process';
    }
  }

  const aiAnalysis = `${actionText}. ${destText}. ${nextAction}.`;

  return {
    id: thought.id,
    content: thought.content,
    is_actionable: isActionable,
    priority,
    tags,
    suggested_destination: destination,
    ai_analysis: aiAnalysis,
    project_id: projectId,
    new_status: isActionable ? 'routed' : 'processing',
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

  // Fetch projects for context
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active');

  // Process each thought
  const results: ProcessingResult[] = [];
  const summary = {
    total: thoughts.length,
    actionable: 0,
    byDestination: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
  };

  for (const thought of thoughts) {
    console.log(`\n📝 Processing: "${thought.content.substring(0, 50)}${thought.content.length > 50 ? '...' : ''}"`);

    const result = analyzeThought(thought, projects || []);
    results.push(result);

    // Update summary
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
      console.log(`  ✅ ${result.is_actionable ? 'Actionable' : 'Reference'} | ${result.priority} priority | → ${result.suggested_destination}`);
      if (result.tags.length > 0) {
        console.log(`     Tags: ${result.tags.join(', ')}`);
      }
    }
  }

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
