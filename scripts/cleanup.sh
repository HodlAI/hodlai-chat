#!/bin/bash
# Auto-Cleanup Script for OpenClaw Sessions
# Triggered by agent when context usage is high

# 1. Get the current session ID (Telegram Group)
# Note: Adjust grep pattern if session naming changes
SID=$(openclaw sessions list --json | grep -o '"sessionId":"[^"]*"' | grep "6f9a8874" | head -1 | cut -d'"' -f4)

# Fallback: Just grab the largest session if specific ID not found
if [ -z "$SID" ]; then
 SID=$(openclaw sessions list --json | grep -o '"sessionId":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

# 2. Delete it
if [ ! -z "$SID" ]; then
 echo "Deleting session: $SID"
 openclaw sessions delete "$SID"
else
 echo "No session found."
fi

# 3. Restart Gateway to apply
echo "Restarting gateway..."
openclaw gateway restart