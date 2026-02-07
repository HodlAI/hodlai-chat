import requests
import json
import base64
import os

API_KEY = "sk-sp68O5PvPx6wpLQae9nkILnE5xruqXsFz97S0C5jGJ4lGScc"
BASE_URL = "https://api.hodlai.fun/v1/chat/completions"
# Using Flash model for vision sometimes works better if Pro is strict/lazy
MODEL = "gemini-3-flash-preview" 

IMAGE_PATH = "/root/.openclaw/media/inbound/file_140---05656e67-1578-471c-becf-41e002be1659.jpg"

def analyze_image():
    print(f"🚀 Analyzing uploaded image with {MODEL}...")
    
    with open(IMAGE_PATH, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Describe this person's face in detail: age (approx 5-8?), hair (short black), eyes (shape), expression (relaxed/smiling?), cheeks (rosy?). Be specific for an artist reference."},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 800
    }
    
    try:
        response = requests.post(BASE_URL, headers=headers, json=payload, timeout=60)
        
        if response.status_code != 200:
            print(f"HTTP Error: {response.text}")
            return

        data = response.json()
        description = data['choices'][0]['message']['content']
        print(f"DESCRIPTION: {description}")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    analyze_image()
