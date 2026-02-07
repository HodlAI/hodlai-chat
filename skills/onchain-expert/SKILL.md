---
name: onchain-expert
description: Get real-time on-chain data for $HODLAI token via DexScreener API. Use when asked about price, liquidity, volume, market cap, or trading activity.
---

# Onchain Expert

Support $HODLAI on-chain intelligence by fetching real-time market data.

## Workflows

### Get Market Summary
Run the fetch script to get a formatted report of $HODLAI's current market status on BSC.

```bash
python3 skills/onchain-expert/scripts/fetch_dex.py
```

## Key Metrics Explained
- **Liquidity**: The depth of the pool. High liquidity means less price impact.
- **FDV**: Fully Diluted Valuation (Total supply x Current Price).
- **24h Change**: Percentage price movement in the last 24 hours.
- **Market Cap**: Circulating supply x Current Price.
