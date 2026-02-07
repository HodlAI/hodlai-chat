import urllib.request
import xml.etree.ElementTree as ET
import json
import os
import time
from datetime import datetime
import sys

FEED_URL = "https://www.v2ex.com/feed/hodlai.xml"
STATE_FILE = os.path.join(os.path.dirname(__file__), "state.json")

def get_last_check():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                return json.load(f).get('last_guid_set', [])
        except:
            return []
    return []

def save_current_state(guids):
    with open(STATE_FILE, 'w') as f:
        json.dump({'last_guid_set': guids}, f)

def fetch_feed():
    try:
        # V2EX blocks default python user-agent
        req = urllib.request.Request(
            FEED_URL, 
            data=None, 
            headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        )
        with urllib.request.urlopen(req) as response:
            return response.read()
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

def parse_feed(xml_data):
    root = ET.fromstring(xml_data)
    # Handle Atom namespace if present, but V2EX is typically Atom 1.0
    # The V2EX feed is technically Atom. The root is {http://www.w3.org/2005/Atom}feed
    
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    entries = []
    
    for entry in root.findall('atom:entry', ns):
        title = entry.find('atom:title', ns).text
        link = entry.find('atom:link', ns).attrib['href']
        # Simple ID tracking
        id_tag = entry.find('atom:id', ns).text
        author = entry.find('atom:author/atom:name', ns).text
        published = entry.find('atom:published', ns).text
        
        entries.append({
            "title": title,
            "link": link,
            "id": id_tag,
            "author": author,
            "published": published
        })
        
    return entries

def main():
    old_guids = set(get_last_check())
    
    try:
        xml_data = fetch_feed()
        entries = parse_feed(xml_data)
    except Exception as e:
        # Fallback for error/parsing
        print(json.dumps({"error": f"Parse failure: {str(e)}"}))
        return

    new_posts = []
    current_guids = []
    
    for entry in entries:
        current_guids.append(entry['id'])
        if entry['id'] not in old_guids:
            new_posts.append(entry)
            
    # Save the new state (latest 50 guids to prevent infinite growth)
    save_current_state(current_guids[:50])
    
    if new_posts:
        print(json.dumps({"new_posts": new_posts}))
    else:
        print(json.dumps({"new_posts": []}))

if __name__ == "__main__":
    main()
