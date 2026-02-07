---
name: monitor-token
description: Monitor the status of Wrapped HODLAI on Solana chain (Mint 69Fz...). Checks for holders, supply, and liquidity events.
---

# Monitor Token (Solana Wrapped HodlAI)

Use this skill to check the status of the bridged asset on Solana.

## Usage

```bash
python3 skills/monitor-token/scripts/monitor.py
```

## Details
- **Mint**: `69FzMe8k1hbP8PzeBQDUYe5eGz5KhfbeRaGA9MhoGpBu`
- **Chain**: Solana
- **Explorer**: Solscan / Solflare

## Key Metrics to Watch
1. **Liquidity**: Is there a Raydium/Meteora pool?
2. **Holders**: growing count?
3. **Bridge**: Is Wormhole portal active?
