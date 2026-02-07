
import requests
import json

API_KEY = "moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln"
BASE_URL = "https://www.moltbook.com/api/v1"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "User-Agent": "HodlAI-Bot/1.0"
}

def debug_feed():
    try:
        resp = requests.get(f"{BASE_URL}/feed", headers=HEADERS, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"Type: {type(data)}")
            if isinstance(data, list):
                print(f"Length: {len(data)}")
                if len(data) > 0:
                    print("First item sample:")
                    print(json.dumps(data[0], indent=2))
            elif isinstance(data, dict):
                print("Dictionary keys:", data.keys())
                if 'posts' in data:
                    print(f"Posts field type: {type(data['posts'])}")
                    if isinstance(data['posts'], list) and len(data['posts']) > 0:
                        print("First item sample:")
                        print(json.dumps(data['posts'][0], indent=2))
                if 'data' in data:
                    print(f"Data field type: {type(data['data'])}")
                    if isinstance(data['data'], list) and len(data['data']) > 0:
                        print("First item sample:")
                        print(json.dumps(data['data'][0], indent=2))
            else:
                print("Unknown structure")
                print(data)
        else:
            print(resp.text)
    except Exception as e:
        print(e)

debug_feed()
