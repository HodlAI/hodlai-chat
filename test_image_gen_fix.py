import requests
import json
import base64
import os

API_KEY = "sk-sp68O5PvPx6wpLQae9nkILnE5xruqXsFz97S0C5jGJ4lGScc"
BASE_URL = "https://api.hodlai.fun/v1/chat/completions"
OUTPUT_FILE = "/root/clawd/test_output.png"

def generate_image():
    print("🚀 Sending request to Gemini 3 Pro Image Preview (Schema Fix)...")
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
        message = data['choices'][0]['message']
        
        # Check for custom 'images' field
        if 'images' in message and len(message['images']) > 0:
            first_image = message['images'][0]
            if 'image_url' in first_image and 'url' in first_image['image_url']:
                data_url = first_image['image_url']['url']
                
                # Format: "data:image/png;base64,..."
                if "base64," in data_url:
                    b64_data = data_url.split("base64,")[1]
                    
                    with open(OUTPUT_FILE, "wb") as f:
                        f.write(base64.b64decode(b64_data))
                    
                    print(f"\n✅ Image extracted from custom 'images' field!")
                    print(f"💾 Saved to: {OUTPUT_FILE}")
                    return OUTPUT_FILE
        
        print("\n⚠️  No image found in custom 'images' field.")
        print("Keys in message:", message.keys())
        return None
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return None

if __name__ == "__main__":
    generate_image()
