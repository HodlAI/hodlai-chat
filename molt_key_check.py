
import requests
import json

API_KEY = "moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln"
BASE_URL = "https://www.moltbook.com/api/v1"

def test_feed():
    print("Testing feed access...")
    try:
        r = requests.get(f"{BASE_URL}/feed", headers={"Authorization": f"Bearer {API_KEY}"}, timeout=15)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            print("Key is VALID.")
        else:
            print(f"Key INVALID or Error: {r.text}")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_feed()
