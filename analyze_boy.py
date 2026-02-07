import requests
import json
import base64
import os

API_KEY = "sk-sp68O5PvPx6wpLQae9nkILnE5xruqXsFz97S0C5jGJ4lGScc"
BASE_URL = "https://api.hodlai.fun/v1/chat/completions"
IMAGE_PATH = "/root/.openclaw/media/inbound/file_140---05656e67-1578-471c-becf-41e002be1659.jpg"

def analyze_image():
    print("🚀 Analyzing uploaded image...")
    
    # Encode image
    with open(IMAGE_PATH, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    payload = {
        "model": "gemini-3-pro-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Describe this boy's facial features, hair style, eye shape, and expression in extreme detail. I need to generate an image of him as an angel, so capture his likeness accurately."},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 500
    }
    
    try:
        response = requests.post(BASE_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        description = data['choices'][0]['message']['content']
        print(f"DESCRIPTION: {description}")
        return description
            
    except Exception as e:
        print(f"ERROR: {e}")
        return None

if __name__ == "__main__":
    analyze_image()
