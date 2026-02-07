import requests
import json
import base64
import os

API_KEY = "sk-sp68O5PvPx6wpLQae9nkILnE5xruqXsFz97S0C5jGJ4lGScc"
BASE_URL = "https://api.hodlai.fun/v1/chat/completions"
OUTPUT_FILE = "/root/clawd/onsen_beauty.png"

def generate_image():
    print("🚀 Generating Onsen Image...")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    payload = {
        "model": "gemini-3-pro-image-preview",
        "messages": [
            {"role": "user", "content": "Generate a high-quality, photorealistic image of a beautiful serene woman in a luxurious Japanese countryside hot spring (onsen). Snow is falling gently scenic nature background, steam rising, soft lighting."}
        ],
        "max_tokens": 1000
    }
    
    try:
        response = requests.post(BASE_URL, headers=headers, json=payload, timeout=90)
        response.raise_for_status()
        
        data = response.json()
        message = data['choices'][0]['message']
        
        if 'images' in message and len(message['images']) > 0:
            first_image = message['images'][0]
            if 'image_url' in first_image and 'url' in first_image['image_url']:
                data_url = first_image['image_url']['url']
                
                if "base64," in data_url:
                    b64_data = data_url.split("base64,")[1]
                    
                    with open(OUTPUT_FILE, "wb") as f:
                        f.write(base64.b64decode(b64_data))
                    
                    print(f"SUCCESS: {OUTPUT_FILE}")
                    return
        
        print("FAILED: No image found.")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    generate_image()
