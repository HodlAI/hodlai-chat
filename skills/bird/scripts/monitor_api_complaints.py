#!/usr/bin/env python3
import time
import subprocess
import logging
import json
import re

# --- Configuration ---
CHECK_INTERVAL = 300  # 5 minutes
KEYWORDS = [
    "deepseek 贵", "deepseek 额度", 
    "openai api expensive", "claude api expensive", "claude limit", "api 额度不够",
    "gpt-4 expensive", "gpt-4 limit",
    "midjourney expensive", "midjourney sub",
    "chatgpt limit"
]
MAX_RESULTS = 5
TELEGRAM_BOT_ID = "-1003802812664" # Main group
# ---------------------

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def run_bird_search(query):
    """Execution bird CLI search"""
    try:
        # Use bird search --json
        cmd = ["bird", "search", query, "-n", str(MAX_RESULTS), "--json", "--fresh"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except Exception as e:
        logging.error(f"Bird search failed: {e}")
        return []

def format_tweet(tweet):
    """Format tweet for Telegram"""
    author = tweet.get('author', {}).get('screenName', 'unknown')
    text = tweet.get('text', '')
    url = tweet.get('url', '')
    return f"🐦 **Op Found** (@{author})\n\n\"{text}\"\n\n🔗 {url}"

def main():
    logging.info("Starting API Complaint Monitor...")
    
    # Simple loop for now (or integrate into cron)
    for keyword in KEYWORDS:
        logging.info(f"Searching for: {keyword}")
        tweets = run_bird_search(keyword)
        
        for tweet in tweets:
            # Basic deduplication logic would go here (using a simple file DB)
            msg = format_tweet(tweet)
            print("FOUND LEAD:\n" + msg)
            # In a real run, we would send this to the TG group via openclaw message tool
            # For now, we just log it.

if __name__ == "__main__":
    main()
