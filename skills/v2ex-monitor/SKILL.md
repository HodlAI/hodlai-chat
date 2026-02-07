---
name: v2ex-monitor
description: Monitor V2EX Node (HodlAI) for new discussions. Returns new posts since last check.
---

# V2EX Monitor

This skill checks the V2EX `hodlai` node RSS feed for new posts. It maintains state locally to avoid duplicates.

## Usage

Run the python script to check for updates.

```bash
python3 skills/v2ex-monitor/scripts/monitor.py
```

## Output Format

The script outputs JSON:

```json
{
  "new_posts": [
    {
      "title": "Post Title",
      "link": "https://v2ex.com/...",
      "author": "username",
      "published": "2026-02-02T..."
    }
  ]
}
```

## Notification Protocol
If `new_posts` is not empty, you MUST:
1. Format a message: 
   `🆕 **New V2EX Post**`
   `Title: <title>`
   `Author: <author>`
   `Link: <link>`
2. Send to Telegram Group Main: `-1003710051946`
3. Send to Owner (Livid): `26586285`
