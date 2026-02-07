# Uniswap V3 Monitor

This skill allows the agent to monitor Uniswap V3 LP positions on BNB Chain (or others if configured).

## Usage

```bash
node skills/uniswap/monitor.js --address <wallet_address>
```

## Features

- Scans `NonfungiblePositionManager` for all NFTs owned by the address.
- Decodes position data:
  - Liquidity
  - Tick Range (Price Range)
  - Token Pair
- **Calculates Pending Fees**: Simulates a `collect` call to see unclaimed fees (USDT/WBNB).
- **Health Check**: Determines if the position is "In Range" or "Out of Range" based on current pool price.

## Configuration

Env vars or hardcoded defaults in `monitor.js`:
- RPC_URL: `https://bsc-dataseed.binance.org`
- PM_ADDRESS: `0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613` (BSC)
