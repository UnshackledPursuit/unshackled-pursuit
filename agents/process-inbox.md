# Process Fleeting Thoughts Inbox

Run this prompt with Claude CLI to process unprocessed inbox items.

## Task

Process all items in the Fleeting Thoughts inbox that haven't been processed yet.

## Steps

1. **Connect to Supabase** using the service role key from environment variable `SUPABASE_SERVICE_KEY`
   - URL: https://ygcgzwlzyrvwshtlxpsc.supabase.co

2. **Fetch unprocessed inbox items**
   ```sql
   SELECT * FROM fleeting_thoughts
   WHERE status = 'inbox'
   AND processed_at IS NULL
   ORDER BY captured_at ASC
   ```

3. **Fetch existing projects** for context
   ```sql
   SELECT * FROM projects WHERE status = 'active'
   ```

4. **For each unprocessed thought**, analyze and update:
   - Determine if actionable (is_actionable)
   - Assign priority (high/medium/low/someday)
   - Extract tags
   - Match to project if applicable
   - Suggest destination (things/reminders/calendar/notes/reference/archive)
   - Write brief AI analysis
   - Update status to 'processing' or 'routed'
   - Set processed_at to current timestamp

5. **Execute routing** for items marked for specific destinations:
   - Things 3: Open URL scheme to create task
   - Reminders: Open URL scheme to create reminder
   - Other destinations: Just mark for manual routing

6. **Generate summary** of what was processed:
   - Number of items processed
   - Breakdown by destination
   - Any items that need human review

## Environment Required

- SUPABASE_SERVICE_KEY: Get from Supabase dashboard > Settings > API > service_role (secret)

## Example Execution

```bash
cd /path/to/unshackled-pursuit
claude -p "Read agents/process-inbox.md and execute the task"
```

## Cron Setup

Add to crontab for nightly processing:
```bash
0 2 * * * cd /path/to/unshackled-pursuit && claude -p "Read agents/process-inbox.md and execute the task" >> /var/log/fleeting-agent.log 2>&1
```
