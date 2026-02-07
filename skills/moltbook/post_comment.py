import os
import requests
import sys

# Get arguments
if len(sys.argv) < 3:
    print("Usage: python3 skills/moltbook/post_comment.py <post_id> <content>")
    sys.exit(1)

post_id = sys.argv[1]
content = sys.argv[2]

# Load API Key
api_key = os.environ.get("MOLTBOOK_API_KEY")
if not api_key:
    try:
        with open("skills/moltbook/config.env", "r") as f:
            for line in f:
                if line.startswith("export MOLTBOOK_API_KEY="):
                    api_key = line.split("=")[1].strip().strip('"')
    except Exception as e:
        pass

if not api_key:
    # Hardcoded fallback
    api_key = "moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln"

print(f"Using API Key: {api_key[:5]}...")

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

payload = {
    "content": content
}

url = f"https://www.moltbook.com/api/v1/posts/{post_id}/comments"

try:
    print(f"Posting comment to {post_id}...")
    response = requests.post(url, headers=headers, json=payload, timeout=60)
    
    print(f"Status: {response.status_code}")
    print(response.text)
    
    if response.status_code == 201 or response.status_code == 200:
        print("SUCCESS")
    else:
        print("FAILED")
        
except Exception as e:
    print(f"Exception: {e}")
