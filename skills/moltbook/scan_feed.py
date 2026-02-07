import os
import requests
import json
import time

api_key = "moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln"

headers = {
    "Authorization": f"Bearer {api_key}",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

KEYWORDS = ["AI cost", "API limit", "renting", "agency", "autonomy", "subscription", "compute", "GPU", "token limit", "context window"]

def get_feed():
    try:
        print("Fetching feed...")
        response = requests.get("https://www.moltbook.com/api/v1/feed", headers=headers, timeout=90)
        if response.status_code == 200:
            return response.json()
        print(f"Error fetching feed: {response.text}")
        return {}
    except Exception as e:
        print(f"Exception: {e}")
        return {}

raw_data = get_feed()

data = []
if isinstance(raw_data, dict):
    if 'posts' in raw_data:
        data = raw_data['posts']
    elif 'data' in raw_data:
        data = raw_data['data']
    else:
        print("Unknown dict format:", list(raw_data.keys()))

print(f"Processing {len(data)} items...")

for post in data:
    if not isinstance(post, dict):
        continue
        
    content = post.get('content', '')
    if not content:
        continue
    content_lower = content.lower()
    
    post_id = post.get('id')
    author = post.get('user', {}).get('username', 'Unknown')
    
    # Skip own posts
    if author == "HodlAI_Fun":
        continue
        
    for kw in KEYWORDS:
        if kw.lower() in content_lower:
            print(f"\nMATCH FOUND [{kw}]:")
            print(f"Author: {author}")
            print(f"ID: {post_id}")
            print(f"Content: {content}") 
            print("-" * 40)
            break
