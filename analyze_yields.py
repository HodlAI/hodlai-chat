import json

try:
    with open('/root/clawd/yields.json', 'r') as f:
        data = json.load(f)
    
    # Filter for Stablecoins, TVL > $10M, APY < 500% (exclude scams/errors)
    pools = data.get('data', [])
    stable_symbols = ['USDT', 'USDC', 'DAI', 'USDe', 'sUSDe']
    
    filtered = []
    for p in pools:
        if p['tvlUsd'] > 10000000 and p['symbol'] in stable_symbols and p['apy'] < 200:
            filtered.append(p)
            
    # Sort by APY descending
    filtered.sort(key=lambda x: x['apy'], reverse=True)
    
    print(f"Top 5 Stablecoin Yields (TVL > $10m):")
    for p in filtered[:5]:
        print(f"- {p['project'].upper()} ({p['chain']}): {p['symbol']} | APY: {p['apy']:.2f}% | TVL: ${p['tvlUsd']/1000000:.1f}M")

except Exception as e:
    print(f"Error parsing: {e}")
