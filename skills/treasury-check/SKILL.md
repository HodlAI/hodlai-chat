---
name: treasury-check
description: Fetch real-time HodlAI Treasury stats (Volume & Liquidity) via GeckoTerminal API to estimate accrued tax revenue.
---

# Treasury Check

Fetches 24h volume and liquidity from GeckoTerminal to calculate estimated treasury revenue.

## Usage

```bash
python3 skills/treasury-check/check.py
```

## Source
- Endpoint: `https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x233be6ff451c87d3bde3bab2a8c0c0cdf872003c`
- Tax Rate: 3% (0.03)