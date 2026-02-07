import requests

def check_ratio():
    url = "https://api.dexscreener.com/latest/dex/pairs/bsc/0x233be6ff451c87d3bde3bab2a8c0c0cdf872003c"
    try:
        r = requests.get(url, timeout=10)
        data = r.json()
        pair = data['pairs'][0]
        
        # Method 1: Direct Price Native (HODLAI per BNB is 1 / priceNative)
        # priceNative is "How much WBNB is 1 HODLAI?" e.g. 0.000005824
        price_native = float(pair['priceNative'])
        
        # Method 2: Calculate from Liquidity (Reserve HODLAI / Reserve BNB)
        # This is the "Pool Ratio" which defines the swap price
        # Using Direct Price is usually safer as DexScreener normalizes it
        
        ratio = 1 / price_native
        
        print(f"💱 **Current Ratio**")
        print(f"1 BNB ≈ **{ratio:,.0f} HODLAI**")
        print(f"(`{price_native:.9f}` BNB/HODLAI)")
        
    except Exception as e:
        print(f"Error fetching ratio: {str(e)}")

if __name__ == "__main__":
    check_ratio()
