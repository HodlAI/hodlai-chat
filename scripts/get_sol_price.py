import requests

def get_sol_price():
    # 搜索 Solana 链上符号为 SOL 的最强交易对
    url = "https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        # 过滤出 solana 链上的对
        sol_pairs = [p for p in data.get('pairs', []) if p.get('chainId') == 'solana']
        
        if sol_pairs:
            # 取流动性最高的一个
            top_pair = sorted(sol_pairs, key=lambda x: x.get('liquidity', {}).get('usd', 0), reverse=True)[0]
            
            price = top_pair['priceUsd']
            h24_change = top_pair['priceChange'].get('h24', 0)
            pair_addr = top_pair['pairAddress']
            dex = top_pair['dexId']
            
            print(f"--- SOL Real-time (Token Search) ---")
            print(f"Price: ${price} USD")
            print(f"24h Change: {h24_change}%")
            print(f"DEX: {dex} | Pair: {pair_addr}")
        else:
            print("Error: No valid SOL pairs found on Solana chain.")
    except Exception as e:
        print(f"Execution Error: {str(e)}")

if __name__ == "__main__":
    get_sol_price()
