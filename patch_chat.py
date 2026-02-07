
import os

path = 'bsc-ai-hub/src/pages/Chat.tsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Add Import
if 'ArrowDown' not in content:
    content = content.replace('ArrowUp, X', 'ArrowUp, ArrowDown, X')

# 2. Add State
if 'showScrollButton' not in content:
    target_state = 'const [showModelSelector, setShowModelSelector] = useState(false); // Kept for compatibility if used elsewhere, or remove if fully replaced.'
    new_state = target_state + '\n  const [showScrollButton, setShowScrollButton] = useState(false);'
    content = content.replace(target_state, new_state)

# 3. Add Effect
if 'Scroll Button Visibility Logic' not in content:
    target_effect = "}, [chatHistory, isTyping, attachments]);"
    new_effect = """}, [chatHistory, isTyping, attachments]);

  // Scroll Button Visibility Logic
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = el;
        // Show if strict > 200px from bottom
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
    };
    
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);"""
    content = content.replace(target_effect, new_effect, 1) # Only first occurrence

# 4. Replace Button Logic
old_button_block = """                 {(scrollRef.current && scrollRef.current.scrollTop < scrollRef.current.scrollHeight - 1000) && (
                    <button 
                        onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-[#333] border border-gray-200 dark:border-none p-2 rounded-full shadow-md text-gray-500 hover:text-gray-900 transition-all animate-bounce"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                 )}"""

new_button_block = """                 {showScrollButton && (
                    <button 
                        onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-[#333] border border-gray-200 dark:border-none p-2 rounded-full shadow-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all cursor-pointer z-10 hover:scale-110 active:scale-95"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </button>
                 )}"""

# Normalize spaces for matching if needed, but try exact first
if old_button_block in content:
    content = content.replace(old_button_block, new_button_block)
else:
    # Fallback: strict indentation might vary. Try a simpler replace if possible or valid REGEX.
    # But usually precise string works if copy-pasted from read output.
    pass

with open(path, 'w') as f:
    f.write(content)
