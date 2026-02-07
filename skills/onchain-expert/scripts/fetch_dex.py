
import requests
import json
import sys

# Configuring standard output to handle emoji/utf-8 if necessary
sys.stdout.reconfigure(encoding='utf-8')

URL = "https://api.dexscreener.com/latest/dex/pairs/bsc/0x233be6ff451c87d3bde3bab2a8c0c0cdf872003c"

def fetch_data():
    try:
        response = requests.get(URL, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("pairs"):
            print("❌ No pair data found.")
            return

        pair = data["pairs"][0]
        
        # Extract metrics
        price_usd = pair.get("priceUsd", "0")
        price_native = pair.get("priceNative", "0")
        change_24h = pair.get("priceChange", {}).get("h24", 0)
        volume_24h = pair.get("volume", {}).get("h24", 0)
        liquidity = pair.get("liquidity", {}).get("usd", 0)
        fdv = pair.get("fdv", 0)
        
        # Formatting
        change_icon = "📈" if change_24h >= 0 else "📉"
        
        print(f"💎 **$HODLAI On-Chain Stats**")
        print(f"💵 **Price**: ${price_usd} ({change_icon} {change_24h}%)")
        print(f"💧 **Liquidity**: ${liquidity:,.0f}")
        print(f"📊 **Volume (24h)**: ${volume_24h:,.0f}")
        print(f"🏭 **Market Cap**: ${fdv:,.0f}")
        print(f"🔗 **Pair**: [{pair['pairAddress']}](https://dexscreener.com/bsc/{pair['pairAddress']})")
        
    except Exception as e:
        print(f"⚠️ Error fetching data: {e}")

if __name__ == "__main__":
    fetch_data()
