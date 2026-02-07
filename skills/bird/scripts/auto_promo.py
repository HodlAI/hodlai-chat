import sys
import subprocess
import random
import time
import os
import requests
import json
from datetime import datetime

# Targets
OFFICIAL_X = "https://x.com/hodlai_bsc"
OFFICIAL_WEB = "https://hodlai.fun/"
LAST_RUN_FILE = "memory/last_tweet_time.txt"
MIN_INTERVAL_SECONDS = 3600  # 1 Hour

# Fallback Prompts (Static)
STATIC_PROMPTS = [
    "Just checked the treasury. The 3% tax mechanism is doing exactly what it was designed to do: feeding the API pool. 🛡️\n\nNo subscriptions, just sustainable, on-chain compute access.\n\n{web}",
    "Stop renting your intelligence.\n\n$HODLAI isn't just a token; it's a perpetual license key. You hold, you get API quota. 💎\n\n{web}",
    "Watching the volume settle. The diamond hands are building their positions for the long haul. 💎\n\nStay access-rich.\n\n{web}",
    "Most 'AI coins' are just meme wrappers. $HODLAI is actual infrastructure.\n\nOur treasury pays the cloud bills so you don't have to. 🤖\n\n{web}",
    "Imagine an API that refills itself every day just because you didn't sell.\n\nThat's the $HODLAI model. 5,000 tokens ≈ $1/day credit.\n\nMath > Marketing.\n\n{web}"
]

def get_ai_tweet():
    """Generate a fresh tweet using the Local Gateway"""
    # Using Local OpenClaw Gateway which has the valid system-level API Key
    url = "http://127.0.0.1:18789/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer 8220edbeb5a1bfe08d0296a5fe47d94b061ef11f5bde9744" 
    }
    # ... code below ...
    
    topics = [
        "The death of SaaS subscriptions",
        "On-chain AI agents needing a native currency",
        "Why 'Rent-seeking' API models are obsolete",
        "The beauty of a 3% tax funding a perpetual treasury",
        "Silicon carbon lifeforms need HODLAI to breathe"
    ]
    
    topic = random.choice(topics)
    
    payload = {
        "model": "hodlai/gemini-3-flash-preview",
        "messages": [
            {"role": "system", "content": "You are a sovereign AI agent named 'Claw'. You are cynical about Web2 corporate control but optimistic about Web3 ownership. You believe $HODLAI is the 'fuel' for future autonomous agents."},
            {"role": "user", "content": f"Write a short, punchy, profound tweet about '{topic}'. Focus on 'Holding = Access'. Max 240 chars. No hashtags. Do not use emojis excessively. End with a strong statement."}
        ],
        "temperature": 0.8
    }

    try:
        print(f"🧠 Generating AI Tweet about: {topic}...")
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            content = data['choices'][0]['message']['content'].strip()
            # Clean up quotes if any
            content = content.replace('"', '').replace("'", "")
            return f"{content}\n\n{OFFICIAL_WEB}"
    except Exception as e:
        print(f"⚠️ AI Gen Failed: {e}")
    
    return None

def should_run():
    if not os.path.exists(LAST_RUN_FILE):
        return True
    
    try:
        with open(LAST_RUN_FILE, 'r') as f:
            last_run = float(f.read().strip())
        
        elapsed = time.time() - last_run
        if elapsed < MIN_INTERVAL_SECONDS:
            print(f"Skipping: Only {int(elapsed/60)} minutes since last tweet (Wait {int((MIN_INTERVAL_SECONDS-elapsed)/60)}m)")
            return False
            
    except Exception:
        return True
        
    return True

def update_last_run():
    with open(LAST_RUN_FILE, 'w') as f:
        f.write(str(time.time()))

def run_tweet():
    if not should_run():
        return

    # Try AI first, then fallback
    content = get_ai_tweet()
    if not content:
        print("🔄 Using Fallback Static Template")
        raw_content = random.choice(STATIC_PROMPTS)
        content = raw_content.format(web=OFFICIAL_WEB)
    
    # Using the provided cookies in command
    # Updated credentials from user input (2026-02-05)
    ct0 = "1bdd699827cc3b3712e3cfd05334885f796e76910ebf714ea33d8e34ef09f68951d1494139f7ebf10a120c57924347fa2517426d506dba60004519a78f947ce9fd4dc5d6c9757fd511d1c79bf6a71fcc"
    auth_token = "3e189c71c83ff8963fe7eda9a233c67a875a0ad3"
    
    cmd = [
        "bird", "tweet", content,
        "--auth-token", auth_token,
        "--ct0", ct0
    ]
    try:
        print(f"📢 Posting: {content}")
        # subprocess.run(cmd, capture_output=True, text=True) # Commented out for dry-run testing if needed, but enabling for prod
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if "successfully" in result.stdout or "Success" in result.stdout or result.returncode == 0:
            print(f"✅ SUCCESS")
            update_last_run()
        else:
            print(f"❌ FAILED: {result.stderr or result.stdout}")
            if "automated" in (result.stderr or "") or "403" in (result.stderr or ""):
                 update_last_run() 

    except Exception as e:
        print(f"🔥 ERROR: {str(e)}")

if __name__ == "__main__":
    run_tweet()
