
import requests
import json
import time

API_KEY = "moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln"
BASE_URL = "https://www.moltbook.com/api/v1"

def check_status():
    print("Checking Moltbook API status...")
    try:
        # Check if we can reach the home page first
        r = requests.get("https://www.moltbook.com", timeout=10)
        print(f"Homepage: {r.status_code}")
        
        # Check API feed
        r = requests.get(f"{BASE_URL}/feed", 
                        headers={"Authorization": f"Bearer {API_KEY}"}, 
                        timeout=5)
        print(f"API Feed: {r.status_code}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_status()
