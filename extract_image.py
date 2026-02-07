import json
import base64
import re
import os

try:
    with open('/root/clawd/temp_response.json', 'r') as f:
        data = json.load(f)
        
    choice = data['choices'][0]
    message = choice.get('message', {})
    content = message.get('content', '')
    
    print(f"Content Type: {type(content)}")
    print(f"Content length: {len(content)}")
    
    # Check for Markdown image with Base64
    # Pattern: ![alt](data:image/png;base64,...)
    match = re.search(r'data:image\/(\w+);base64,([a-zA-Z0-9+/=]+)', content)
    
    if match:
        ext = match.group(1)
        img_data = match.group(2)
        print(f"Found Base64 image! Extension: {ext}")
        
        filename = f"/root/clawd/output_image.{ext}"
        with open(filename, "wb") as img_file:
            img_file.write(base64.b64decode(img_data))
            
        print(f"Saved to {filename}")
    else:
        print("No Base64 image found in content.")
        print("Snippet:", content[:200])
        
except Exception as e:
    print(f"Error: {e}")
