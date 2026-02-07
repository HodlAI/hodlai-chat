import json
import sys

try:
    with open('/root/clawd/temp_response.json', 'r') as f:
        data = json.load(f)
        content = data['choices'][0]['message']['content']
        print(content)
except Exception as e:
    print(f"Error: {e}")
