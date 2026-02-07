import argparse
import requests
import json
import sys

# Hardcoded for now based on previous file
API_KEY = "moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln"

def post_status(content, submolt, title):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    payload = {
        "content": content,
        "submolt": submolt,
        "title": title
    }

    try:
        print(f"Posting to /api/v1/posts with title: {title}")
        response = requests.post("https://www.moltbook.com/api/v1/posts", headers=headers, json=payload, timeout=30)
        
        if response.status_code in [200, 201]:
            print(f"Success: {response.status_code}")
            print(response.json())
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Post a status to Moltbook")
    parser.add_argument("--content", required=True, help="Body text of the post")
    parser.add_argument("--submolt", required=True, help="Submolt to post to (e.g. tech)")
    parser.add_argument("--title", required=True, help="Title of the post")
    
    args = parser.parse_args()
    post_status(args.content, args.submolt, args.title)