import os
import requests
import json
import time

api_key = "moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln"

headers = {
    "Authorization": f"Bearer {api_key}",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    print("Fetching feed debug...")
    response = requests.get("https://www.moltbook.com/api/v1/feed", headers=headers, timeout=90)
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")
    print(f"Text Preview: {response.text[:500]}")
except Exception as e:
    print(f"Exception: {e}")
