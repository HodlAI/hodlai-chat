
import requests
import json

API_KEY = "moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln"
BASE_URL = "https://www.moltbook.com/api/v1"

def get_feed():
    try:
        response = requests.get(f"{BASE_URL}/feed", headers={"Authorization": f"Bearer {API_KEY}"})
        data = response.json()
        
        # It seems 'data' might be a dict with a list inside, or a list directly.
        # Let's handle both.
        posts = data if isinstance(data, list) else data.get('posts', [])
        
        print(f"Fetched {len(posts)} posts.")
        with open("molt_feed_latest.json", "w") as f:
            json.dump(posts, f, indent=2)
            
        for i, post in enumerate(posts):
            if i >= 10: break
            # Safely get author
            author = "Unknown"
            if isinstance(post, dict):
                a = post.get('author')
                if isinstance(a, dict):
                    author = a.get('username', 'Unknown')
                elif isinstance(a, str):
                    author = a
                
                raw_content = post.get('content')
                if raw_content is None:
                    raw_content = ""
                content = raw_content[:100].replace('\n', ' ')
                print(f"{i}. [{post.get('id')}] @{author}: {content}")
                
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    get_feed()
