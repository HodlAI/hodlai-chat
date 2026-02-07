export interface User {
  address: string | null;
  credits: number;
  isConnected: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

export interface ChatState {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  language: 'en' | 'zh';
  theme: 'light' | 'dark' | 'system';
}

export interface Model {
    id: string;
    name: string;
    provider: string;
    contextWindow: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  level: number;
  type: string;
  isPublic: boolean;
  tags: string[];
  stats: {
    txs: number;
    winRate: string;
    earned: string;
  };
}

export enum Step {
  CORE_INFO = 1,
  KNOWLEDGE_BASE = 2,
  LOGIC_CONFIG = 3,
  TOKENOMICS = 4,
}