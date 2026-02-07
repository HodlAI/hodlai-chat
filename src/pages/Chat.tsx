import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { useStore } from '../store';
import { ChatMessage } from '../types';
import { translations } from '../lib/translations';
import { chatApi, APIError, isApiConfigured } from '../lib/api';
import { Bot, Plus, ChevronDown, Component, AlertTriangle, User, Paperclip, Globe, ArrowUp, ArrowDown, X, Image as ImageIcon, FileText, Download, Copy, Trash, RefreshCw, MessageSquare, PanelLeftClose, PanelLeftOpen, Menu, Edit2, Check, Sparkles, Settings, Search } from 'lucide-react';
import { GlassPanel, GradientText } from '../components/ui/ModernComponents';
import 'katex/dist/katex.min.css';
import '../highlight-adaptive.css'; // Use custom adaptive CSS instead of static import

// Helper to group sessions by date
const groupSessions = (sessions: any[]) => {
  const groups: { [key: string]: any[] } = {
    'Today': [],
    'Yesterday': [],
    'Previous 7 Days': [],
    'Previous': []
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const lastWeek = today - 86400000 * 7;

  sessions.forEach(session => {
    // Determine category based on lastUpdated or fallback to id (if timestamp)
    let ts = session.lastUpdated;
    if (!ts && !isNaN(Number(session.id))) ts = Number(session.id);
    if (!ts) ts = Date.now(); // Fallback

    if (ts >= today) groups['Today'].push(session);
    else if (ts >= yesterday) groups['Yesterday'].push(session);
    else if (ts >= lastWeek) groups['Previous 7 Days'].push(session);
    else groups['Previous'].push(session);
  });

  return groups;
};

// Helper to extract text from React children
const extractText = (children: any): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children?.props?.children) return extractText(children.props.children);
  return '';
};

// Component to render code blocks with strictly ChatGPT-like design
const CodeBlock = ({inline, className, children, ...props}: any) => {
  const match = /language-(\w+)/.exec(className || '');
  
  const { theme, setTheme, language } = useStore(); 
  const currentLang = language;
  const t = translations[currentLang]?.chat || {};

  const [isCopied, setIsCopied] = useState(false);

  // Heuristic to determine block vs inline if inline prop is missing/undefined
  // React-Markdown + Rehype interaction can sometimes swallow the inline prop.
  const textContent = extractText(children);
  const isMultiLine = textContent.includes('\n');
  const isStructureBlock = !inline && (match || isMultiLine); 
  
  // Final Decision:
  // 1. If explicit inline=true -> Inline
  // 2. If explicit inline=false -> Block
  // 3. If undefined:
  //    - Has language class -> Block
  //    - Has newlines -> Block
  //    - Otherwise -> Inline (Assume short snippets without lang are inline)
  const isBlock = inline === false || (inline === undefined && (!!match || isMultiLine));

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    // Robust text extraction
    let text = extractText(children).replace(/\n$/, '');
    if (!text) return;

    // 1. Try modern API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => triggerSuccess())
            .catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
  };

  const triggerSuccess = () => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const fallbackCopy = (text: string) => {
      try {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          // Ensure it's not visible but part of DOM
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          textArea.style.top = "0";
          textArea.setAttribute('readonly', '');
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (successful) triggerSuccess();
      } catch (err) {
          console.error("Fallback copy failed", err);
      }
  };

  return isBlock ? (
    <div className="relative my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-[#1f1f1f] font-sans group shadow-sm bg-white dark:bg-[#0a0a0a]">
       {/* Header */}
       <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400 select-none backdrop-blur-sm">
          <span className="font-mono font-medium text-violet-500 dark:text-violet-400 opacity-80">{match?.[1] || 'sh'}</span>
          <button 
            onClick={handleCopy} 
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-500 transition-colors cursor-pointer p-1 -mr-1 rounded-md"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="font-medium">{isCopied ? (t.copied || 'Copied') : (t.copy || 'Copy')}</span>
          </button>
       </div>
       {/* Code Content */}
       <div className="p-4 bg-white dark:bg-[#0a0a0a] overflow-x-auto">
        <pre className={`!m-0 !bg-transparent whitespace-pre-wrap break-words`}>
            <code className={`${className || ''} hljs text-[13px] md:text-sm font-mono bg-transparent !p-0 block leading-relaxed`} {...props} style={{ fontFamily: 'var(--font-family-code)' }}>{children}</code>
        </pre>
       </div>
    </div>
  ) : (
    <code className={`${className || ''} inline-code text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 px-1 py-0.5 rounded border border-violet-100 dark:border-violet-500/20`} {...props}>
      {children}
    </code>
  )
}

import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { ConnectKitButton } from 'connectkit';

