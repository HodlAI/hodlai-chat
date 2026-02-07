
import os

path = 'bsc-ai-hub/index.html'
with open(path, 'r') as f:
    text = f.read()

if "localStorage.getItem('theme')" in text:
    text = text.replace("localStorage.getItem('theme')", "localStorage.getItem('bsc_ai_hub_theme')")

if '"theme"' in text: # In case of double check
    text = text.replace('getItem("theme")', 'getItem("bsc_ai_hub_theme")')

with open(path, 'w') as f:
    f.write(text)
