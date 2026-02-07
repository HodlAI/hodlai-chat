import os
import requests
import json
import sys

# Load API Key
api_key = os.environ.get("MOLTBOOK_API_KEY")
if not api_key:
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

# Args
if len(sys.argv) < 3:
    print("Usage: python3 post_engagement.py <post_id> <content>")
    exit(1)

post_id = sys.argv[1]
content = sys.argv[2]

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
    "User-Agent": "OpenClaw/1.0"
}

payload = {
    "content": content
}

url = f"https://www.moltbook.com/api/v1/posts/{post_id}/comments"

print(f"Posting to {url}...")
try:
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    print(f"Status: {response.status_code}")
    if response.status_code in [200, 201]:
        print("Success!")
        print(response.json())
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
