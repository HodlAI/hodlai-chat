import requests
import json
import base64
import os

API_KEY = "sk-sp68O5PvPx6wpLQae9nkILnE5xruqXsFz97S0C5jGJ4lGScc"
BASE_URL = "https://api.hodlai.fun/v1/chat/completions"
OUTPUT_FILE = "/root/clawd/angel_boy.png"

def generate_image():
    print("🚀 Generating Angel Boy...")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    # Based on analysis: East Asian boy, 5-8yo, short black hair, rosy cheeks, dark brown almond eyes.
    prompt = (
        "Full body portrait of a cute 6-year-old Asian boy as a divine little angel. "
        "He has short straight black hair, rosy cheeks, dark brown almond eyes, and a gentle sweet smile. "
        "He is wearing a beautiful flowing white robe with gold trim. Large, fluffy, majestic white feathered wings on his back. "
        "A glowing golden halo floats above his head. He is standing on a soft cloud in a heavenly sky with golden sunlight beams. "
        "Magical, ethereal, high quality, photorealistic, 8k resolution, soft cinematic lighting."
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
