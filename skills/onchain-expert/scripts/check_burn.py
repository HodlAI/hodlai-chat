
import requests
import sys

# BSC Public RPC
RPC_URL = "https://bsc-dataseed.binance.org/"

# Token Contracts
TOKEN_ADDRESS = "0x987e6269c6b7ea6898221882f11ea16f87b97777"
DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD"

# ERC20 balanceOf signature: 70a08231
# Pad address to 64 chars (32 bytes)
PADDED_ADDRESS = "000000000000000000000000" + DEAD_ADDRESS[2:]
DATA = "0x70a08231" + PADDED_ADDRESS

def get_balance():
    payload = {
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [
            {
                "to": TOKEN_ADDRESS,
                "data": DATA
            },
            "latest"
        ],
        "id": 1
    }
    
    try:
        response = requests.post(RPC_URL, json=payload, timeout=10)
        result = response.json()
        
        if "result" in result:
            hex_balance = result["result"]
            balance_wei = int(hex_balance, 16)
            balance_tokens = balance_wei / 1e18 # Assuming 18 decimals
            return balance_tokens
        else:
            print(f"RPC Error: {result}")
            return None
            
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    burned = get_balance()
    if burned is not None:
        total_supply = 1_000_000_000
        percent = (burned / total_supply) * 100
        print(f"🔥 **Burn Stats**")
        print(f"💰 **Total Burned**: {burned:,.2f} HODLAI")
        print(f"📊 **Burn Rate**: {percent:.2f}%")
        print(f"💀 **Dead Wallet**: `{DEAD_ADDRESS}`")
    else:
        print("Failed to fetch burn data.")
