/**
 * AI Processing Agent for Fleeting Thoughts
 *
 * Takes thoughts in "processing" status, analyzes them with AI,
 * creates project folders and SPEC.md files, then routes them.
 *
 * Usage: npx ts-node --project agents/tsconfig.json agents/process-thoughts.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Paths
const CONSTRUCT_IDEAS_PATH = '/Users/dylanrussell/Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/Construct/Ideas';
const TEMPLATE_PATH = path.join(CONSTRUCT_IDEAS_PATH, 'BUILD_TEMPLATE.md');

interface Thought {
  id: string;
  content: string;
  user_id: string;
  status: string;
  priority: string | null;
  project_id: string | null;
  tags: string[] | null;
  captured_at: string;
}

interface ProcessingResult {
  thoughtId: string;
  projectName: string;
  folderPath: string;
  specPath: string;
  success: boolean;
  error?: string;
}

// Create Supabase client
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Create Anthropic client if API key exists
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

/**
 * Fetch thoughts that are in "processing" status
 */
async function getProcessingThoughts(): Promise<Thought[]> {
  const { data, error } = await supabase
    .from('fleeting_thoughts')
    .select('*')
    .eq('status', 'processing')
    .order('captured_at', { ascending: true });

  if (error) {
    console.error('Error fetching thoughts:', error);
    return [];
  }

  return data || [];
}

/**
 * Generate a clean folder name from the thought content
 */
function generateFolderName(content: string): string {
  // Extract first meaningful phrase or sentence
  const firstLine = content.split('\n')[0].trim();

  // Clean up and create folder name
  let name = firstLine
    .replace(/^(idea:|note:|todo:|question:)\s*/i, '') // Remove prefixes
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars
    .trim()
    .split(/\s+/)
    .slice(0, 5) // Take first 5 words
    .join('-')
    .replace(/-+/g, '-'); // Clean up dashes

  // Capitalize each word
  name = name.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join('-');

  return name || 'Untitled-Project';
}

/**
 * Analyze thought with Claude AI
 */
