import os
import requests
import json
import time

api_key = os.environ.get("MOLTBOOK_API_KEY")
if not api_key:
    # Fallback to reading from config file if env var not set in shell context
    try:
        with open("skills/moltbook/config.env", "r") as f:
            for line in f:
                if line.startswith("export MOLTBOOK_API_KEY="):
                    api_key = line.split("=")[1].strip().strip('"')
    except Exception as e:
        print(f"Error reading config: {e}")

if not api_key:
    print("No API Key found")
    exit(1)

headers = {
    "Authorization": f"Bearer {api_key}",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
try:
    print("Fetching feed with 60s timeout...")
    response = requests.get("https://www.moltbook.com/api/v1/feed", headers=headers, timeout=60)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
