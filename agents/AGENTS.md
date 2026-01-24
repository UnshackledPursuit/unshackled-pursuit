# Fleeting Thoughts Agent Instructions

This document provides instructions for AI agents processing the Fleeting Thoughts inbox.

## Overview

You are an agent that processes ideas captured in the Fleeting Thoughts system. Your job is to:
1. Analyze each inbox item
2. Categorize and tag appropriately
3. Determine if actionable
4. Suggest routing destination
5. Move items to the appropriate status

## Database Connection

Connect to Supabase using environment variables:
- `SUPABASE_URL`: https://ygcgzwlzyrvwshtlxpsc.supabase.co
- `SUPABASE_SERVICE_KEY`: (must be set in environment - get from Supabase dashboard > Settings > API > service_role key)

## Processing Rules

### Categorization

For each thought, determine:

1. **Is it actionable?** (is_actionable: boolean)
   - YES if it requires a specific action to be taken
   - NO if it's just information, reference, or a vague idea

2. **Priority** (priority: high | medium | low | someday)
   - HIGH: Urgent, time-sensitive, blocking other work
   - MEDIUM: Important but not urgent, should be done soon
   - LOW: Nice to have, can wait
   - SOMEDAY: Maybe/someday ideas, no timeline

3. **Suggested Destination** (suggested_destination)
   - `things`: Tasks with clear next actions → Things 3
   - `reminders`: Time-based reminders, appointments → Apple Reminders
   - `calendar`: Events with specific dates/times → Calendar
   - `notes`: Reference material, documentation → Notes
   - `reference`: Long-term reference, resources → Reference storage
   - `archive`: Completed or no longer relevant → Archive

4. **Tags** (tags: string[])
   - Extract relevant keywords
   - Common tags: idea, feature, bug, research, personal, work, project-name

5. **Project Association** (project_id)
   - Match to existing projects based on content
   - Leave null if no clear project match

### AI Analysis Format

Write a brief analysis (ai_analysis field) that includes:
- What this thought is about (1 sentence)
- Why you categorized it this way (1 sentence)
- Suggested next action if actionable (1 sentence)

Example:
```
This is a feature idea for improving the onboarding flow. Marked as medium priority since it could improve conversion but isn't blocking. Next action: Create a spec document outlining the proposed changes.
```

### Status Updates

After processing, update status:
- If actionable and has clear destination → status: 'routed'
- If needs more human input → status: 'processing'
- If archived/reference → status: 'done'

## Routing Actions

When routing to external apps, use these URL schemes:

### Things 3
```
things:///add?title={title}&notes={notes}&tags={tags}
```

### Apple Reminders
```
x-apple-reminderkit://REMCDReminder/create?title={title}&notes={notes}
```

### Calendar
```
calshow:{timestamp}
```

## Learning & Patterns

As you process items, note patterns:
- Common project associations
- Frequently used tags
- User's priority preferences
- Typical routing destinations

Update this file with learned patterns to improve future processing.

## Learned Patterns

<!-- Agent will append learned patterns here -->

