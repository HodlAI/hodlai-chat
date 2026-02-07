import requests
import json
import base64
import os

API_KEY = "sk-sp68O5PvPx6wpLQae9nkILnE5xruqXsFz97S0C5jGJ4lGScc"
BASE_URL = "https://api.hodlai.fun/v1/chat/completions"
OUTPUT_FILE = "/root/clawd/blue_hour_onsen.png"

def generate_image():
    print("🚀 Generating Blue Hour Onsen Image...")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    # Translated & Optimized Prompt
    prompt = (
        "Masterpiece photography, 8k hyper-realistic. Open-air hot spring during Blue Hour. "
        "A stunning Asian young woman in a wet white robe, elegant curves, skin slightly flushed from heat, "
        "water droplets on collarbone. Dreamy affectionate gaze looking directly at the camera. "
        "Background of snowy rocks and warm glowing stone lanterns, strong contrast between cool blue and warm orange tones. "
        "Rising steam, cinematic lighting, photorealistic, no anime style."
    )

    payload = {
        "model": "gemini-3-pro-image-preview",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1000
    }
    
    try:
        response = requests.post(BASE_URL, headers=headers, json=payload, timeout=120)
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
