#!/bin/bash

# Fleeting Thoughts Inbox Processor
# Run this script to process unprocessed inbox items
#
# Usage: ./agents/run-processor.sh
#
# For cron (2am daily):
# 0 2 * * * /path/to/unshackled-pursuit/agents/run-processor.sh >> /var/log/fleeting-agent.log 2>&1

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR"

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Check for required environment variable
if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "Error: SUPABASE_SERVICE_KEY environment variable is not set"
    echo "Get it from: Supabase Dashboard > Settings > API > service_role (secret)"
    exit 1
fi

# Run the processor
echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting inbox processor..."
npx ts-node agents/process-inbox.ts
echo "$(date '+%Y-%m-%d %H:%M:%S') - Processor finished"
