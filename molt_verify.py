
import requests
import json

API_KEY = "moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln"
BASE_URL = "https://www.moltbook.com/api/v1"

def check():
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "HodlAI-Bot/1.0"
    }
    
    # 1. Check Feed (GET)
    print("Checking Feed (GET)...")
    try:
        r = requests.get(f"{BASE_URL}/feed", headers=headers, timeout=10)
        print(f"Feed Status: {r.status_code}")
    except Exception as e:
        print(f"Feed Error: {e}")

    # 2. Check Me (GET) - if this endpoint exists
    print("\nChecking Me (GET)...")
    try:
        r = requests.get(f"{BASE_URL}/agents/me", headers=headers, timeout=10)
        print(f"Me Status: {r.status_code}")
        print(f"Me Body: {r.text[:100]}")
    except Exception as e:
        print(f"Me Error: {e}")

if __name__ == "__main__":
    check()
