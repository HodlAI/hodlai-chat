import requests
import json

# Addresses
POOL_ADDRESS = "0x233be6ff451c87d3bde3bab2a8c0c0cdf872003c" # HODLAI/WBNB Pair
TOKEN_ADDRESS = "0x987e6269c6b7ea6898221882f11ea16f87b97777" # HODLAI Token
TREASURY_ADDRESS = "0x6f7D20FB985ae407Eae6157F8b298729febCe8F0" # Treasury Wallet
USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955" # BSC-USD

# Endpoints
GECKO_API = f"https://api.geckoterminal.com/api/v2/networks/bsc/pools/{POOL_ADDRESS}"
DEX_API = f"https://api.dexscreener.com/tokens/v1/bsc/{TOKEN_ADDRESS}"
RPC_URL = "https://bsc-rpc.publicnode.com"
WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"

def get_bnb_price():
    try:
        url = f"https://api.dexscreener.com/tokens/v1/bsc/{WBNB_ADDRESS}"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            pairs = resp.json()
            if pairs:
                return float(pairs[0].get('priceUsd', 0))
    except:
        return 0
    return 0

def get_token_balance(wallet, token, decimals=18):
    payload = {
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [
            {
                "to": token,
                "data": "0x70a08231000000000000000000000000" + wallet[2:]
            },
            "latest"
        ],
        "id": 1
    }
    try:
        resp = requests.post(RPC_URL, json=payload, timeout=5)
        if resp.status_code == 200:
            hex_bal = resp.json().get('result', '0x0')
            return int(hex_bal, 16) / 10**decimals
    except:
        return 0
    return 0

def fetch_data():
    report = []
    
    # 0. Wallet Balances (BNB + USDT)
    try:
        # BNB Price
        bnb_price = get_bnb_price()
        
        # BNB Wallet Balance
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_getBalance",
            "params": [TREASURY_ADDRESS, "latest"],
            "id": 1
        }
        resp = requests.post(RPC_URL, json=payload, timeout=5)
        bnb_bal = int(resp.json().get('result', '0x0'), 16) / 10**18
        
        # USDT
        usdt_bal = get_token_balance(TREASURY_ADDRESS, USDT_ADDRESS, 18)
        
        # HODLAI (Inventory)
        hodlai_bal = get_token_balance(TREASURY_ADDRESS, TOKEN_ADDRESS, 18)
        
        report.append(f"🏦 **Treasury Wallet** (`...Ce8F0`)")
        report.append(f"💰 **BNB**: {bnb_bal:.2f} (≈ ${bnb_bal * bnb_price:,.2f} @ ${bnb_price:.0f})")
        report.append(f"💵 **USDT**: ${usdt_bal:,.2f}")
        report.append(f"🏗️ **HODLAI**: {hodlai_bal:,.0f} (≈ ${hodlai_bal * 0.00368:,.2f} @ Market)")

        
    except Exception as e:
         report.append(f"⚠️ RPC Error: {e}")

    # 1. GeckoTerminal (Market Data)
    try:
        headers = {"Accept": "application/json"}
        resp = requests.get(GECKO_API, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()['data']['attributes']
            vol_24h = float(data.get('volume_usd', {}).get('h24', 0))
            est_tax = vol_24h * 0.03
            
            report.append("🏦 **Treasury & Market Data** (via GeckoTerminal)")
            report.append(f"📊 **24h Volume**: ${vol_24h:,.2f}")
            report.append(f"💰 **Est. Daily Tax (3%)**: ${est_tax:,.2f}")
            report.append(f"💧 **Liquidity**: ${float(data.get('reserve_in_usd', 0)):,.2f}")
            report.append(f"💎 **FDV**: ${float(data.get('fdv_usd', 0)):,.0f}")
            
    except Exception as e:
        report.append(f"⚠️ Gecko API Error: {e}")

    # 2. DexScreener (Best for Price/Change/Makers)
    try:
        resp = requests.get(DEX_API, timeout=10)
        if resp.status_code == 200:
            pairs = resp.json()
            if pairs:
                main_pair = pairs[0]
                price = float(main_pair.get('priceUsd', 0))
                change_24h = float(main_pair.get('priceChange', {}).get('h24', 0))
                buys_24h = main_pair.get('txns', {}).get('h24', {}).get('buys', 0)
                sells_24h = main_pair.get('txns', {}).get('h24', {}).get('sells', 0)
                
                report.append("\n📈 **Trading Action** (via DexScreener)")
                report.append(f"💵 **Price**: ${price:.6f} ({change_24h:+.2f}%)")
                report.append(f"🛒 **24h Txns**: 🟢 {buys_24h} Buys | 🔴 {sells_24h} Sells")
                
                # Market Sentiment
                total_txns = buys_24h + sells_24h
                ratio = buys_24h / total_txns if total_txns > 0 else 0.5
                sentiment = "🐂 Bullish" if ratio > 0.55 else ("🐻 Bearish" if ratio < 0.45 else "⚖️ Neutral")
                report.append(f"🧭 **Sentiment**: {sentiment} (Buy Ratio: {ratio:.0%})")

    except Exception as e:
        report.append(f"⚠️ DexScreener API Error: {e}")

    print("\n".join(report))

if __name__ == "__main__":
    fetch_data()
