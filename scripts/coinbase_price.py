import requests
import sys

def get_price(symbol="SOL"):
    url = f"https://api.coinbase.com/v2/prices/{symbol}-USD/spot"
    try:
        data = requests.get(url).json()
        price = data['data']['amount']
        print(f"--- Coinbase Real-time ---")
        print(f"{symbol} Price: ${price} USD")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    sym = sys.argv[1] if len(sys.argv) > 1 else "SOL"
    get_price(sym)
