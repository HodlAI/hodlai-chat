import requests
import json
import os
import time

# HODLAI BSC Pair
PAIR_ADDRESS = "0x233BE6ff451C87D3bde3bAb2A8c0c0CdF872003c"
STATE_FILE = "memory/hodlai_price_state.json"

# Thresholds
VOL_CHANGE_THRESHOLD = 50.0  # 50% change in 1h
PRICE_CHANGE_THRESHOLD = 5.0  # 5% change in 1h

def fetch_data():
    try:
        resp = requests.get(f"https://api.dexscreener.com/latest/dex/pairs/bsc/{PAIR_ADDRESS}", timeout=10)
        return resp.json().get('pair')
    except:
        return None

def monitor():
    current = fetch_data()
    if not current:
        return

    price = float(current.get('priceUsd', 0))
    vol_h1 = float(current.get('volume', {}).get('h1', 0))
    
    # Persistent state
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            prev = json.load(f)
    else:
        prev = {"price": price, "vol_h1": vol_h1, "timestamp": time.time()}

    price_diff = abs((price - prev['price']) / prev['price'] * 100) if prev['price'] > 0 else 0
    vol_diff = ((vol_h1 - prev['vol_h1']) / prev['vol_h1'] * 100) if prev['vol_h1'] > 0 else 0

    alerts = []
    if price_diff >= PRICE_CHANGE_THRESHOLD:
        trend = "📈 暴涨" if price > prev['price'] else "📉 暴跌"
        alerts.append(f"{trend}提醒：价格在短时间内波动了 {price_diff:.2f}% (当前 ${price})")
    
    #if vol_diff >= VOL_CHANGE_THRESHOLD and vol_h1 > 1000: # Ignore noise
    #    alerts.append(f"🔥 交易量激增：1h交易量增长了 {vol_diff:.2f}% (当前 ${vol_h1:,.0f})")

    # Personal Alerts Check
    ALERTS_FILE = "memory/personal_alerts.json"
    if os.path.exists(ALERTS_FILE):
        try:
            with open(ALERTS_FILE, 'r') as f:
                personal_alerts = json.load(f)
            
            updated = False
            for pa in personal_alerts:
                if pa.get("notified"):
                    continue
                
                target = pa["target_price"]
                uid = pa["user_id"]
                
                if pa["condition"] == "above" and price >= target:
                     # Print a special marker that the bot can parse to send a DM
                     print(f"ALERT_MATCH::{uid}::Mock price reached {target}! Current: {price}")
                     pa["notified"] = True
                     updated = True
            
            if updated:
                with open(ALERTS_FILE, 'w') as f:
                    json.dump(personal_alerts, f)
        except Exception as e:
            print(f"Alert check failed: {e}")

    # Update state
    with open(STATE_FILE, 'w') as f:
        json.dump({"price": price, "vol_h1": vol_h1, "timestamp": time.time()}, f)

    if alerts:
        chart_url = "https://dexscreener.com/bsc/0x233be6ff451c87d3bde3bab2a8c0c0cdf872003c"
        alert_msg = "\n".join(alerts) + f"\n\nChecking chart... {chart_url}"
        print(alert_msg)
    else:
        print("STABLE")

if __name__ == "__main__":
    monitor()
