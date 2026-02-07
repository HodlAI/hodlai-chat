---
name: coinbase-price
description: Fetch real-time cryptocurrency spot prices from Coinbase. Use when the user asks for the price of SOL, BTC, ETH, or other crypto assets.
metadata:
  {
    "openclaw": {
      "emoji": "💰",
      "requires": { "bins": ["curl", "jq"] }
    }
  }
---

# Coinbase Price

Fetch real-time spot prices for cryptocurrency pairs using the Coinbase API.

## Usage

Run the fetch script with a pair (default is SOL-USD):

```bash
skills/coinbase-price/scripts/get_price.sh SOL-USD
```

Supported assets include BTC, ETH, SOL, etc. Format: `ASSET-CURRENCY`.