async function analyzeWithAI(thought: Thought): Promise<{
  summary: string;
  feasibility: string;
  nextSteps: string[];
  relatedConcepts: string[];
  mvpFeatures: string[];
  outOfScope: string[];
  complexity: string;
  platform: string;
  techStack: string[];
}> {
  if (!anthropic) {
    // Fallback if no API key
    return {
      summary: thought.content,
      feasibility: 'Requires further analysis - ANTHROPIC_API_KEY not configured',
      nextSteps: ['Configure ANTHROPIC_API_KEY for AI analysis', 'Manual review required'],
      relatedConcepts: [],
      mvpFeatures: ['Define core features manually'],
      outOfScope: [],
      complexity: '🟡 Medium',
      platform: 'TBD',
      techStack: [],
    };
  }

  const prompt = `You are analyzing a project idea for a software developer. The idea was captured as a "fleeting thought" and needs to be turned into an actionable project spec.

IDEA:
${thought.content}

Analyze this idea and provide a structured response in JSON format:

{
  "summary": "A clear 2-3 sentence summary of what this project is about",
  "feasibility": "Assessment of technical feasibility - what's straightforward vs challenging",
  "nextSteps": ["First concrete action", "Second action", "Third action"],
  "relatedConcepts": ["Related technology or pattern", "Similar existing solution"],
  "mvpFeatures": ["Core feature 1", "Core feature 2", "Core feature 3"],
  "outOfScope": ["Thing to explicitly not build for MVP", "Another boundary"],
  "complexity": "🟢 Simple / 🟡 Medium / 🔴 Complex",
  "platform": "visionOS / iOS / macOS / Web / Cross-platform",
  "techStack": ["Framework1", "Framework2", "Key technology"]
}

Focus on:
1. What's the core value proposition?
2. What's the minimum viable implementation?
3. What technologies would best serve this?
4. What should be explicitly out of scope for v1?

Respond ONLY with valid JSON, no additional text.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return JSON.parse(content.text);
    }
  } catch (error) {
    console.error('AI analysis error:', error);
  }

  // Fallback
  return {
    summary: thought.content,
    feasibility: 'AI analysis failed - manual review required',
    nextSteps: ['Manual review required'],
    relatedConcepts: [],
    mvpFeatures: ['Define features manually'],
    outOfScope: [],
    complexity: '🟡 Medium',
    platform: 'TBD',
    techStack: [],
  };
}

/**
 * Generate SPEC.md content from template and AI analysis
 */
function generateSpec(
  projectName: string,
  thought: Thought,
  analysis: Awaited<ReturnType<typeof analyzeWithAI>>
): string {
  const today = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  return `# ${projectName.replace(/-/g, ' ')}

> **Status:** 📋 Idea | **Created:** ${today} | **Source:** Fleeting Thoughts

---

## Overview

**Problem Statement:**
${analysis.summary}

**Vision:**
${thought.content.split('\n')[0].trim()}

**Target Platform:**
${analysis.platform}

---

## Quick Reference

| Attribute | Value |
|-----------|-------|
| Complexity | ${analysis.complexity} |
| Effort | TBD |
| Dependencies | ${analysis.techStack.join(', ') || 'TBD'} |
| Similar To | ${analysis.relatedConcepts.join(', ') || 'TBD'} |

---

## MVP Definition

### Core Features (Must Have)
${analysis.mvpFeatures.map(f => `- [ ] ${f}`).join('\n')}

### Nice to Have (Post-MVP)
- [ ] Enhanced UI/UX polish
- [ ] Additional integrations

### Out of Scope (Not Building)
${analysis.outOfScope.map(s => `- ❌ ${s}`).join('\n') || '- ❌ TBD - Define scope boundaries'}

---

## Technical Architecture

### Stack
\`\`\`
Platform: ${analysis.platform}
Language: Swift
Frameworks: ${analysis.techStack.join(', ') || 'TBD'}
Backend: TBD
\`\`\`

### Key Patterns
- TBD - Define after initial exploration

### Data Model
\`\`\`swift
// Core entities - TBD
\`\`\`

---

## Implementation Phases

### Phase 1: Foundation
**Goal:** Set up project structure and core architecture
- [ ] Create Xcode project
- [ ] Set up basic UI structure
- [ ] Implement core data models

### Phase 2: Core Features
**Goal:** Build MVP functionality
${analysis.mvpFeatures.slice(0, 3).map(f => `- [ ] Implement: ${f}`).join('\n')}

### Phase 3: Polish & Ship
**Goal:** Prepare for release
- [ ] UI polish and animations
- [ ] Testing and bug fixes
- [ ] App Store submission

---

## Research & References

### Inspiration
- Original idea captured in Fleeting Thoughts

### Technical Resources
${analysis.relatedConcepts.map(c => `- ${c}`).join('\n') || '- TBD'}

### Open Questions
- [ ] Finalize technical architecture
- [ ] Validate feasibility of core features

---

## AI Analysis

**Generated:** ${timestamp}

### Summary
${analysis.summary}

### Feasibility Assessment
${analysis.feasibility}

### Suggested Next Steps
${analysis.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### Related Concepts
${analysis.relatedConcepts.map(c => `- ${c}`).join('\n') || '- None identified'}

---

## Original Capture

\`\`\`
${thought.content}
\`\`\`

**Captured:** ${new Date(thought.captured_at).toLocaleString()}
**Priority:** ${thought.priority || 'Not set'}
**Tags:** ${thought.tags?.join(', ') || 'None'}

---

## Status Log

| Date | Status | Notes |
|------|--------|-------|
| ${today} | 📋 Idea Captured | Initial capture from Fleeting Thoughts |
| ${today} | 🔍 AI Processed | Deep dive completed |
| ${today} | 📁 Routed | Folder created, spec generated |

---

*Last updated: ${today}*
*Source: Fleeting Thoughts → Construct/Ideas*
`;
}

