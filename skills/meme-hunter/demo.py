import os
import time
import random
from openai import OpenAI

# ----------------- CONFIG -----------------
# Point to HODLAI Gateway
CLIENT = OpenAI(
    base_url="https://api.hodlai.fun/v1",
    api_key="sk-xxxx" # User's HODLAI Key
)
MODEL = "deepseek-chat" # Smart & Cheap
# ------------------------------------------

def scan_new_pairs():
    """
    Mock function: In real life, listen to WebSocket wss://bsc-rpc.publicnode.com
    """
    print("[*] Scanning BSC Mempool for new pairs...")
    time.sleep(1)
    # Simulate finding a random token
    mock_token = {
        "name": f"Elon{random.randint(1,999)}",
        "address": f"0x{random.getrandbits(160):040x}",
        "code_snippet": "function transfer() { if(msg.sender != owner) revert(); }" # HoneyPot!
    }
    return mock_token

def analyze_risk(token_data):
    """
    The Brain: Ask HODLAI AI to audit the code/metadata
    """
    print(f"[-] Auditing {token_data['name']} ({token_data['address']})...")
    
    prompt = f"""
    Analyze this Solidity snippet for a BSC token. 
    Is it a HoneyPot? rate safety 0-100.
    Code: {token_data['code_snippet']}
    """
    
    try:
        response = CLIENT.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        analysis = response.choices[0].message.content
        print(f"[AI Brain]: {analysis}")
        return 5 # Low score because it's a honeypot
    except Exception as e:
        print(f"[!] Error: {e}")
        return 0

def execute_trade(token_addr, action="BUY"):
    """
    The Hand: Execute swap on PancakeSwap
    """
    print(f"[$$$] {action} {token_addr} executed! 🚀")

def main():
    print("🦁 HODL-HUNTER BOT STARTED...")
    while True:
        token = scan_new_pairs()
        safety_score = analyze_risk(token)
        
        if safety_score > 80:
            print(f"[+] GEM FOUND! Score: {safety_score}. APE IN!")
            execute_trade(token['address'])
        else:
            print(f"[-] PASS. Score: {safety_score}. Looks scammy.")
            
        print("-" * 30)
        time.sleep(3)

if __name__ == "__main__":
    main()
