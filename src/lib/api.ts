import { config } from './config';

/**
 * API Error Class
 */
export class APIError extends Error {
  public statusCode: number;
  public code: string;

  constructor(statusCode: number, message: string, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isInsufficientCredits(): boolean {
    return this.code === 'INSUFFICIENT_CREDITS';
  }

  isRateLimited(): boolean {
    return this.statusCode === 429;
  }
}

/**
 * Get API Config (Local Storage + Defaults)
 */
function getApiConfig() {
  const customKey = localStorage.getItem('bsc_ai_hub_custom_key') || '';
  const customBase = localStorage.getItem('bsc_ai_hub_custom_base');
  const baseUrl = (customBase && customBase.trim().length > 0) 
      ? customBase 
      : 'https://api.hodlai.fun/v1'; 
  return { apiKey: customKey, baseUrl };
}

/**
 * Check if API is configured
 */
export function isApiConfigured(): boolean {
  const { apiKey } = getApiConfig();
  return (!!apiKey && apiKey.trim().length > 0) || window.location.hostname === 'localhost';
}

/**
 * Chat API - OpenAI Compatible
 */
export const chatApi = {
  async sendMessageStream(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string | any[] }>,
    model: string = 'gpt-4o-mini',
    webSearch: boolean = false,
    attachments: Array<{ type: 'image' | 'file'; url: string; name?: string }> = [],
    onToken: (token: string) => void
  ) {
    let { apiKey, baseUrl } = getApiConfig();
    
    if (!apiKey && window.location.hostname === 'localhost') {
      apiKey = 'sk-HodlAIPvPx6wpLQae9nkILnE5xruqXsFz97S0C5jGJ4lGfun';
      baseUrl = 'https://api.hodlai.fun/v1';
    }
    
    if (!apiKey) {
      throw new APIError(401, 'Please configure your API Key in Settings', 'API_KEY_MISSING');
    }

    const url = `${baseUrl}/chat/completions`;
    
    let finalMessages = JSON.parse(JSON.stringify(messages));
    
    // Handle Attachments (Same logic as non-stream)
    if (attachments && attachments.length > 0) {
      const lastMsgIndex = finalMessages.length - 1;
      const lastMsg = finalMessages[lastMsgIndex];
      if (lastMsg.role === 'user') {
         // Multimodal handling
         const textContent = { type: "text", text: lastMsg.content };
         
         const fileContents = attachments.map(a => {
             // For images, use official 'image_url' type
             if (a.type === 'image') {
                 return { type: "image_url", image_url: { url: a.url } }
             }
             // For other files (PDF/TXT), we treat them as images if the model supports it (Gemini 1.5),
             // OR we fallback to text injection if handled by frontend.
             // Currently, our 'a.url' is a base64 Data URI.
             // Some models (Gemini) accept base64 in 'image_url' even for PDFs in some adapters,
             // but strictly speaking, OpenAI spec prefers 'image_url' for images.
             
             // If the file is NOT an image, we should probably have extracted its text in the frontend
             // OR send it as a data URL if the provider supports arbitrary file inputs.
             // Given this is a generic OpenAI client, we'll try to send it as 'image_url' if it looks like data
             // but really we rely on the backend adapter to handle it.
             // BETTER STRATEGY: 
             // If type is 'file', we assume the frontend might have processed it or we send it as is.
             // The safest bet for generic compatibility is to only send 'image_url' for images.
             // Text files should be content-injected.
             return { type: "image_url", image_url: { url: a.url } };
         });
         
         finalMessages[lastMsgIndex].content = [textContent, ...fileContents];
      }
    }
    
    if (webSearch) {
        // Option 1: System prompt injection (Simple, compatible with most models)
        // finalMessages.unshift({
        //   role: 'system',
        //   content: 'You are an AI assistant with real-time web search capabilities. Web search is currently ENABLED. Use it to find latest info.'
        // });

        // Option 3: Inject search tool definition for Function Calling compatible models
        const tools = [
            {
                type: "function",
                function: {
                    name: "web_search",
                    description: "Search the internet for real-time information",
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "The search query to find information about"
                            }
                        },
                        required: ["query"]
                    }
                }
            }
        ];
        
        // Option 4: Inject plugins/extensions parameter for aggregators (OneAPI/NewAPI/GoAmz)
        // This is often supported alongside standard OpenAI body
    }
    
    // Prepare Request Body
    const requestBody: any = {
        model,
        messages: finalMessages,
        stream: true,
    };

    if (webSearch) {
        // [Standard] OpenAI Tools
        requestBody.tools = [
            {
                type: "function",
                function: {
                    name: "web_search",
                    description: "Search the internet for real-time information",
                    parameters: {
                        type: "object",
                        properties: {
                            query: { type: "string", description: "Search terms" }
                        },
                        required: ["query"]
                    }
                }
            }
        ];
        
        // [Aggregator] Common plugin flags
        // Many OneAPI/NewAPI deployments check for 'plugins' or specific bools
        requestBody.plugins = ["search"]; 
        requestBody.google_search = true; // Dify / FastGPT style
        requestBody.web_search = true;    // Some custom gateways
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
       // Robust error extraction
      const errorMsg = 
          errorData?.error?.message || 
          errorData?.message ||
          errorData?.error || 
          (typeof errorData === 'string' ? errorData : null) || 
          `API Error: ${response.status}`;

      throw new APIError(
        response.status,
        errorMsg,
        errorData?.error?.code || 'API_ERROR'
      );
    }

    if (!response.body) throw new Error('ReadableStream not supported.');

    // Compatibility: Check for non-stream JSON response (e.g. Image API masquerading as Chat, or Error)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('event-stream')) {
        const json = await response.json();
        
        // Handle Image Response (OpenAI Standard)
        if (json.data && Array.isArray(json.data) && json.data[0]?.url) {
            const imageUrl = json.data[0].url;
            onToken(`![Generated Image](${imageUrl})`);
            return;
        }

        // Handle Standard Chat Response (Non-stream)
        const content = json.choices?.[0]?.message?.content || json.choices?.[0]?.text || '';
        if (content) {
            onToken(content);
            return;
        }
        
        // Handle Error inside JSON
        if (json.error) {
             throw new Error(json.error.message || 'API Error');
        }
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === 'data: [DONE]') continue;
                if (trimmed.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(trimmed.slice(6));
                        
                        // 0. Handle Stream Errors (explicit error object in data chunk)
                        if (json.error) {
                            throw new Error(json.error.message || json.error.code || 'Stream Error');
                        }

                        // Compatibility: Handle various response formats from aggregators (NewAPI/OneAPI)
                        // 1. Standard Chat Completion Stream
                        let content = json.choices?.[0]?.delta?.content;
                        
                        // 1b. Handle "Reasoning" field (DeepSeek/Gemini Thinking)
                        // If content is empty but reasoning exists, yield it to avoid "dead" state.
                        // We wrap it in a recognizable block if it's the start, but for simple streaming, 
                        // we'll just append it with a visual marker if needed, or just treat it as content.
                        // For best UI compatibility without refactor, we can prepend a thinking marker or just stream it.
                        // Let's format it slightly different or just include it.
                        // Decision: Append reasoning to content so it's visible.
                        const reasoning = json.choices?.[0]?.delta?.reasoning;
                        if (reasoning) {
                            // Simple approach: Stream reasoning as italicized text or blockquote
                            // content = (content || '') + `_Thinking: ${reasoning}_ `; 
                            // Better: Just stream it. The user can see it. 
                            // Note: DeepSeek R1 conventionally uses <think> tags.
                            // We can lazily format it or just return it. 
                            // Decision: Append reasoning to content so it's visible.
                            content = (content || '') + reasoning;
                        }

                        // 1c. Handle "Images" array in delta (Gemini/Aggregator format)
                        const images = json.choices?.[0]?.delta?.images;
                        if (images && Array.isArray(images)) {
                            const imageMarkdown = images.map((img: any) => {
                                const url = img.image_url?.url || img.url;
                                return url ? `\n![Generated Image](${url})\n` : '';
                            }).join('');
                            content = (content || '') + imageMarkdown;
                        }

                        // 2. Legacy Text Completion or specific model formats
                        if (!content && json.choices?.[0]?.text) {
                            content = json.choices[0].text;
                        }
                        
                        // 3. Some image models via chat adapters might return content in 'message' even in stream
                        if (!content && json.choices?.[0]?.message?.content) {
                             content = json.choices[0].message.content;
                        }

                        if (content) onToken(content);
                    } catch (e) {
                         // Rethrow explicit API errors
                         if (e instanceof Error && e.message !== 'Unexpected end of JSON input') throw e;
                         console.warn('Sync parse error', e);
                    }
                }
            }
        }
    } catch (e) {
        throw e;
    } finally {
        reader.releaseLock();
    }
  },

  async sendMessageWithHistory(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string | any[] }>,
    model: string = 'gpt-4o-mini',
    webSearch: boolean = false,
    attachments: Array<{ type: 'image' | 'file'; url: string; name?: string }> = []
  ) {
    let { apiKey, baseUrl } = getApiConfig();
    
    // DEV MODE: Auto-inject key for localhost
    if (!apiKey && window.location.hostname === 'localhost') {
      apiKey = 'sk-HodlAIPvPx6wpLQae9nkILnE5xruqXsFz97S0C5jGJ4lGfun';
      baseUrl = 'https://api.hodlai.fun/v1';
    }
    
    if (!apiKey) {
      throw new APIError(401, 'Please configure your API Key in Settings', 'API_KEY_MISSING');
    }

    const url = `${baseUrl}/chat/completions`;
    
    // Process messages - Deep clone to avoid mutating state
    let finalMessages = JSON.parse(JSON.stringify(messages));
    
    // Handle Attachments for the LATEST message (last one is user)
    if (attachments && attachments.length > 0) {
      const lastMsgIndex = finalMessages.length - 1;
      const lastMsg = finalMessages[lastMsgIndex];
      
      if (lastMsg.role === 'user') {
         const textContent = { type: "text", text: lastMsg.content };
         
         const fileContents = attachments.map(a => {
             if (a.type === 'image') {
                 return { type: "image_url", image_url: { url: a.url } }
             }
             // For non-image files, we send them as `image_url` too because many Modern Aggregators (OneAPI/NewAPI)
             // auto-detect Base64 PDF/Doc headers in `image_url` fields and convert them to internal vision/file prompts
             // for models like Gemini 1.5 Pro or Claude 3.5.
             return { type: "image_url", image_url: { url: a.url } };
         });
            
         finalMessages[lastMsgIndex].content = [textContent, ...fileContents];
      }
    }
    
    // Helper: System Prompt Injection
    if (webSearch) {
      finalMessages.unshift({
        role: 'system',
        content: 'You are an AI assistant with real-time web search capabilities. Web search is currently ENABLED. Use it to find latest info.'
      });
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        stream: false
        // web_search parameter removed as it causes API error
        // web_search: webSearch 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      // Robust error extraction for various aggregator formats
      const errorMsg = 
          errorData?.error?.message || 
          errorData?.message || 
          errorData?.error || 
          (typeof errorData === 'string' ? errorData : null) ||
          response.statusText || 
          `API Error: ${response.status}`;

      throw new APIError(
        response.status,
        errorMsg,
        errorData?.error?.code || 'API_ERROR'
      );
    }

    const data = await response.json();
    
    // Compatibility: Handle Image Generation Response (DALL-E / MJ adapter)
    if (data.data && Array.isArray(data.data) && data.data[0]?.url) {
        // Transform Image API response to Chat-like content for UI
        const imageUrl = data.data[0].url;
        // Construct a markdown image string
        const content = `![Generated Image](${imageUrl})`;
        return {
            content,
            message: content,
            usage: data.usage || { total_tokens: 0 }
        };
    }

    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';
    
    return {
      content,
      message: content,
      usage: data.usage,
    };
  },

  async getModels() {
    let { apiKey, baseUrl } = getApiConfig();
    
    if (!apiKey && window.location.hostname === 'localhost') {
        apiKey = 'sk-HodlAIPvPx6wpLQae9nkILnE5xruqXsFz97S0C5jGJ4lGfun';
        baseUrl = 'https://api.hodlai.fun/v1';
    }

    if (!apiKey) return [];

    const url = `${baseUrl}/models`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    } catch (e) {
      console.warn("Failed to fetch models", e);
      return [];
    }
  },
};