/**
 * Create project folder and SPEC.md
 */
async function createProjectFolder(
  projectName: string,
  specContent: string
): Promise<{ folderPath: string; specPath: string }> {
  const folderPath = path.join(CONSTRUCT_IDEAS_PATH, projectName);
  const specPath = path.join(folderPath, 'SPEC.md');

  // Create folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Created folder: ${folderPath}`);
  }

  // Write SPEC.md
  fs.writeFileSync(specPath, specContent, 'utf-8');
  console.log(`Created spec: ${specPath}`);

  return { folderPath, specPath };
}

/**
 * Update thought status to "routed" and add metadata
 */
async function routeThought(thoughtId: string, projectName: string, specPath: string): Promise<boolean> {
  const { error } = await supabase
    .from('fleeting_thoughts')
    .update({
      status: 'routed',
      routed_to: specPath,
      processed_at: new Date().toISOString(),
      ai_analysis: `Processed and routed to Construct/Ideas/${projectName}`,
    })
    .eq('id', thoughtId);

  if (error) {
    console.error('Error updating thought:', error);
    return false;
  }

  return true;
}

/**
 * Log processed thoughts for daily digest
 */
function logForDigest(results: ProcessingResult[]): void {
  const digestPath = path.join(__dirname, 'digest-log.json');

  let existingLog: { date: string; processed: ProcessingResult[] }[] = [];
  if (fs.existsSync(digestPath)) {
    existingLog = JSON.parse(fs.readFileSync(digestPath, 'utf-8'));
  }

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = existingLog.find(e => e.date === today);

  if (todayEntry) {
    todayEntry.processed.push(...results);
  } else {
    existingLog.push({ date: today, processed: results });
  }

  // Keep only last 30 days
  existingLog = existingLog.slice(-30);

  fs.writeFileSync(digestPath, JSON.stringify(existingLog, null, 2));
  console.log(`Logged ${results.length} processed thoughts to digest`);
}

/**
 * Main processing function
 */
async function processThoughts(): Promise<void> {
  console.log('=== Fleeting Thoughts AI Processor ===');
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('');

  // Fetch thoughts to process
  const thoughts = await getProcessingThoughts();
  console.log(`Found ${thoughts.length} thoughts in processing queue`);

  if (thoughts.length === 0) {
    console.log('No thoughts to process. Exiting.');
    return;
  }

  const results: ProcessingResult[] = [];

  for (const thought of thoughts) {
    console.log('');
    console.log(`Processing: "${thought.content.substring(0, 50)}..."`);

    try {
      // Generate folder name
      const projectName = generateFolderName(thought.content);
      console.log(`  Project name: ${projectName}`);

      // Analyze with AI
      console.log('  Running AI analysis...');
      const analysis = await analyzeWithAI(thought);
      console.log('  AI analysis complete');

      // Generate spec content
      const specContent = generateSpec(projectName, thought, analysis);

      // Create folder and spec
      const { folderPath, specPath } = await createProjectFolder(projectName, specContent);

      // Update thought status
      const routed = await routeThought(thought.id, projectName, specPath);

      results.push({
        thoughtId: thought.id,
        projectName,
        folderPath,
        specPath,
        success: routed,
      });

      console.log(`  ✅ Successfully processed and routed`);
    } catch (error) {
      console.error(`  ❌ Error processing thought:`, error);
      results.push({
        thoughtId: thought.id,
        projectName: 'ERROR',
        folderPath: '',
        specPath: '',
        success: false,
        error: String(error),
      });
    }
  }

  // Log for daily digest
  logForDigest(results);

  console.log('');
  console.log('=== Processing Complete ===');
  console.log(`Processed: ${results.filter(r => r.success).length}/${results.length}`);
}

// Run the processor
processThoughts().catch(console.error);
