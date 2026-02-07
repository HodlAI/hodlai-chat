import os
import re
import signal
import sys
import telebot
import time
import logging
from telebot.apihelper import ApiTelegramException

# --- Configuration ---
# Read TOKEN from the environment or fallback to a hardcoded string ONLY if necessary.
# Strongly recommended to set TG_BOT_TOKEN environment variable.
BOT_TOKEN = os.getenv("TG_BOT_TOKEN")
if not BOT_TOKEN:
    # Fallback to reading from .env file manually if env var spans multiple lines or issues
    try:
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("TG_BOT_TOKEN="):
                    BOT_TOKEN = line.split("=", 1)[1].strip()
                    break
    except Exception:
        pass

if not BOT_TOKEN:
    print("Error: TG_BOT_TOKEN not found in environment or .env")
    sys.exit(1)

# Group ID to monitor (The specific group: -1003802812664)
TARGET_GROUP_ID = -1003802812664

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- Keywords List (Dynamic via file) ---
KEYWORDS_FILE = "skills/sentinel/keywords.txt"

def load_keywords():
    default_keywords = [
        r"胜率.*恐怖", r"赚了.*U", r"跟单", r"合约群", 
        r"点我可以进群", r"免费进群", r"带单", r"翻仓",
        r"稳赚", r"内幕消息", r"百倍币", r"千倍币",
        r"精准策略", r"私聊我", r"点击头像", r"看主页",
        r"90%.*胜率", r"95%.*胜率", r"100%.*胜率",
        r"蝴蝶平台", r"AI小赵", r"模仿CZ", r"三公", r"腾讯会议", r"qq群:\d+",
        r"合约大师", r"老师带单", r"无偿带单"
    ]
    if not os.path.exists(KEYWORDS_FILE):
        return default_keywords
    
    with open(KEYWORDS_FILE, "r", encoding="utf-8") as f:
        stored_keywords = [line.strip() for line in f if line.strip()]
    
    # Combine defaults with stored (avoid duplicates)
    final_set = set(default_keywords + stored_keywords)
    return list(final_set)

def save_keyword(new_keyword):
    current = load_keywords()
    if new_keyword not in current:
        # Ensure directory exists
        os.makedirs(os.path.dirname(KEYWORDS_FILE), exist_ok=True)
        with open(KEYWORDS_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n{new_keyword}")
        logger.info(f"Added new keyword: {new_keyword}")
        return True
    return False

# Load initial keywords
SPAM_KEYWORDS = load_keywords()

print(f"Sentinel started with {len(SPAM_KEYWORDS)} keywords.")

# Initialize Bot
bot = telebot.TeleBot(BOT_TOKEN)

# --- Message Handlers ---

@bot.message_handler(func=lambda message: message.chat.id == TARGET_GROUP_ID)
def scan_message(message):
    """Scans every message in the target group for spam keywords."""
    if not message.text:
        return

    text = message.text
    user_id = message.from_user.id
    msg_id = message.message_id
    
    # 1. Check for Command to Add Keywords (Reply to Bot)
    # Format: "@HodlAI_clawdbot add: keyword"
    if message.reply_to_message and message.reply_to_message.from_user.username == bot.get_me().username:
        if "add:" in text.lower() or "添加:" in text:
            # Only allow admins (Hardcoded for Ti and trusted IDs, or dynamic check)
            ADMIN_IDS = [8090464330, 26586285] 
            if user_id in ADMIN_IDS:
                try:
                    # Extract keyword
                    parts = re.split(r"add:|添加:", text, flags=re.IGNORECASE)
                    if len(parts) > 1:
                        new_kw = parts[1].strip()
                        if save_keyword(new_kw):
                            # Reload in memory
                            global SPAM_KEYWORDS
                            SPAM_KEYWORDS = load_keywords()
                            bot.reply_to(message, f"✅ Keyword added: `{new_kw}`. Reloading Sentinel...", parse_mode="Markdown")
                            # Self-restart is handled by PM2 if we exit, or we just reload list dynamically here.
                            # Dynamic reload is safer than exiting.
                        else:
                            bot.reply_to(message, "⚠️ Keyword already exists.")
                except Exception as e:
                    logger.error(f"Error adding keyword: {e}")
            return

    # 1.5 Admin Immunity (Ti & Livid)
    ADMIN_IDS = [8090464330, 26586285]
    if user_id in ADMIN_IDS:
        return  # Absolute immunity for Owners

    # 2. Check Spam Keywords
    for keyword in SPAM_KEYWORDS:
        if re.search(keyword, text, re.IGNORECASE):
            try:
                logger.info(f"Spam detected from {user_id}: {text[:20]}... Keyword: {keyword}")
                bot.delete_message(chat_id=TARGET_GROUP_ID, message_id=msg_id)
                
                # Verify deletion (Optional, consumes API)
                # bot.send_message(TARGET_GROUP_ID, f"🗑️ Auto-deleted spam from user {user_id}")
                return # Stop processing after delete
            except ApiTelegramException as e:
                logger.error(f"Failed to delete message {msg_id}: {e}")
                return

def main():
    while True:
        try:
            logger.info("Sentinel is listening...")
            bot.polling(non_stop=True, interval=2, timeout=20)
        except Exception as e:
            logger.error(f"Polling error: {e}")
            time.sleep(5) # Wait before retry

if __name__ == "__main__":
    main()
