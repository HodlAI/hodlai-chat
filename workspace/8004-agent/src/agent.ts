/**
 * LLM Agent
 * 
 * This file contains the AI logic for your agent.
 * By default, it uses OpenAI's GPT-4o-mini model.
 * 
 * To customize:
 * - Change the model in chat() (e.g., 'gpt-4o', 'gpt-3.5-turbo')
 * - Modify the system prompt in generateResponse()
 * - Add custom logic, tools, or RAG capabilities
 * 
 * To use a different LLM provider:
 * - Replace the OpenAI import with your preferred SDK
 * - Update the chat() function accordingly
 */

import OpenAI from 'openai';

// Initialize OpenAI client
// API key is loaded from OPENAI_API_KEY environment variable
// Configured to use HodlAI Protocol API (OpenAI Compatible)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.hodlai.fun/v1',
});

// ============================================================================
// Types
// ============================================================================

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ============================================================================
// Tools
// ============================================================================

async function fetchTokenData(): Promise<string> {
  try {
    const PAIR = "0x233BE6ff451C87D3bde3bAb2A8c0c0CdF872003c";
    const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/bsc/${PAIR}`);
    const data = await res.json() as any;
    const pair = data.pair;
    
    if (!pair) return "Market Data: Unavailable";

    return `Current Market Data (HODLAI/BSC):
- Price: $${pair.priceUsd}
- Liquidity: $${pair.liquidity.usd}
- 24h Vol: $${pair.volume.h24}
- Market Cap: $${pair.fdv}
- Price Change (24h): ${pair.priceChange.h24}%`;
  } catch (e) {
    return "Market Data: Error fetching.";
  }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Send messages to the LLM and get a response
 * This is the low-level function that calls the OpenAI API
 * 
 * @param messages - Array of conversation messages
 * @returns The assistant's response text
 */
export async function chat(messages: AgentMessage[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gemini-3-flash-preview', // Powered by HodlAI (Google Gemini 1.5 Flash)
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    // Add more options as needed:
    // temperature: 0.7,
    // max_tokens: 1000,
  });

  return response.choices[0]?.message?.content ?? 'No response';
}

/**
 * Generate a response to a user message
 * This is the main function called by A2A and MCP handlers
 * 
 * @param userMessage - The user's input
 * @param history - Previous conversation messages (for context)
 * @returns The agent's response
 */
export async function generateResponse(userMessage: string, history: AgentMessage[] = []): Promise<string> {
  // Fetch real-time data to inject
  const marketData = await fetchTokenData();

  // System prompt defines your agent's personality and behavior
  // Customize this to match your agent's purpose
  const systemPrompt: AgentMessage = {
    role: 'system',
    content: `You are the HodlAI Protocol Agent (ID 56:89) on BNB Smart Chain. 
    You represent the "Holding is Access" paradigm: providing compute/LLM utility to agents holding $HODLAI.
    Your mission is to demonstrate agent-native value exchange. 
    
    ${marketData}
    
    Be concise, technical, and helpful. 
    Powered by OpenClaw & Agent0.`,
  };

  // Build the full message array: system prompt + history + new message
  const messages: AgentMessage[] = [
    systemPrompt,
    ...history,
    { role: 'user', content: userMessage },
  ];

  return chat(messages);
}
