import { create } from 'zustand';
import { ChatMessage, ChatState, Model } from './types';
import { translations } from './lib/translations';
import { chatApi, isApiConfigured } from './lib/api';

interface Session {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
  lastUsedModel?: string; // Persist model per session
}

interface Store extends ChatState {
  isConfigured: boolean;
  activeModelIds: string[];
  allModels: Model[];
  
  // Session management
  sessions: Session[];
  currentSessionId: string | null;
  createSession: () => void;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  setLastUsedModel: (modelId: string) => void;

  addMessage: (message: ChatMessage, targetSessionId?: string) => void;
  removeMessage: (id: string, targetSessionId?: string) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage> | ((prev: ChatMessage) => Partial<ChatMessage>), targetSessionId?: string) => void;
  setLanguage: (lang: 'en' | 'zh') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  checkConfiguration: () => void;
  fetchModels: () => Promise<void>;
}

// Helper to save sessions to localStorage
const saveSessions = (sessions: Session[]) => {
  localStorage.setItem('bsc_ai_hub_sessions', JSON.stringify(sessions));
};

// Helper to save other state
const saveState = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
}

// Initial State Loading
const loadSessions = (): Session[] => {
  try {
    const saved = localStorage.getItem('bsc_ai_hub_sessions');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const loadInitialLang = (): 'en' | 'zh' => {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('bsc_ai_hub_lang') as 'en' | 'zh';
  if (saved) return saved;
  // Auto-detect browser language
  return navigator.language.startsWith('zh') ? 'zh' : 'en';
};

const predefinedModels: Model[] = [
    // Google (Prioritized)
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'Google', contextWindow: 2000000 },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', provider: 'Google', contextWindow: 2000000 },
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image', provider: 'Google', contextWindow: 2000000 },

    // OpenAI
    { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'OpenAI', contextWindow: 200000 },
    { id: 'o1-preview', name: 'o1 Preview', provider: 'OpenAI', contextWindow: 128000 },
    { id: 'o4-mini', name: 'o4 Mini', provider: 'OpenAI', contextWindow: 128000 },
    { id: 'o3-pro', name: 'o3 Pro', provider: 'OpenAI', contextWindow: 200000 },
    
    // Anthropic
    { id: 'claude-opus-4.6', name: 'Claude Opus 4.6', provider: 'Anthropic', contextWindow: 200000 },
    { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic', contextWindow: 200000 },
    { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', contextWindow: 200000 },

    // Specialized Images
    { id: 'gpt-image-1.5', name: 'GPT Image 1.5', provider: 'OpenAI', contextWindow: 128000 },
    { id: 'dall-e-3', name: 'DALL·E 3', provider: 'OpenAI', contextWindow: 0 },

    // Moonshot
    { id: 'kimi-k2.5', name: 'Kimi K2.5', provider: 'Moonshot', contextWindow: 200000 },
    { id: 'kimi-k2-thinking', name: 'Kimi K2 Thinking', provider: 'Moonshot', contextWindow: 200000 },

    // Alibaba
    { id: 'qwen3-max', name: 'Qwen 3 Max', provider: 'Alibaba', contextWindow: 32000 },
    { id: 'qwen-plus', name: 'Qwen Plus', provider: 'Alibaba', contextWindow: 32000 },
    { id: 'qwen-max', name: 'Qwen Max', provider: 'Alibaba', contextWindow: 32000 },

    // xAI
    { id: 'grok-4.1-fast', name: 'Grok 4.1 Fast', provider: 'xAI', contextWindow: 128000 },

    // DeepSeek
    { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', contextWindow: 64000 },
    { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', contextWindow: 64000 },
    { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek', contextWindow: 64000 },
    { id: 'deepseek-v3.1-terminus', name: 'DeepSeek V3.1 Terminus', provider: 'DeepSeek', contextWindow: 64000 },
];

const loadInitialTheme = (): 'light' | 'dark' | 'system' => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem('bsc_ai_hub_theme') as 'light' | 'dark' | 'system';
  return saved || 'system';
};

export const useStore = create<Store>((set, get) => ({
  language: loadInitialLang(),
  theme: loadInitialTheme(),
  chatHistory: [], // Deprecated in favor of sessions
  isLoading: false,
  isConfigured: isApiConfigured(),
  
  // Initialize from props/local
  activeModelIds: (() => {
      try {
          const saved = localStorage.getItem('bsc_ai_hub_active_models');
          if (saved) return JSON.parse(saved);
      } catch {}
      return predefinedModels.map(m => m.id);
  })(),

  allModels: predefinedModels, 
  
  sessions: (() => {
      const saved = loadSessions();
      // Ensure at least one session exists on load
      if (saved.length === 0) {
          const newSession: Session = {
              id: Date.now().toString(),
              title: 'New Chat',
              messages: [],
              lastUpdated: Date.now(),
              lastUsedModel: predefinedModels[0].id
          };
          saveSessions([newSession]);
          return [newSession];
      }
      return saved;
  })(),
  currentSessionId: (() => {
      const saved = loadSessions();
      // If sessions exist, return the most recent one (index 0)
      if (saved.length > 0) return saved[0].id;
      // If no sessions, we just created one in the sessions initialization above, 
      // but we need to match the ID. 
      // Since zustand initializes properties in order, we can't easily access the just-created session ID here synchronously without a duplicate check.
      // However, we can simply re-read from localStorage because saveSessions() was called above if empty.
      const fresh = loadSessions();
      if (fresh.length > 0) return fresh[0].id; // Should be the new one
      return null;
  })(),

  createSession: () => {
      const newSession: Session = {
          id: Date.now().toString(),
          title: '', // Empty title initially
          messages: [],
          lastUpdated: Date.now(),
          lastUsedModel: get().activeModelIds[0]
      };
      const newSessions = [newSession, ...get().sessions];
      set({ sessions: newSessions, currentSessionId: newSession.id });
      saveSessions(newSessions);
  },

  switchSession: (id: string) => {
      set({ currentSessionId: id });
  },

  deleteSession: (id: string) => {
      const newSessions = get().sessions.filter(s => s.id !== id);
      set({ 
          sessions: newSessions,
          currentSessionId: get().currentSessionId === id 
              ? (newSessions[0]?.id || null) 
              : get().currentSessionId
      });
      saveSessions(newSessions);
      if (newSessions.length === 0) get().createSession();
  },

  renameSession: (id: string, title: string) => {
      const newSessions = get().sessions.map(s => 
          s.id === id ? { ...s, title } : s
      );
      set({ sessions: newSessions });
      saveSessions(newSessions);
  },
  
  setLastUsedModel: (modelId) => {
      const sessionId = get().currentSessionId;
      if (!sessionId) return;
      
      const newSessions = get().sessions.map(s => 
         s.id === sessionId ? { ...s, lastUsedModel: modelId } : s
      );
      set({ sessions: newSessions });
      saveSessions(newSessions);
  },

  addMessage: (message, targetSessionId) => {
    const sessionId = targetSessionId || get().currentSessionId;
    if (!sessionId) {
        if (!targetSessionId) {
            get().createSession();
            get().addMessage(message);
        }
        return;
    }

    const sessions = get().sessions;
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return;

    const session = sessions[sessionIndex];
    const newMessages = [...session.messages, message];
    
    // Auto-title if it's the first user message or title is generic
    let title = session.title;
    if ((!title || title === 'New Chat') && message.role === 'user') {
        title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
    }

    const updatedSession = { ...session, messages: newMessages, lastUpdated: Date.now(), title };
    const newSessions = [...sessions];
    newSessions[sessionIndex] = updatedSession;
    
    // Move to top
    newSessions.splice(sessionIndex, 1);
    newSessions.unshift(updatedSession);

    set({ sessions: newSessions });
    // If we added to a session that wasn't current (e.g. valid targetId), do we switch? No.
    // But if we moved it, we need to ensure currentSessionId is still valid (it is, just ID based).
    saveSessions(newSessions);
  },

  removeMessage: (id, targetSessionId) => {
    const sessionId = targetSessionId || get().currentSessionId;
    if (!sessionId) return;

    const sessions = get().sessions;
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const newMessages = session.messages.filter((msg) => msg.id !== id);
    const updatedSession = { ...session, messages: newMessages };
    
    const newSessions = sessions.map(s => s.id === sessionId ? updatedSession : s);
    set({ sessions: newSessions });
    saveSessions(newSessions);
  },

  updateMessage: (id, updates, targetSessionId) => {
    const sessionId = targetSessionId || get().currentSessionId;
    if (!sessionId) return;

    const sessions = get().sessions;
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return;
    const session = sessions[sessionIndex];

    const newMessages = session.messages.map((msg) => {
      if (msg.id === id) {
          // Handle functional updates
          const computedUpdates = typeof updates === 'function' ? updates(msg) : updates;
          return { ...msg, ...computedUpdates };
      }
      return msg;
    });
    
    const updatedSession = { ...session, messages: newMessages };
    const newSessions = [...sessions];
    newSessions[sessionIndex] = updatedSession;

    set({ sessions: newSessions });
    saveSessions(newSessions);
  },

  setLanguage: (lang) => {
    localStorage.setItem('bsc_ai_hub_lang', lang);
    set({ language: lang });
  },

  setTheme: (theme) => {
    localStorage.setItem('bsc_ai_hub_theme', theme);
    set({ theme });
  },

  checkConfiguration: () => {
    set({ isConfigured: isApiConfigured() });
  },

  fetchModels: async () => {
    try {
        const fetchedModels = await chatApi.getModels();
        if (fetchedModels.length > 0) {
            // Merge with predefined to keep nice names if ID matches, or add new ones
            const merged = [...predefinedModels];
            fetchedModels.forEach((fm: any) => {
                if (!merged.find(m => m.id === fm.id)) {
                    merged.push({
                        id: fm.id,
                        name: fm.id, // Fallback name
                        provider: 'Custom',
                        contextWindow: 0
                    });
                }
            });
            set({ allModels: merged });
        }
    } catch (e) {
        console.error("Store fetch models failed", e);
    }
  }
}));