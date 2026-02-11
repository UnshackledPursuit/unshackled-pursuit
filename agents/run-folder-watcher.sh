#!/bin/bash
# Wrapper script for launchd to run folder-watcher.ts
# CRITICAL: Do NOT cd to the iCloud project dir. Node's uv_cwd() fails on iCloud paths
# in launchd context. Instead, stay in ~ (set by plist WorkingDirectory) and use absolute paths.

PROJECT_DIR="/Users/dylanrussell/Library/Mobile Documents/com~apple~CloudDocs/Assets/Learning/Apps/Websites/DKRHUB/unshackled-pursuit"

export PATH="/opt/homebrew/opt/node@20/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
export TS_NODE_PROJECT="${PROJECT_DIR}/agents/tsconfig.json"

node -r "${PROJECT_DIR}/node_modules/ts-node/register" "${PROJECT_DIR}/agents/folder-watcher.ts"