export const Chat: React.FC = () => {
  const { 
      // chatHistory, // Removed: unstable on refresh
      addMessage,  
      removeMessage,
      updateMessage,
      language,
      setLanguage,
      theme,
      setTheme,
      checkConfiguration, 
      activeModelIds, 
      allModels, 
      fetchModels,
      
      // Session management
      sessions,
      currentSessionId,
      createSession,
      switchSession,
      deleteSession,
      renameSession,
      setLastUsedModel // Make sure this is exposed from store
  } = useStore();

  // Derived State for Messages (Fixes refresh issue)
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const chatHistory = currentSession ? currentSession.messages : [];

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState(activeModelIds[0] || 'gpt-4o');

  // Restore model from session when session changes
  useEffect(() => {
    if (currentSession?.lastUsedModel && activeModelIds.includes(currentSession.lastUsedModel)) {
      setSelectedModel(currentSession.lastUsedModel);
    }
  }, [currentSessionId, currentSession?.lastUsedModel]);

  const [error, setError] = useState<string | null>(null);
  const [webSearch, setWebSearch] = useState(false);
  const [attachments, setAttachments] = useState<Array<{file: File, preview: string, type: 'image' | 'file'}>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [retryTargetId, setRetryTargetId] = useState<string | null>(null); // For model selection popup
  
  // Sidebar State
  // Default: Open on Desktop (>=768px), Closed on Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
      if (typeof window !== 'undefined') return window.innerWidth >= 768;
      return true;
  });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Model Selector States (Split to separate top and bottom logic)
  const [isTopModelSelectorOpen, setIsTopModelSelectorOpen] = useState(false);
  const [isBottomModelSelectorOpen, setIsBottomModelSelectorOpen] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false); // Kept for compatibility if used elsewhere, or remove if fully replaced.
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[language].chat;
  const tErrors = translations[language].errors;
  const tConfig = translations[language].config;

  // Randomize suggestions on mount or language change
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([]);
  useEffect(() => {
    const all = t.suggestions || [];
    // Shuffle and pick 4
    const shuffled = [...all].sort(() => 0.5 - Math.random());
    setRandomSuggestions(shuffled.slice(0, 4));
  }, [language]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = input ? `${newHeight}px` : '24px';
    }
  }, [input]);

  // Fetch Models on Mount - REMOVED per user request to only fetch on Settings open
  // useEffect(() => {
  //   fetchModels();
  // }, [fetchModels, checkConfiguration]);

  // Ensure selected model is valid
  useEffect(() => {
    if (activeModelIds.length > 0 && !activeModelIds.includes(selectedModel)) {
      setSelectedModel(activeModelIds[0]);
    }
  }, [activeModelIds, selectedModel]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isUserScrollingUp = scrollHeight - scrollTop - clientHeight > 100;
        
        if (isTyping) {
            // While typing: only auto-scroll if user hasn't manually scrolled up
            if (!isUserScrollingUp) {
                scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }
        } else {
            // Force instant scroll to bottom on load/session switch
            // Use requestAnimationFrame for smoother rendering timing
            requestAnimationFrame(() => {
                if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            });
            // Backup with timeout for image loads
            setTimeout(() => {
                if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);
            setTimeout(() => {
                if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 500);
        }
    }
  }, [chatHistory, isTyping, attachments, currentSessionId]);

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
  }, []);

  // Handle File Upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFiles(Array.from(e.target.files));
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const isImage = file.type.startsWith('image/');
        setAttachments(prev => [...prev, { file, preview: result, type: isImage ? 'image' : 'file' }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingSessionId(session.id);
      setEditTitle(session.title);
  };
  
  const handleRenameSession = (id: string) => {
      if (editTitle.trim()) {
          renameSession(id, editTitle);
      }
      setEditingSessionId(null);
  };

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) processFiles(Array.from(e.dataTransfer.files));
  }, []);

  const removeAttachment = (index: number) => setAttachments(prev => prev.filter((_, i) => i !== index));

  // Handle Paste
  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      processFiles(Array.from(e.clipboardData.files));
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0)) return;
    setError(null);
    if (!isApiConfigured()) {
      setError(t.configureApiKey || 'Please configure your API Key in Settings first');
      return;
    }

    const currentAttachments = [...attachments];
    const currentInput = input;
    setInput('');
    setAttachments([]);
    setIsTyping(true);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
      attachments: currentAttachments.map(a => ({ url: a.preview, type: a.type, name: a.file.name }))
    };
    addMessage(newMessage);
    
    // Create placeholder for assistant response
    const botMsgId = (Date.now() + 1).toString();
    addMessage({
        id: botMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
    });

    try {
      setLastUsedModel(selectedModel); // Remember model for this session

      // Enhanced Web Search (Client-side RAG) via Public SearXNG
      let searchContext = "";
      
      if (webSearch) {
          updateMessage(botMsgId, { content: '🔍 Searching the web (Public)...' });
          try {
             const { searchService } = await import('../lib/search');
             const results = await searchService.searchPublicFree(currentInput);

             if (results.length > 0) {
                 searchContext = searchService.formatContext(results);
                 updateMessage(botMsgId, { content: '💡 Research complete. Thinking...' });
             } else {
                 updateMessage(botMsgId, { content: '⚠️ Public search yielded no results. Using internal knowledge...' });
             }
          } catch (e) {
             console.warn("Search failed", e);
             updateMessage(botMsgId, { content: '⚠️ Search failed. Using internal knowledge...' });
          }
      }

      // Construct Messages
      let historyContext = chatHistory.slice(-10).map(msg => ({ role: msg.role, content: msg.content }));
      
      // Inject Search Context if available
      let finalCurrentInput = currentInput;
      if (searchContext) {
          // Prepend search results to USER prompt for strongest attention
          finalCurrentInput = `${searchContext}\n\nUser Question: ${currentInput}`;
      } else {
          // If web search is ON but we failed to get RAG results (e.g. timeout), 
          // we fallback to prompt injection to see if the model has internal tools.
          if (webSearch) {
              finalCurrentInput = `${currentInput}\n\n[System Instruction: Perform a real-time web search for this query if possible.]`;
          }
      }

      // Reset UI message to empty before streaming real response
      updateMessage(botMsgId, { content: '' });

      const apiAttachments = currentAttachments.map(a => ({
         type: a.type,
         url: a.preview,
         name: a.file.name
      }));
      
      let fullContent = '';

      // We only want the searchContext injected ONCE per turn. 
      // If we prepend it to history, it might get duplicated or confuse context.
      // So we send it as the *current* user message content.
      
      await chatApi.sendMessageStream(
        [...historyContext, { role: 'user', content: finalCurrentInput }],
        selectedModel, 
        false, // Api-level webSearch param disabled, handled above
        apiAttachments,
        (token) => {
            fullContent += token;
            updateMessage(botMsgId, { content: fullContent });
        }
      );
      
      checkConfiguration();
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = tErrors.aiResponseFailed;
      if (error instanceof APIError) {
        if (error.code === 'API_KEY_MISSING') errorMessage = t.configureApiKey || 'Please configure your API Key';
        else if (error.isUnauthorized()) errorMessage = tErrors.invalidApiKey || 'Invalid API Key';
        else if (error.isRateLimited()) errorMessage = tErrors.rateLimited;
        else errorMessage = error.message;
      } else if (error.message) errorMessage = error.message;
      
      setError(errorMessage);
      updateMessage(botMsgId, { content: `❌ ${errorMessage}` });
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = async (assistantMsgIndex: number, overrideModel?: string) => {
    // Retry logic:
    // 1. Identify the user message before this assistant message
    const userMsgIndex = assistantMsgIndex - 1;
    if (userMsgIndex < 0) return;
    
    const userMsg = chatHistory[userMsgIndex];
    if (userMsg.role !== 'user') return;

    // 2. Remove the failed/old assistant message
    const assistantMsg = chatHistory[assistantMsgIndex];
    removeMessage(assistantMsg.id);
    setRetryTargetId(null); // Close modal if open

    // 3. Trigger send logic using the user message content
    setError(null);
    setIsTyping(true);
    
    // Choose model: override > current selected > default
    const modelToUse = overrideModel || selectedModel;
    
    // Create new placeholder
    const botMsgId = (Date.now() + 1).toString();
    addMessage({
        id: botMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
    });

    try {
      const historyContext = chatHistory.slice(0, userMsgIndex).map(msg => ({ role: msg.role, content: msg.content }));
      
      let fullContent = '';
      
      await chatApi.sendMessageStream(
        [...historyContext, { role: 'user', content: userMsg.content }],
        modelToUse, 
        webSearch,
        [], 
        (token) => {
            fullContent += token;
            updateMessage(botMsgId, { content: fullContent });
        }
      );
    } catch (error: any) {
         // ... same error handling ...
         let errorMessage = error.message || "Retry failed";
         setError(errorMessage);
         updateMessage(botMsgId, { content: `❌ ${errorMessage}` });
    } finally {
        setIsTyping(false);
    }
  };

  const openRetryMenu = (msgId: string, index: number) => {
      setRetryTargetId(msgId);
      setRetryIndex(index);
  };
  const [retryIndex, setRetryIndex] = useState<number>(-1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleCopyMessage = (text: string, id: string) => {
      const success = () => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
      };

      if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(success);
      } else {
          try {
              const textArea = document.createElement("textarea");
              textArea.value = text;
              textArea.style.position = "fixed";
              textArea.style.left = "-9999px";
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              success();
          } catch (e) {
              console.error("Copy failed", e);
          }
      }
  };

  const getModelName = (id: string) => {
    const found = allModels.find(m => m.id === id);
    if (found) return found.name;
    if (id.includes('gpt')) return 'GPT ' + id.split('-').pop();
    if (id.includes('claude')) return 'Claude ' + (id.split(':').pop() || '');
    return id;
  };

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { isConfigured } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [customKey, setCustomKey] = useState(localStorage.getItem('bsc_ai_hub_custom_key') || '');
  const [customBase, setCustomBase] = useState(localStorage.getItem('bsc_ai_hub_custom_base') || '');
  
  const filteredModels = allModels.filter(m => m.id.toLowerCase().includes(searchTerm.toLowerCase()));

  const saveConfig = () => {
    // Force clear custom base URL as per requirement "Delete custom API address"
    localStorage.removeItem('bsc_ai_hub_custom_base');
    if (customKey) localStorage.setItem('bsc_ai_hub_custom_key', customKey);
    else localStorage.removeItem('bsc_ai_hub_custom_key');
    
    // Refresh
    checkConfiguration();
    fetchModels();
    setIsConfigOpen(false);
  };
  
  // Sync when open
  useEffect(() => {
     if(isConfigOpen) {
         setCustomKey(localStorage.getItem('bsc_ai_hub_custom_key') || '');
         setCustomBase(localStorage.getItem('bsc_ai_hub_custom_base') || '');
         fetchModels();
     }
  }, [isConfigOpen]);

  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [walletStats, setWalletStats] = useState<any>(null);

  const fetchWalletStats = async (addr: string) => {
     try {
         // API call to get stats
         // Assuming same endpoint returns stats or a new one
         // Currently using verify to get key, but we need stats: Balance, Quota.
         // Let's assume verifying again refreshes the stats in token or we fetch from a new endpoint.
         // For now, we mock it or reuse verify if it returns stats.
         // Let's implement a 'check' endpoint if available or just use verify result.
         
         // Actually, let's just use the verify endpoint to "refresh" session and get token details
         // Ideally backend should return { token: { key, limit, usage, balance } }
         // The provided Context in memory says:
         // "Backend Logic: Adhere to specific request/response structures for /api/auth/message and /api/auth/verify"
         
         // We will trigger a silent re-verify or just show what we have if persisted.
         // But "Show User Token Balance" implies we need to fetch it.
         // Let's optimistically assume /api/auth/verify returns the enhanced data structure or we add a new call.
         
         // Temporary: fetch from verify (might need signature every time? No, that's bad UX).
         // Better: /api/user/stats?address=... (If exists).
         // If not, we will rely on what /api/auth/verify returned during login.
         
         // Wait, the user requirement is "Display token balance, today quota, remaining quota".
         // We need an endpoint. Let's assume GET /api/user/stats?address=X exists or use /api/auth/verify response.
         // Since I don't see a new endpoint doc, I'll update handleWalletAuth to store this info.
         
         // If already connected, maybe we can't get stats without signing?
         // Let's try to fetch stats if we have a key? 
         // GET /models usually returns models. 
         // Let's add a specialized fetch if `customKey` is set?
         // The `chatApi` doesn't have `getStats`.
         
         // Let's just implement the UI for now and populate it from the auth response.
     } catch (e) { console.error(e); }
  };

  // Auto-trigger auth when wallet connects if not already authenticated
  // Memoize session check to prevent infinite re-requests
  const [hasRequestedAuth, setHasRequestedAuth] = useState(false);

  useEffect(() => {
    // If not connected, reset auth requested flag to ensure re-connect triggers auth again
    if (!isConnected) {
        setHasRequestedAuth(false);
        // Do not clear customKey here if you want to support manual key entry fallback,
        // but for pure wallet flow, we might want to clear it if it was wallet-derived.
        // However, user requirement says: "Default save user wallet connection status".
        // ConnectKit handles the connection persistence.
        // We handle the *session* persistence (auth token).
        return; 
    }
    
    // Check if we already have a VALID key for this address
    const storedAddressKey = localStorage.getItem(`bsc_ai_hub_key_${address}`);
    
    // Auto-restore session if key exists for this address
    if (isConnected && address && storedAddressKey) {
         if (customKey !== storedAddressKey) {
             setCustomKey(storedAddressKey);
             localStorage.setItem('bsc_ai_hub_custom_key', storedAddressKey);
             checkConfiguration();
         }
         return; 
    }

    // If connected but no key, and haven't requested yet -> Request Auth automatically
    if (isConnected && address && !customKey && !walletStats && !hasRequestedAuth) {
       setHasRequestedAuth(true);
       // Small delay to ensure wallet modal is closed and UX is smooth
       setTimeout(() => {
           handleWalletAuth();
       }, 500);
    }
  }, [isConnected, address, customKey, walletStats, hasRequestedAuth]); // Added hasRequestedAuth dependency properly

  const handleWalletAuth = async () => {
    if (!address) return;
    try {
        // 1. Get Message
        const msgRes = await fetch('https://hodlai.fun/api/auth/message', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ address })
        });
        const msgData = await msgRes.json();
        if (!msgData.success) throw new Error(msgData.error);
        
        // 2. Sign
        const signature = await signMessageAsync({ message: msgData.data.message });
        
        // 3. Verify
        const verifyRes = await fetch('https://hodlai.fun/api/auth/verify', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ address, message: msgData.data.message, signature })
        });
        const verifyData = await verifyRes.json();
        
        if (verifyData.success && verifyData.data.token.key) {
            const newKey = verifyData.data.token.key;
            setCustomKey(newKey);
            localStorage.setItem('bsc_ai_hub_custom_key', newKey);
            // Cache key per address to avoid re-signing on reload
            localStorage.setItem(`bsc_ai_hub_key_${address}`, newKey);
            
            // Extract precise data from the new response structure
            const tokenData = verifyData.data.token;
            setWalletStats({
                balance: tokenData.balance, // Use raw Wei value for formatter (which divides by 1e18) 
                dailyQuota: tokenData.dailyQuota, 
                remainQuota: tokenData.remainQuota, 
                quotaMessage: tokenData.quotaInfo?.message,
                pointsPerDollar: tokenData.quotaInfo?.holdingInfo?.pointsPerDollar || 500000
            });
            
            checkConfiguration();
            fetchModels();
        } else {
            throw new Error(verifyData.error || 'Verification failed');
        }
    } catch (e: any) {
        console.error('Auth error', e);
        // Allow user to try again manually by resetting flag after a delay or on error?
        // If user cancelled signature, we should allow them to click "Login" button again.
        // We don't reset hasRequestedAuth immediately to avoid spam loop if error is persistent.
        // The "Sign to Check Access" button in UI calls handleWalletAuth directly, ignoring the flag.
    }
  };
  
  const handleDisconnect = () => {
      disconnect();
      setWalletStats(null);
      // Per user request: Do NOT clear API key on wallet disconnect.
      // setCustomKey('');
      // localStorage.removeItem('bsc_ai_hub_custom_key');
      
      // Clear address-specific key only? No, keep it for better UX if they reconnect.
      // if (address) {
      //    localStorage.removeItem(`bsc_ai_hub_key_${address}`);
      // }
      
      checkConfiguration();
      setHasRequestedAuth(false);
  };

  // Helper for HODL Balance (18 decimals)
  const formatHodlBalance = (raw: string | number) => {
      if (!raw) return '0';
      // Assume raw is in Wei (1e18) if it's a huge string, or check backend spec.
      // User said "Divide by 18 decimals".
      // We use BigInt logic for safety or simple math if precision allows (JS Number safe up to 9e15).
      // 1e18 is outside Number safe integer for exact math, but for "Display K/M" approximation, 
      // dividing a string-parsed-as-float by 1e18 works fine for UI.
      const val = parseFloat(String(raw));
      const adjusted = val / 1e18; 
      
      if (adjusted >= 1000000) return (adjusted / 1000000).toFixed(1) + 'M';
      if (adjusted >= 1000) return (adjusted / 1000).toFixed(1) + 'K';
      return adjusted.toFixed(0); // < 1K show exact integer
  };

  return (
    <div 
        className="flex h-[calc(100vh)] w-full overflow-hidden bg-white dark:bg-[#050505] relative"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
    >
      {/* Image Preview Modal */}
      {previewImage && (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setPreviewImage(null)}
        >
             <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
             >
                 <X className="w-6 h-6" />
             </button>
             <img 
                src={previewImage} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl scale-100 transition-transform"
                alt="Preview"
                onClick={(e) => e.stopPropagation()} 
             />
        </div>
      )}

      {/* Settings Modal (Moved from Layout) */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <GlassPanel className="w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden !rounded-2xl !bg-white dark:!bg-[#0a0a0a] border border-gray-200 dark:border-white/10 shadow-2xl">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20">
                    <Settings className="w-5 h-5" />
                </div>
                {t.settings || "Settings"}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsConfigOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-gray-500 dark:text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* Visual Settings */}
                <div>
                     <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{tConfig.appearance}</label>
                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                            {(['light', 'dark', 'system'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setTheme(mode)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                        theme === mode 
                                        ? 'bg-white dark:bg-[#212121] text-violet-600 dark:text-violet-400 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                >
                                    {tConfig[mode]}
                                </button>
                            ))}
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{tConfig.languageLabel}</label>
                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                    language === 'en' 
                                    ? 'bg-white dark:bg-[#212121] text-violet-600 dark:text-violet-400 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                English
                            </button>
                            <button 
                                onClick={() => setLanguage('zh')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                    language === 'zh' 
                                    ? 'bg-white dark:bg-[#212121] text-violet-600 dark:text-violet-400 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                中文
                            </button>
                        </div>
                     </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-[#333]" />

                {/* API Key Section - Wallet Connect */}
                <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 transition-all hover:border-violet-500/30 relative">
                    <div className="p-3">
                        {/* Header Row */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors ${isConnected ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                                    {isConnected ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {isConnected ? t.walletConnected || 'Wallet Connected' : t.web3Login || 'Web3 Login'}
                                    </span>
                                    {/* Only show address/ENS if connected */}
                                    {isConnected && (
                                        <ConnectKitButton.Custom>
                                            {({ show, truncatedAddress, ensName }) => (
                                                <button onClick={show} className="text-xs text-gray-500 dark:text-gray-400 truncate hover:text-violet-500 cursor-pointer text-left">
                                                    {ensName ?? truncatedAddress}
                                                </button>
                                            )}
                                        </ConnectKitButton.Custom>
                                    )}
                                </div>
                            </div>

                            {/* Disconnect Button (Top Right Absolute) */}
                            {isConnected && (
                                <button 
                                    onClick={handleDisconnect}
                                    className="p-1.5 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer absolute top-2 right-2"
                                    title={t.disconnect || "Disconnect"}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            
                            {/* Connect Button (If not connected) */}
                            {!isConnected && (
                                <div className="flex-shrink-0">
                                    <ConnectKitButton.Custom>
                                        {({ show }) => (
                                            <button 
                                                onClick={() => show?.()} 
                                                className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all border shadow-sm bg-black dark:bg-white text-white dark:text-black border-transparent hover:opacity-90 cursor-pointer"
                                            >
                                                {t.connectWallet || "Connect Wallet"}
                                            </button>
                                        )}
                                    </ConnectKitButton.Custom>
                                </div>
                            )}
                        </div>

                        {isConnected && (
                            <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                                {/* Stats Grid - Single Row */}
                                {walletStats ? (
                                <div className="flex items-center justify-between gap-2 text-xs">
                                    {/* Daily Quota */}
                                    <div className="flex flex-col items-center flex-1 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-help transition-colors group relative">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t.todaysQuota}</span>
                                        <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                                            ${(walletStats.dailyQuota / (walletStats.pointsPerDollar || 500000)).toFixed(0)}
                                        </span>
                                    </div>
                                    
                                    <div className="w-px h-6 bg-gray-100 dark:bg-white/10"></div>

                                    {/* Remaining */}
                                    <div className="flex flex-col items-center flex-1 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-help transition-colors group relative">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t.remainQuota}</span>
                                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                                            ${(walletStats.remainQuota / (walletStats.pointsPerDollar || 500000)).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="w-px h-6 bg-gray-100 dark:bg-white/10"></div>

                                    {/* Balance */}
                                    <div className="flex flex-col items-center flex-1 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-help transition-colors group relative">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t.balance}</span>
                                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                                            {formatHodlBalance(walletStats.balance)}
                                        </span>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity shadow-lg backdrop-blur-sm bg-black/90">
                                            {(parseFloat(String(walletStats.balance)) / 1e18).toLocaleString()} HODL
                                        </div>
                                    </div>
                                </div>
                                ) : (
                                    <button 
                                        onClick={handleWalletAuth}
                                        className="w-full py-2 text-xs font-bold bg-violet-600/10 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                        {t.signToLogin || "Sign to Verify"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 my-4">
                     <div className="h-px bg-gray-100 dark:bg-[#333] flex-1" />
                     <span className="text-xs text-gray-400 font-medium">OR</span>
                     <div className="h-px bg-gray-100 dark:bg-[#333] flex-1" />
                </div>

                {/* Manual API Key (Collapsed/Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.apiKey || "API Key"} 
                        <span className="text-xs font-normal text-gray-400 ml-2 opacity-70">
                            {language === 'zh' ? (
                                <>
                                    连接钱包或前往 <a href="https://hodlai.fun/" target="_blank" rel="noreferrer" className="text-violet-500 hover:text-violet-600 hover:underline transition-colors">hodlai.fun</a> 获取
                                </>
                            ) : (
                                <>
                                    Connect wallet or get from <a href="https://hodlai.fun/" target="_blank" rel="noreferrer" className="text-violet-500 hover:text-violet-600 hover:underline transition-colors">hodlai.fun</a>
                                </>
                            )}
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <input
                        type="password"
                        value={customKey}
                        onChange={(e) => {
                            setCustomKey(e.target.value);
                            // Auto-fetch if key looks plausibly long or user pastes it
                            if (e.target.value.length > 10) {
                                localStorage.setItem('bsc_ai_hub_custom_key', e.target.value);
                                checkConfiguration();
                                fetchModels();
                            }
                        }}
                        placeholder={t.apiKeyPlaceholder || "sk-..."}
                        className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 block p-3 transition-all hover:border-gray-300 dark:hover:border-white/20 outline-none"
                        />
                    </div>
                </div>

                {/* Model Selection Section */}
                
{isConfigured && (
                    <div className="pt-4 border-t border-gray-100 dark:border-[#333]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t.activeModels || "Active Models"}</h3>
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder={t.filterModels || "Filter..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-7 pr-3 py-1 text-xs rounded-lg bg-gray-100 dark:bg-[#2f2f2f] border-transparent focus:bg-white dark:focus:bg-[#1e1e1e] focus:border-[#10a37f] outline-none transition-all w-32 text-gray-900 dark:text-white" 
                                />
                            </div>
                        </div>

                        {allModels.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                {filteredModels.map((model) => (
                                    <label 
                                        key={model.id}
                                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                            activeModelIds.includes(model.id)
                                            ? 'bg-[#10a37f]/5 border-[#10a37f]/30'
                                            : 'bg-gray-50 dark:bg-[#2f2f2f] border-transparent hover:bg-gray-100 dark:hover:bg-[#333]'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                                            activeModelIds.includes(model.id)
                                            ? 'bg-[#10a37f] border-[#10a37f] text-white'
                                            : 'bg-white dark:bg-[#1e1e1e] border-gray-300 dark:border-[#333]'
                                        }`}>
                                            {activeModelIds.includes(model.id) && <Check className="w-3 h-3" />}
                                        </div>
                                        {/* Original Toggle Logic */}
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={activeModelIds.includes(model.id)}
                                            onChange={() => {
                                                const isActive = activeModelIds.includes(model.id);
                                                let newList = isActive ? activeModelIds.filter(id => id !== model.id) : [...activeModelIds, model.id];
                                                useStore.setState({ activeModelIds: newList });
                                            }}
                                        />
                                        <span className={`text-xs font-medium truncate select-none ${
                                            activeModelIds.includes(model.id) ? 'text-[#10a37f]' : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {model.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 dark:bg-[#2f2f2f]/50 rounded-xl border border-dashed border-gray-200 dark:border-[#424242]">
                                <div className="w-5 h-5 border-2 border-[#10a37f] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-xs text-gray-500">{t.loadingModels || "Loading models..."}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-[#333] bg-gray-50/50 dark:bg-[#1e1e1e]/50 rounded-b-2xl flex justify-end">
                <button
                onClick={saveConfig}
                className="px-6 py-2 text-sm font-bold text-white bg-violet-600 rounded-xl hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/30 cursor-pointer active:scale-95"
                >
                {t.done || "Done"}
                </button>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* ... Drag Overlay ... */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-xl flex flex-col items-center animate-bounce">
                <Paperclip className="w-10 h-10 text-primary mb-2" />
                <span className="text-lg font-bold text-gray-800 dark:text-white">{t.dropFiles || "Drop files here"}</span>
            </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
         className={`
            fixed inset-y-0 left-0 z-40 h-full bg-[#fafafa] dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-[#1f1f1f] flex flex-col transition-all duration-300 ease-in-out overflow-hidden
            ${isSidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-0'}
            md:relative md:translate-x-0
            ${!isSidebarOpen && 'md:w-0 md:border-none'}
         `}
      >
        <div className="p-4 flex flex-col gap-2 min-w-[280px]">
           {/* Header & New Chat */}
           <div className="flex items-center justify-between px-1 mb-4 gap-2">
               <button 
                 onClick={() => {
                    createSession();
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                 }}
                 className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white dark:hover:bg-white/5 hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-white/5 transition-all group cursor-pointer text-left bg-gray-100 dark:bg-white/5"
               >
                  <div className="h-6 w-6 flex items-center justify-center flex-shrink-0 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                    <Plus className="w-4 h-4 text-violet-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer whitespace-nowrap">{t.newChat || "New Chat"}</span>
               </button>
               
               <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors"
                  title={t.close || "Close Sidebar"}
               >
                   <PanelLeftClose className="w-5 h-5" />
               </button>
           </div>
           
          {/* Model Selector moved to input area */}
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar min-w-[260px]">
             {Object.entries(groupSessions(sessions)).map(([group, groupSessions]) => (
                groupSessions.length > 0 && (
                 <div key={group} className="mb-6">
                    <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 py-2 sticky top-0 bg-[#f9f9f9] dark:bg-[#171717] z-10">{group}</p>
                    <div className="flex flex-col gap-1">
                        {groupSessions.map(session => (
                            <div 
                                key={session.id}
                                className={`group relative flex items-center px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                                    currentSessionId === session.id 
                                    ? 'bg-white dark:bg-white/10 shadow-sm text-violet-600 dark:text-violet-400 font-medium' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                              onClick={() => {
                                switchSession(session.id);
                                if (window.innerWidth < 768) setIsSidebarOpen(false);
                            }}
                            >
                                {editingSessionId === session.id ? (
                                    <input 
                                        type="text" 
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onBlur={() => handleRenameSession(session.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSession(session.id)}
                                        autoFocus
                                        className="w-full bg-white dark:bg-[#212121] text-sm px-1 py-0.5 rounded border border-blue-500 outline-none"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <>
                                        <div className="flex-1 truncate text-sm pr-6">
                                            {session.title || 'New Chat'}
                                        </div>
                                        {/* Actions: Show on hover or active */}
                                        <div className={`absolute right-2 flex items-center gap-1 opacity-100 transition-opacity`}>
                                            <button 
                                                onClick={(e) => startEditing(session, e)}
                                                className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-[#333] rounded-md transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                                                title={t.rename || "Rename"}
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                                                title={t.delete || "Delete"}
                                            >
                                                <Trash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        {/* Gradient overlay for long text */}
                                        <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#fafafa] dark:from-[#0a0a0a] to-transparent pointer-events-none group-hover:hidden ${currentSessionId === session.id ? 'hidden' : ''}`} />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                 </div>
                )
             ))}
             {sessions.length === 0 && (
                 <div className="text-center py-10 px-4">
                     <p className="text-sm text-gray-400">{t.noHistory || "No chat history"}</p>
                 </div>
             )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full w-full max-w-full min-w-0">
         
                                        <div className="absolute top-0 left-0 right-0 z-30 p-2 md:p-4 flex items-center gap-2 pointer-events-none justify-between md:justify-start">
            <GlassPanel className="flex p-1 pointer-events-auto max-w-[calc(100%-50px)] md:max-w-none overflow-hidden !rounded-xl !bg-white/80 dark:!bg-[#0a0a0a]/80 shadow-sm">
                {/* Sidebar Toggle */}
                {(!isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/10 flex-shrink-0"
                        title={t.toggleSidebar || "Toggle Sidebar"}
                    >
                        <PanelLeftOpen className="w-5 h-5" />
                    </button>
                )}

                {/* Model Selector */}
                <div className="relative flex items-center gap-1 border-l border-gray-200 dark:border-white/10 pl-1 ml-1 overflow-hidden">
                        <button 
                            onClick={() => setIsTopModelSelectorOpen(!isTopModelSelectorOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all cursor-pointer group text-gray-700 dark:text-gray-200 min-w-0 pointer-events-auto"
                        >
                            <span className="text-sm font-semibold truncate bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                               {getModelName(selectedModel)} 
                            </span>
                            <span className="opacity-40 font-normal text-xs hidden md:inline ml-1">{(allModels.find(m => m.id === selectedModel)?.id || '').split('/')[1] || ''}</span>
                            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-50 group-hover:opacity-100 text-gray-500" />
                        </button>

                        {/* Settings Button */}
                        <button 
                             onClick={() => setIsConfigOpen(true)}
                             className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/10 flex-shrink-0 pointer-events-auto"
                             title={t.settings || "Settings"}
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                </div>
            </GlassPanel>

            {/* New Chat Button for Mobile (Top Right) */}
            <div className={`pointer-events-auto md:hidden ${isSidebarOpen ? 'hidden' : 'block'}`}>
                  <button 
                     onClick={() => createSession()}
                     className="bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-sm p-2 rounded-xl border border-gray-100 dark:border-[#333] shadow-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                  >
                     <Plus className="w-5 h-5" />
                  </button>
            </div>

            {isTopModelSelectorOpen && (
                <div className="absolute top-14 left-4 z-[101] pointer-events-auto">
                    <div className="fixed inset-0" onClick={() => setIsTopModelSelectorOpen(false)} />
                    <GlassPanel className="relative w-64 md:w-72 overflow-hidden !rounded-xl !bg-white dark:!bg-[#171717] shadow-2xl border border-gray-100 dark:border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.selectModel}</div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar pointer-events-auto">
                                {activeModelIds.map(id => (
                                <button
                                    key={id}
                                    onClick={() => { setSelectedModel(id); setIsTopModelSelectorOpen(false); }}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                        selectedModel === id
                                        ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-medium'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex flex-col truncate min-w-0">
                                        <span className="truncate">{getModelName(id)}</span>
                                    </div>
                                    {selectedModel === id && <Check className="w-4 h-4 text-violet-500" />}
                                </button>
                            ))}
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                            <button 
                                onClick={() => { setIsTopModelSelectorOpen(false); checkConfiguration(); }}
                                className="hidden w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                {t.configureModels || "Configure Models & API Key..."}
                            </button>
                        </div>
                    </GlassPanel>
                </div>
            )}
         </div>

         <div ref={scrollRef} className="flex-1 overflow-y-auto w-full custom-scrollbar pb-32 pt-14">
            {chatHistory.length === 0 ? (
                 <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                    <div className="mb-8 p-1 rounded-2xl bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 backdrop-blur-xl">
                        <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 shadow-sm">
                            <img 
                              src="/logo.svg" 
                              alt="HodlAI" 
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement?.classList.add('hidden'); 
                              }} 
                            />
                        </div>
                    </div>
                    {/* Welcome Text Removed or Simplified if needed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                        {randomSuggestions.map((hint) => (
                            <button 
                                key={hint} 
                                onClick={() => {
                                    if (!isApiConfigured()) {
                                        setIsConfigOpen(true);
                                        return;
                                    }
                                    setInput(hint);
                                }} 
                                className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-left text-sm text-gray-600 dark:text-gray-300 transition-all hover:scale-[1.02] shadow-sm hover:shadow-md cursor-pointer hover:border-violet-500/20"
                            >
                                {hint}
                            </button>
                        ))}
                    </div>
                 </div>
            ) : (
                <div className="flex flex-col w-full max-w-5xl mx-auto py-6 px-0 md:px-4 gap-4 md:gap-6">
                    {chatHistory.map((msg, index) => (
                        <div key={msg.id} className={`group w-full flex px-3 md:px-0 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0 mr-3 md:mr-4 w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 mt-0.5 select-none text-white overflow-hidden shadow-lg shadow-violet-500/20">
                                     <div className="w-full h-full flex items-center justify-center">
                                       <Component className="w-5 h-5" />
                                     </div>
                                </div>
                            )}
                            <div className={`${msg.role === 'user' ? 'flex flex-col items-end max-w-[85%] lg:max-w-[80%]' : 'flex flex-col min-w-0 flex-1'}`}>
                                <div className={`inline-block ${
                                    msg.role === 'user' 
                                    ? 'bg-[#f4f4f4] dark:bg-[#202020] px-5 py-3 rounded-2xl text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words border border-transparent dark:border-white/5 shadow-sm w-full' 
                                    : 'px-0 py-0 text-gray-900 dark:text-gray-100 leading-7 markdown-content -mt-1 w-full'
                                }`}>
                                   {msg.role === 'user' ? (
                                      <div className="whitespace-pre-wrap">{msg.content}</div>
                                   ) : (
                                       <div className="markdown-content pt-[6px]">
                                           <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-100 leading-normal !text-[0.92rem] p-0" 
                                                remarkPlugins={[remarkGfm, remarkMath]}
                                                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                                                urlTransform={(value) => value} // Allow data: URLs and others
                                                components={{
                                                    pre: ({children}) => <>{children}</>,
                                                    code: CodeBlock,
                                                    img: ({src, alt}) => (
                                                        <div className="relative my-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-gray-800 group/image">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img 
                                                                src={src} 
                                                                alt={alt || "Generated Image"} 
                                                                className="w-full h-auto max-h-[512px] object-contain cursor-zoom-in transition-transform hover:scale-[1.01]"
                                                                loading="lazy"
                                                                style={{ maxWidth: '100%' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPreviewImage(src || '');
                                                                }}
                                                            />
                                                            <a href={src} target="_blank" rel="noreferrer" className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors opacity-0 group-hover/image:opacity-100">
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                        </div>
                                                    )
                                                }}
                                           >
                                               {msg.content}
                                           </ReactMarkdown>
                                           {/* Inline Typing Indicator for active message */}
                                           {index === chatHistory.length - 1 && msg.role === 'assistant' && isTyping && (
                                                <span className="inline-flex gap-0.5 ml-1 items-baseline">
                                                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-70" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-70" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-70" style={{ animationDelay: '300ms' }} />
                                                </span>
                                           )}
                                           {/* Display Generated Image if exists in markdown or as attachment */}
                                           {msg.role === 'assistant' && msg.content && (msg.content.includes('(http') || msg.content.includes('![image]')) && (
                                                // ReactMarkdown handles standard images, but sometimes APIs return image URLs differently.
                                                // This is just a fallback container if needed, but standard MD renderer should work if configured correctly.
                                                // Ensure custom renderer handles images properly.
                                                <div className="hidden"></div>
                                           )}
                                       </div>
                                   )}
                                </div>
                                
                                {/* User Uploaded Attachments Rendering */}
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {msg.attachments.map((att: any, i: number) => (
                                            <div key={i} className="relative group w-32 h-32 rounded-lg border border-gray-200 dark:border-[#424242] overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
                                                {att.type === 'image' ? (
                                                    <img src={att.url} alt="Attachment" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                                                        <FileText className="w-8 h-8 text-gray-400 mb-2" />
                                                        <span className="text-[10px] truncate w-full text-gray-500">{att.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Message Actions Toolbar (Always Visible) */}
                                {!isTyping && (
                                <div className={`flex items-center gap-2 mt-2 opacity-100 pointer-events-auto ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className="flex items-center gap-1.5 p-0.5 rounded-lg" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        onClick={() => handleCopyMessage(msg.content, msg.id)} 
                                        className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#424242] rounded-md transition-all cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center relative group/btn"
                                        title="Copy"
                                    >
                                        <span className="absolute -inset-2" />
                                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <button 
                                        onClick={() => removeMessage(msg.id)} 
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-[#424242] rounded-md transition-all cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center relative group/btn"
                                        title="Delete"
                                    >
                                        <span className="absolute -inset-2" />
                                        <Trash className="w-3.5 h-3.5" />
                                    </button>
                                    {msg.role === 'assistant' && (
                                        <>
                                            <div className="w-px h-3.5 bg-gray-200 dark:bg-[#424242] mx-0.5" />
                                            <button 
                                                onClick={() => handleRetry(index)} 
                                                className="p-1.5 text-gray-400 hover:text-violet-500 hover:bg-gray-100 dark:hover:bg-[#424242] rounded-md transition-all cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center relative group/btn"
                                                title="Regenerate"
                                            >
                                                <span className="absolute -inset-2" />
                                                <RefreshCw className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => openRetryMenu(msg.id, index)}
                                                className="p-1.5 text-gray-400 hover:text-violet-500 hover:bg-gray-100 dark:hover:bg-[#424242] rounded-md transition-all cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center relative group/btn"
                                                title="Switch Model"
                                            >
                                                <span className="absolute -inset-2" />
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )}
                                  </div>
                                </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {error && (
                        <div className="flex gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {isTyping && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role !== 'assistant' && (
                        <div className="group w-full flex gap-3 md:gap-4 px-3 md:px-0 justify-start animate-in fade-in duration-300">
                             <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#10a37f] mt-0.5 select-none text-white">
                                 <Component className="w-5 h-5" />
                             </div>
                             <div className="flex items-center py-3">
                                 <div className="flex gap-1">
                                     <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                     <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                     <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            )}
         </div>

         {/* Bottom Input Area with Gradient Fade */}
         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-[#212121] dark:via-[#212121] pt-10 pb-6 px-4 z-20">
            <div className="max-w-4xl mx-auto w-full">
                 {showScrollButton && (
                    <button 
                        onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-[#333] border border-gray-200 dark:border-none p-2 rounded-full shadow-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all cursor-pointer z-10 hover:scale-110 active:scale-95"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </button>
                 )}

                {/* Input Box */}
                <GlassPanel className="relative flex flex-col w-full p-2 bg-white/70 dark:bg-[#1a1a1a]/70 rounded-[20px] shadow-lg border-white/20 dark:border-white/5 transition-all">
                    {attachments.length > 0 && (
                        <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide px-2 pt-2">
                            {attachments.map((file, i) => (
                                <div key={i} className="relative group flex-shrink-0 animate-fade-in">
                                    {file.type === 'image' ? (
                                        <img src={file.preview} className="h-14 w-14 rounded-xl object-cover border border-gray-200 dark:border-white/10 shadow-sm" alt="preview" />
                                    ) : (
                                        <div className="h-14 w-14 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-sm">
                                            <FileText className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => removeAttachment(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <textarea 
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPaste={handlePaste}
                        onKeyDown={(e) => { 
                            if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } 
                        }}
                        className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-[16px] resize-none overflow-y-auto max-h-[200px] min-h-[44px] py-3 pl-3 pr-12 scrollbar-hide font-medium"
                        style={{ lineHeight: '1.5' }}
                        placeholder={t.placeholder || "Ask anything..."} 
                        rows={1}
                        onClick={() => {
                            if (!isApiConfigured()) setIsConfigOpen(true);
                        }}
                    />
                    <div className="flex items-center justify-between mt-1 px-1 pb-1">
                        <div className="flex items-center gap-1 z-30 isolate">
                             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} multiple accept="image/*, .pdf, .txt, .md" />
                             
                             <button 
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} 
                                className="p-2 text-gray-400 hover:text-violet-500 dark:text-gray-500 dark:hover:text-violet-400 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer relative z-40" 
                                title={t.attachFile || "Attach File"}
                             >
                                 <Paperclip className="w-5 h-5" />
                             </button>
                             
                             <button 
                                onClick={(e) => { e.stopPropagation(); setWebSearch(!webSearch); }} 
                                className={`p-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer relative z-40 ${
                                    webSearch 
                                    ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400 font-medium px-3' 
                                    : 'text-gray-400 hover:text-cyan-500 dark:text-gray-500 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                }`} 
                                title={t.webSearch || "Web Search"}
                             >
                                 <Globe className="w-5 h-5" />
                                 {webSearch && <span className="text-xs">{t.searchOn || "Search"}</span>}
                             </button>

                             {/* Smart Model Selector */}
                             <div className="relative z-40">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsBottomModelSelectorOpen(!isBottomModelSelectorOpen); setIsConfigOpen(false); }}
                                    className={`p-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        isBottomModelSelectorOpen
                                        ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400' 
                                        : 'text-gray-400 hover:text-violet-500 dark:text-gray-500 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`} 
                                    title={`Model: ${getModelName(selectedModel)}`}
                                >
                                    <Sparkles className="w-5 h-5" />
                                </button>
                                
                                {isBottomModelSelectorOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[100]" onClick={() => setIsBottomModelSelectorOpen(false)} />
                                        <div className="absolute bottom-full mb-3 left-0 w-64 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden z-[101] max-h-[300px] flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
                                            <div className="p-2 overflow-y-auto custom-scrollbar">
                                                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.selectModel || "Select Model"}</div>
                                                {activeModelIds.map(id => (
                                                    <button
                                                        key={id}
                                                        onClick={() => { setSelectedModel(id); setIsBottomModelSelectorOpen(false); }}
                                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                                            selectedModel === id
                                                            ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-medium'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                                        }`}
                                                    >
                                                        <span className="truncate">{getModelName(id)}</span>
                                                        {selectedModel === id && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                ))}
                                                <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                                                <button 
                                                    onClick={() => { setIsBottomModelSelectorOpen(false); checkConfiguration(); }}
                                                    className="hidden w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                                >
                                                    {t.configureModels || "Configure Models..."}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                             </div>
                        </div>
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleSend(); }}
                            disabled={(!input.trim() && attachments.length === 0) || isTyping} 
                            className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm relative z-40 ${
                                (input.trim() || attachments.length > 0) 
                                ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-violet-500/30 hover:scale-105 active:scale-95' 
                                : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>
                </GlassPanel>
            </div>
         </div>
         
     </div>

      {/* Retry Model Selection Modal */}
      {retryTargetId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setRetryTargetId(null)}>
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-[#333] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-[#333] flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Regenerate with...</h3>
                    <button onClick={() => setRetryTargetId(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#333] rounded-full cursor-pointer"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                    {activeModelIds.map(modelId => (
                        <button 
                            key={modelId}
                            onClick={() => handleRetry(retryIndex, modelId)}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-colors cursor-pointer ${
                                modelId === selectedModel 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2f2f2f]'
                            }`}
                        >
                            <span className="font-medium">{getModelName(modelId)}</span>
                            {modelId === selectedModel && <span className="text-[10px] bg-primary/20 px-2 py-0.5 rounded-full">Current</span>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};