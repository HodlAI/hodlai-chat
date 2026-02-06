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
  
  const { theme, setTheme, language, fontSize } = useStore(); 
  const currentLang = language;
  const t = translations[currentLang]?.chat || {};

  const [isCopied, setIsCopied] = useState(false);

  // Adjust Code Block Font Size based on global setting
  const getCodeFontSize = () => {
    switch(fontSize) {
      case 'small': return '12px';
      case 'large': return '15px';
      default: return '13px'; // medium default
    }
  };

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
    <div className="relative my-5 rounded-md overflow-hidden border border-gray-200 dark:border-[#333] font-sans group">
       {/* Header */}
       <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#212121] border-b border-gray-200 dark:border-[#333] text-xs text-gray-500 dark:text-gray-200 select-none">
          <span className="lowercase font-sans font-medium">{match?.[1] || 'code'}</span>
          <button 
            onClick={handleCopy} 
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer p-1.5 -mr-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="font-medium">{isCopied ? (t.copied || 'Copied!') : (t.copy || 'Copy code')}</span>
          </button>
       </div>
       {/* Code Content */}
       <div className="p-4 bg-[#f6f8fa] dark:bg-[#1e1e1e] overflow-x-auto text-gray-900 dark:text-gray-100">
        <pre className={`!m-0 !bg-transparent whitespace-pre-wrap break-words`}>
            <code className={`${className || ''} hljs font-mono bg-transparent !p-0 block`} {...props} style={{ fontFamily: 'var(--font-family-code)', fontSize: getCodeFontSize(), lineHeight: '1.5' }}>{children}</code>
        </pre>
       </div>
    </div>
  ) : (
    <code className={`${className || ''} inline-code`} {...props}>
      {children}
    </code>
  )
}

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
      fontSize,
      setFontSize,
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

  // Adjust Code Block Font Size based on global setting
  const getCodeFontSize = () => {
    switch(fontSize) {
      case 'small': return '12px';
      case 'large': return '15px';
      default: return '13px'; // medium default
    }
  };

  // Adjust Message Text Class
  const getMessageTextClass = () => {
      switch(fontSize) {
          case 'small': return 'text-sm';
          case 'large': return 'text-lg';
          default: return 'text-base';
      }
  };

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
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory, isTyping, attachments]);

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
    if (customBase && customBase.trim().length > 0) localStorage.setItem('bsc_ai_hub_custom_base', customBase);
    else localStorage.removeItem('bsc_ai_hub_custom_base');
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

  return (
    <div 
        className="flex h-[calc(100vh)] w-full overflow-hidden bg-white dark:bg-[#212121] relative"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-[#333] transform transition-all flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-[#333] flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#10a37f]/10 text-[#10a37f] flex items-center justify-center">
                    <Settings className="w-6 h-6" />
                </div>
                {t.settings || "Settings"}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsConfigOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition-colors cursor-pointer">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* Visual Settings */}
                <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {tConfig.appearance}
                     </label>
                     <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => setTheme('light')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border flex-1 transition-all cursor-pointer ${
                                theme === 'light' ? 'border-[#10a37f] bg-[#10a37f]/5 text-[#10a37f]' : 'border-gray-200 dark:border-[#424242] text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2f2f2f]'
                            }`}
                        >
                             <div className="w-4 h-4 rounded-full bg-white dark:bg-[#212121] border border-gray-300 dark:border-[#555] mb-1" />
                             <span className="text-xs font-medium">{tConfig.light}</span>
                        </button>
                        <button 
                            onClick={() => setTheme('dark')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border flex-1 transition-all cursor-pointer ${
                                theme === 'dark' ? 'border-[#10a37f] bg-[#10a37f]/5 text-[#10a37f]' : 'border-gray-200 dark:border-[#424242] text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2f2f2f]'
                            }`}
                        >
                             <div className="w-4 h-4 rounded-full bg-[#343541] border border-gray-500 mb-1" />
                             <span className="text-xs font-medium">{tConfig.dark}</span>
                        </button>
                         <button 
                            onClick={() => setTheme('system')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border flex-1 transition-all cursor-pointer ${
                                theme === 'system' ? 'border-[#10a37f] bg-[#10a37f]/5 text-[#10a37f]' : 'border-gray-200 dark:border-[#424242] text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2f2f2f]'
                            }`}
                        >
                             <div className="w-4 h-4 rounded-full bg-gradient-to-r from-white to-[#343541] dark:from-[#212121] dark:to-black border border-gray-400 dark:border-[#555] mb-1" />
                             <span className="text-xs font-medium">{tConfig.system}</span>
                        </button>
                     </div>
                     
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {tConfig.languageLabel}
                     </label>
                     <div className="flex gap-2">
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex-1 cursor-pointer ${
                                language === 'en' ? 'bg-[#10a37f] text-white border-[#10a37f]' : 'bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#333]'
                            }`}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => setLanguage('zh')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex-1 cursor-pointer ${
                                language === 'zh' ? 'bg-[#10a37f] text-white border-[#10a37f]' : 'bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#333]'
                            }`}
                        >
                            中文
                        </button>
                     </div>

                     <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#333]"> 
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 
                            {tConfig.fontSizeLabel || (language === 'zh' ? '字体大小' : 'Font Size')} 
                        </label> 
                        <div className="flex gap-2"> 
                            <button 
                                onClick={() => setFontSize('small')} 
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex-1 cursor-pointer ${ 
                                    fontSize === 'small' ? 'bg-[#10a37f] text-white border-[#10a37f]' : 'bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#333]' 
                                }`} 
                            > 
                                A- 
                            </button> 
                            <button 
                                onClick={() => setFontSize('medium')} 
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex-1 cursor-pointer ${ 
                                    fontSize === 'medium' ? 'bg-[#10a37f] text-white border-[#10a37f]' : 'bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#333]' 
                                }`} 
                            > 
                                A 
                            </button> 
                            <button 
                                onClick={() => setFontSize('large')} 
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex-1 cursor-pointer ${ 
                                    fontSize === 'large' ? 'bg-[#10a37f] text-white border-[#10a37f]' : 'bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#333]' 
                                }`} 
                            > 
                                A+ 
                            </button> 
                        </div> 
                    </div> 

                </div>

                <div className="h-px bg-gray-100 dark:bg-[#333]" />

                {/* API Key Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.apiKey || "API Key"} <span className="text-red-500">*</span>
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
                        className="flex-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-[#10a37f]/20 focus:border-[#10a37f] block p-3 shadow-inner transition-all hover:border-gray-300 dark:hover:border-gray-600 outline-none"
                        />
                    </div>
                </div>

                {/* Model Selection Section */}
                
                {/* Base URL Section */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#333]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {tConfig.customBaseUrl || "Custom Base URL"}
                    </label>
                    <div className="flex gap-2">
                        <input
                        type="text"
                        value={customBase}
                        onChange={(e) => setCustomBase(e.target.value)}
                        placeholder="https://api.hodlai.fun/v1"
                        className="flex-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-[#10a37f]/20 focus:border-[#10a37f] block p-3 shadow-inner transition-all hover:border-gray-300 dark:hover:border-gray-600 outline-none"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{tConfig.customBaseUrlDesc || "Default: https://api.hodlai.fun/v1"}</p>
                </div>
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
                className="px-6 py-2 text-sm font-bold text-white bg-[#10a37f] rounded-xl hover:bg-[#1a7f64] transition-colors shadow-lg shadow-[#10a37f]/30 cursor-pointer"
                >
                {t.done || "Done"}
                </button>
            </div>
          </div>
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
            fixed inset-y-0 left-0 z-40 h-full bg-[#f9f9f9] dark:bg-[#171717] border-r border-gray-200 dark:border-none flex flex-col transition-all duration-300 ease-in-out overflow-hidden
            ${isSidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-0'}
            md:relative md:translate-x-0
            ${!isSidebarOpen && 'md:w-0 md:border-none'}
         `}
      >
        <div className="p-3 flex flex-col gap-2 min-w-[260px]">
           {/* Header & New Chat */}
           <div className="flex items-center justify-between px-2 mb-2 gap-2">
               <button 
                 onClick={() => {
                    createSession();
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                 }}
                 className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#2a2b32] transition-colors group cursor-pointer border border-transparent text-left border-gray-200 dark:border-[#4d4d4f]"
               >
                  <div className="h-6 w-6 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-gray-700 dark:text-gray-200 cursor-pointer" />
                  </div>
                  <span className="text-sm font-normal text-gray-700 dark:text-gray-200 cursor-pointer whitespace-nowrap">{t.newChat || "New chat"}</span>
               </button>
               
               <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-[#2f2f2f] rounded-lg text-gray-500 dark:text-gray-400 cursor-pointer"
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
                    <div className="flex flex-col gap-0.5">
                        {groupSessions.map(session => (
                            <div 
                                key={session.id}
                                className={`group relative flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                    currentSessionId === session.id 
                                    ? 'bg-gray-200 dark:bg-[#2f2f2f]' 
                                    : 'hover:bg-gray-100 dark:hover:bg-[#222]'
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
                                        <div className="flex-1 truncate text-sm text-gray-700 dark:text-gray-300 pr-6">
                                            {session.title || 'New Chat'}
                                        </div>
                                        {/* Actions: Show on hover or active */}
                                        <div className={`absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${currentSessionId === session.id ? 'opacity-100' : ''}`}>
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
                                        <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f9f9f9] dark:from-[#171717] to-transparent pointer-events-none group-hover:hidden ${currentSessionId === session.id ? 'from-gray-200 dark:from-[#2f2f2f]' : ''}`} />
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
         
         {/* Top Left Floating Controls (Dynamic positioning) */}
         <div className="absolute top-0 left-0 right-0 z-30 p-2 md:p-3 flex items-center gap-2 pointer-events-none justify-between md:justify-start">
            <div className="flex bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-100 dark:border-[#333] pointer-events-auto max-w-[calc(100%-50px)] md:max-w-none overflow-hidden">
                {/* Sidebar Toggle */}
                {(!isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/10 flex-shrink-0"
                        title={t.toggleSidebar || "Toggle Sidebar"}
                    >
                        <PanelLeftOpen className="w-5 h-5" />
                    </button>
                )}

                {/* Model Selector */}
                <div className="relative flex items-center gap-1 border-l border-gray-100 dark:border-[#333] pl-1 ml-1 overflow-hidden">
                        <button 
                            onClick={() => setIsTopModelSelectorOpen(!isTopModelSelectorOpen)}
                            className="flex items-center gap-1.5 px-2 py-1.5 md:px-3 md:py-2 rounded-lg transition-all cursor-pointer group hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 min-w-0 pointer-events-auto"
                        >
                            <span className="text-sm md:text-lg font-bold truncate">
                               {getModelName(selectedModel)} 
                            </span>
                            <span className="opacity-40 font-normal text-xs hidden md:inline ml-1">{(allModels.find(m => m.id === selectedModel)?.id || '').split('/')[1] || ''}</span>
                            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-50 group-hover:opacity-100" />
                        </button>

                        {/* Settings Button */}
                        <button 
                             onClick={() => setIsConfigOpen(true)}
                             className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/10 flex-shrink-0 pointer-events-auto"
                             title={t.settings || "Settings"}
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                </div>
            </div>

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
                    <div className="relative w-64 md:w-72 bg-white dark:bg-[#171717] rounded-xl shadow-2xl border border-gray-100 dark:border-[#333] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.selectModel}</div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar pointer-events-auto">
                                {activeModelIds.map(id => (
                                <button
                                    key={id}
                                    onClick={() => { setSelectedModel(id); setIsTopModelSelectorOpen(false); }}
                                    className={`w-full text-left px-3 py-3 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                        selectedModel === id
                                        ? 'bg-gray-100 dark:bg-[#212121] text-gray-900 dark:text-gray-100'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2b32]'
                                    }`}
                                >
                                    <div className="flex flex-col truncate min-w-0">
                                        <span className="font-medium truncate">{getModelName(id)}</span>
                                        {/* Simplified ID display: Only show if it differs significantly from name, usually just hide it to avoid duplication */}
                                    </div>
                                    {selectedModel === id && <Check className="w-4 h-4 text-primary" />}
                                </button>
                            ))}
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-[#333] my-1" />
                            <button 
                                onClick={() => { setIsTopModelSelectorOpen(false); checkConfiguration(); }}
                                className="hidden w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2f2f2f] transition-colors cursor-pointer"
                            >
                                {t.configureModels || "Configure Models & API Key..."}
                            </button>
                        </div>
                    </div>
                </div>
            )}
         </div>

         <div ref={scrollRef} className="flex-1 overflow-y-auto w-full custom-scrollbar pb-32 pt-14">
            {chatHistory.length === 0 ? (
                 <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                    <div className="mb-6 p-3 bg-white dark:bg-[#171717] rounded-full shadow-sm">
                        <img 
                          src="/logo.svg" 
                          alt="HodlAI" 
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                              // Fallback if SVG fails
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('hidden'); // Hide container
                          }} 
                        />
                    </div>
                    {/* Welcome Text Removed or Simplified if needed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                        {randomSuggestions.map((hint) => (
                            <button 
                                key={hint} 
                                onClick={() => setInput(hint)} 
                                className="p-3 rounded-lg border border-gray-200 dark:border-[#424242] hover:bg-gray-50 dark:hover:bg-[#2f2f2f] text-left text-sm text-gray-600 dark:text-gray-300 transition-all hover:shadow-sm cursor-pointer"
                            >
                                {hint}
                            </button>
                        ))}
                    </div>
                 </div>
            ) : (
                <div className="flex flex-col w-full max-w-5xl mx-auto py-6 px-0 md:px-4 gap-4 md:gap-6">
                    {chatHistory.map((msg, index) => (
                        <div key={msg.id} className={`group w-full flex gap-3 md:gap-4 px-3 md:px-0 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#10a37f] mt-0.5 select-none text-white overflow-hidden">
                                     <div className="w-full h-full flex items-center justify-center">
                                       <Component className="w-5 h-5" />
                                     </div>
                                </div>
                            )}
                            <div className={`flex flex-col max-w-[calc(100%-2.5rem)] md:max-w-[85%] lg:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-none w-full ${
                                    msg.role === 'user' 
                                    ? 'bg-[#f4f4f4] dark:bg-[#303030] px-4 py-2.5 md:px-5 md:py-3 rounded-2xl text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words' 
                                    : 'px-0 py-0 text-gray-900 dark:text-gray-100 leading-7 min-w-[200px] markdown-content -mt-1'
                                }`}>
                                   {msg.role === 'user' ? (
                                      <div className="whitespace-pre-wrap">{msg.content}</div>
                                   ) : (
                                       <div className="markdown-content">
                                           <ReactMarkdown 
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

                                {/* Message Actions Toolbar */}
                                <div className={`flex items-center gap-1 mt-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <button 
                                        onClick={() => handleCopyMessage(msg.content, msg.id)} 
                                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-[#333] transition-colors cursor-pointer"
                                        title="Copy"
                                    >
                                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <button 
                                        onClick={() => removeMessage(msg.id)} 
                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 dark:hover:bg-[#333] transition-colors cursor-pointer"
                                        title="Delete"
                                    >
                                        <Trash className="w-3.5 h-3.5" />
                                    </button>
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-[#333] rounded-md overflow-hidden hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600 transition-all">
                                            <button 
                                                onClick={() => handleRetry(index)} 
                                                className="p-1.5 text-gray-500 hover:text-primary transition-colors cursor-pointer"
                                                title="Regenerate (Default)"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => openRetryMenu(msg.id, index)}
                                                className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-200 dark:hover:bg-[#424242] transition-colors cursor-pointer w-5 flex items-center justify-center border-l border-gray-200 dark:border-[#424242]"
                                                title="Choose Model..."
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
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
                <div className="relative flex flex-col w-full p-3 bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-[26px] border border-transparent focus-within:border-gray-300 dark:focus-within:border-[#424242] transition-colors shadow-sm">
                    {attachments.length > 0 && (
                        <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                            {attachments.map((file, i) => (
                                <div key={i} className="relative group flex-shrink-0">
                                    {file.type === 'image' ? (
                                        <img src={file.preview} className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-[#424242]" alt="preview" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-[#2f2f2f] flex items-center justify-center border border-gray-200 dark:border-[#424242]">
                                            <FileText className="w-5 h-5 text-gray-500" />
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => removeAttachment(i)}
                                        className="absolute -top-1 -right-1 bg-gray-500 hover:bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                        className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 text-[16px] resize-none overflow-y-auto max-h-[200px] min-h-[24px] py-1 pl-2 pr-10 scrollbar-hide"
                        style={{ lineHeight: '1.5', minHeight: '24px' }}
                        placeholder={t.placeholder || "Message..."} 
                        rows={1}
                        onClick={() => {
                            if (!isApiConfigured()) setIsConfigOpen(true);
                        }}
                    />
                    <div className="flex items-center justify-between mt-2 pl-1">
                        <div className="flex items-center gap-2">
                             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} multiple accept="image/*, .pdf, .txt, .md" />
                             
                             <button 
                                onClick={() => fileInputRef.current?.click()} 
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-[#424242] transition-colors cursor-pointer" 
                                title={t.attachFile || "Attach File"}
                             >
                                 <Paperclip className="w-4 h-4" />
                             </button>
                             
                             <button 
                                onClick={() => setWebSearch(!webSearch)} 
                                className={`p-2 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    webSearch 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3' 
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#424242]'
                                }`} 
                                title={t.webSearch || "Web Search"}
                             >
                                 <Globe className="w-4 h-4" />
                                 {webSearch && <span className="text-xs font-semibold whitespace-nowrap">{t.searchOn || "Search Is On"}</span>}
                             </button>

                             {/* Smart Model Selector */}
                             <div className="relative">
                                <button 
                                    onClick={() => setIsBottomModelSelectorOpen(!isBottomModelSelectorOpen)}
                                    className={`p-2 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        isBottomModelSelectorOpen
                                        ? 'bg-primary/10 text-primary' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#424242]'
                                    }`} 
                                    title={`Model: ${getModelName(selectedModel)}`}
                                >
                                    <Sparkles className="w-4 h-4" />
                                </button>
                                
                                {isBottomModelSelectorOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[100]" onClick={() => setIsBottomModelSelectorOpen(false)} />
                                        <div className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-xl border border-gray-200 dark:border-[#333] overflow-hidden z-[101] max-h-[300px] flex flex-col animate-in slide-in-from-bottom-2 fade-in duration-200">
                                            <div className="p-2 overflow-y-auto custom-scrollbar">
                                                <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.selectModel || "Select Model"}</div>
                                                {activeModelIds.map(id => (
                                                    <button
                                                        key={id}
                                                        onClick={() => { setSelectedModel(id); setIsBottomModelSelectorOpen(false); }}
                                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                                            selectedModel === id
                                                            ? 'bg-primary/10 text-primary font-medium'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2f2f2f]'
                                                        }`}
                                                    >
                                                        <span className="truncate">{getModelName(id)}</span>
                                                        {selectedModel === id && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                ))}
                                                <div className="h-px bg-gray-100 dark:bg-[#333] my-1" />
                                                <button 
                                                    onClick={() => { setIsBottomModelSelectorOpen(false); checkConfiguration(); }}
                                                    className="hidden w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2f2f2f] transition-colors cursor-pointer"
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
                            onClick={handleSend} 
                            disabled={(!input.trim() && attachments.length === 0) || isTyping} 
                            className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer ${(input.trim() || attachments.length > 0) ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80 shadow-md' : 'bg-[#e5e5e5] dark:bg-[#424242] text-gray-400 cursor-not-allowed'}`}
                        >
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>
                </div>
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