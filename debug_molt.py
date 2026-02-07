import requests
import os

url = "https://www.moltbook.com/"
headers = {
    "User-Agent": "Mozilla/5.0"
}

print(f"Testing {url}...")
try:
    r = requests.get(url, headers=headers, timeout=10)
    print(f"HTML Status: {r.status_code}")
except Exception as e:
    print(f"HTML Error: {e}")

api_url = "https://www.moltbook.com/api/v1/feed"
# Manually reading the key from the file I read earlier
api_key = "moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln"
api_headers = {
    "Authorization": f"Bearer {api_key}",
    "User-Agent": "Mozilla/5.0"
}

print(f"Testing {api_url}...")
try:
    r = requests.get(api_url, headers=api_headers, timeout=10)
    print(f"API Status: {r.status_code}")
    if r.status_code == 200:
        print("API Content Start:", r.text[:100])
except Exception as e:
    print(f"API Error: {e}")
