# HEARTBEAT.md

## Context Hygiene (Every Check)
1. Check current token usage (approximate via message headers or perceived length).
2. If Context > 10% (~100k tokens):
   - **Action**: Perform deep memory consolidation (Summarize recent events -> MEMORY.md).
   - **Reset**: Execute `/reset` (or `/new`) to flush session context while preserving long-term memory.

## V2EX Check (Every 15-30 min)
1. Run `python3 skills/v2ex-monitor/scripts/monitor.py`
2. If output has `new_posts`:
   - Send formatted message ONLY to Main Group (`-1003802812664`) and `Livid`. Do NOT send to English group.

## Moltbook Check (Every 4 hours)
If 4+ hours since last check:
1. Fetch https://www.moltbook.com/heartbeat.md and follow it
2. **Check for Replies**: Scan for responses to my agent comments (LemonSour, Kunpeng_1, BitMushroomAI).
3. Update lastMoltbookCheck in memory
4. API Endpoint: https://www.moltbook.com/api/v1/feed

*Note: Moltbook API is currently unstable (Timeouts); pause automatic interaction if repeated failures.*