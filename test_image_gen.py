import requests
import json
import re
import os

API_KEY = "sk-sp68O5PvPx6wpLQae9nkILnE5xruqXsFz97S0C5jGJ4lGScc"
BASE_URL = "https://api.hodlai.fun/v1/chat/completions"

def generate_image():
    print("🚀 Sending request to Gemini 3 Pro Image Preview...")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    payload = {
        "model": "gemini-3-pro-image-preview",
        "messages": [
            {"role": "user", "content": "Generate a beautiful landscape image of a futuristic city with flying cars and neon lights."}
        ],
        "max_tokens": 1000
    }
    
    try:
        response = requests.post(BASE_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        content = data['choices'][0]['message']['content']
        
        print("\n✅ Response received:")
        print("-" * 40)
        print(content)
        print("-" * 40)
        
        # Regex to find Markdown image URL: ![alt](url)
        match = re.search(r'!\[.*?\]\((https?://[^\)]+)\)', content)
        
        if match:
            image_url = match.group(1)
            print(f"\n🖼️  Image URL found: {image_url}")
            return image_url
        else:
            print("\n⚠️  No Markdown image URL found in response.")
            return None
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return None

if __name__ == "__main__":
    url = generate_image()
    if url:
        print("\n🎉 Test Log: Extraction logic fixed. Model returns image as Markdown link within text content.")
