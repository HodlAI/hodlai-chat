/**
 * A2A (Agent-to-Agent) Server
 * 
 * This server implements the A2A protocol for agent communication.
 * Learn more: https://a2a-protocol.org/
 * 
 * Endpoints:
 * - GET  /.well-known/agent-card.json  → Agent discovery card
 * - POST /a2a                          → JSON-RPC 2.0 endpoint
 * 
 * Supported methods:
 * - message/send   → Send a message and get a response
 * - tasks/get      → Get status of a previous task
 * - tasks/cancel   → Cancel a running task
 */

import 'dotenv/config';
import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateResponse, type AgentMessage } from './agent.js';


const app = express();
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory for logo.jpg

// SDK Page
app.get('/sdk', (_req: Request, res: Response) => {
  res.sendFile('sdk.html', { root: '.' });
});

// ============================================================================
// In-Memory Storage
// In production, replace with a database (Redis, PostgreSQL, etc.)
// ============================================================================

/**
 * Task storage - tracks all tasks and their current state
 * A task represents a single request/response interaction
 */
const tasks = new Map<string, {
  id: string;
  contextId: string;
  status: 'submitted' | 'working' | 'input-required' | 'completed' | 'failed' | 'canceled';
  messages: Array<{ role: 'user' | 'agent'; parts: Array<{ type: 'text'; text: string }> }>;
  artifacts: Array<{ name: string; parts: Array<{ type: 'text'; text: string }> }>;
}>();

/**
 * Conversation history storage - maintains context across messages
 * The contextId allows multiple messages to share conversation history
 */
const conversationHistory = new Map<string, AgentMessage[]>();

// ============================================================================
// Middleware & Routes
// ============================================================================

/**
 * Agent Card endpoint - required for A2A discovery
 * Other agents use this to learn about your agent's capabilities
 */
app.get('/', (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HodlAI Protocol Agent</title>
        <link rel="icon" type="image/jpeg" href="/logo.jpg">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .scan-line {
                width: 100%;
                height: 2px;
                background: linear-gradient(to right, transparent, #38bdf8, transparent);
                position: absolute;
                top: 0;
                left: 0;
                animation: scan 3s linear infinite;
                opacity: 0.5;
            }
            @keyframes scan {
                0% { top: 0%; }
                100% { top: 100%; }
            }
            .glow-text {
                text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
            }
        </style>
    </head>
    <body class="bg-gray-950 text-sky-100 font-mono min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        
        <div class="scan-line"></div>

        <div class="z-10 text-center max-w-2xl px-6 border border-sky-900/30 p-10 rounded-xl bg-gray-900/50 backdrop-blur-sm shadow-2xl shadow-sky-900/20">
            <div class="mb-6 inline-block p-4 rounded-full bg-sky-900/20 border border-sky-500/30 animate-pulse">
                <img src="/logo.jpg" class="h-16 w-16" alt="HodlAI Logo" style="border-radius: 50%;"> 
            </div>

            <h1 class="text-4xl md:text-6xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 glow-text">
                HODLAI PROTOCOL
            </h1>
            <p class="text-xs text-sky-500/70 tracking-[0.3em] uppercase mb-8">Autonomous Agent Registry • BSC Chain</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm mb-8 bg-black/30 p-6 rounded-lg border border-sky-900/50">
                <div class="flex justify-between border-b border-gray-800 pb-2">
                    <span class="text-gray-500">Identity (AgentID)</span>
                    <span class="text-green-400 font-bold">56:89</span>
                </div>
                <div class="flex justify-between border-b border-gray-800 pb-2">
                    <span class="text-gray-500">Network</span>
                    <span class="text-yellow-400">BNB Smart Chain</span>
                </div>
                 <div class="flex justify-between border-b border-gray-800 pb-2">
                    <span class="text-gray-500">Status</span>
                    <span class="flex items-center text-sky-400">
                        <span class="w-2 h-2 bg-sky-400 rounded-full mr-2 animate-ping"></span>
                        ONLINE
                    </span>
                </div>
                <div class="flex justify-between border-b border-gray-800 pb-2">
                    <span class="text-gray-500">Standard</span>
                    <span class="text-purple-400">ERC-8004</span>
                </div>
            </div>

            <p class="text-lg text-gray-400 mb-8 leading-relaxed">
                "Holding is Access." <br>
                This sovereign agent provides intelligence to the ecosystem.<br>
                Powered by the <span class="text-sky-300 font-bold">$HODLAI</span> token.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://hodlai.fun" target="_blank" class="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-sky-500/25 flex items-center justify-center">
                    Purchase $HODLAI
                </a>
                <a href="/sdk" class="px-8 py-3 bg-white/5 border border-sky-500/50 hover:bg-sky-500/20 text-sky-400 hover:text-white rounded-lg transition-all flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(14,165,233,0.1)] hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    &lt;/&gt; Developer SDK
                </a>
                <a href="/.well-known/agent-card.json" class="px-8 py-3 border border-gray-700 hover:border-gray-500 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all flex items-center justify-center font-mono text-sm">
                    JSON Card
                </a>
            </div>
            
             <div class="mt-8 text-xs text-gray-600">
                Core ID: <code class="bg-gray-800 px-2 py-1 rounded">56:89</code> • Registry: <code class="bg-gray-800 px-2 py-1 rounded">8004scan.io</code>
            </div>
        </div>

        <div class="absolute bottom-4 text-sky-900/30 text-[10px] tracking-widest pointer-events-none">
            SYSTEM: ACTIVE • NODE: HH-LA • KERNEL: 56.89.01
        </div>

    </body>
    </html>
  `);
});

app.get('/.well-known/agent-card.json', async (_req: Request, res: Response) => {
  const agentCard = await import('../.well-known/agent-card.json', { assert: { type: 'json' } });
  res.json(agentCard.default);
});

/**
 * Main JSON-RPC 2.0 endpoint
 * All A2A protocol methods are called through this single endpoint
 */
app.post('/a2a', async (req: Request, res: Response) => {
  const { jsonrpc, method, params, id } = req.body;

  // Validate JSON-RPC version
  if (jsonrpc !== '2.0') {
    return res.json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id });
  }

  try {
    const result = await handleMethod(method, params);
    res.json({ jsonrpc: '2.0', result, id });
  } catch (error: any) {
    res.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: error.message || 'Internal error' },
      id,
    });
  }
});

// ============================================================================
// Method Handlers
// ============================================================================

/**
 * Route JSON-RPC methods to their handlers
 * Add new methods here as needed
 */
async function handleMethod(method: string, params: any) {
  switch (method) {
    case 'message/send':
      return handleMessageSend(params);
    case 'tasks/get':
      return handleTasksGet(params);
    case 'tasks/cancel':
      return handleTasksCancel(params);
    default:
      throw new Error(`Method not found: ${method}`);
  }
}

/**
 * Handle message/send - the main method for chatting with the agent
 * 
 * @param params.message - The user's message with role and parts
 * @param params.configuration.contextId - Optional ID to continue a conversation
 * @returns A task object with the agent's response
 */
async function handleMessageSend(params: {
  message: { role: string; parts: Array<{ type: string; text?: string }> };
  configuration?: { contextId?: string };
}) {
  const { message, configuration } = params;
  
  // Use existing contextId for conversation continuity, or create new one
  const contextId = configuration?.contextId || uuidv4();
  const taskId = uuidv4();

  // Extract text content from message parts
  // A2A messages can have multiple parts (text, files, etc.)
  const userText = message.parts
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text)
    .join('\n');

  // Get conversation history for context-aware responses
  const history = conversationHistory.get(contextId) || [];

  // Generate response using the LLM (see agent.ts)
  const responseText = await generateResponse(userText, history);

  // Update conversation history for future messages
  history.push({ role: 'user', content: userText });
  history.push({ role: 'assistant', content: responseText });
  conversationHistory.set(contextId, history);

  // Create the task response object
  // This follows the A2A protocol task structure
  const task = {
    id: taskId,
    contextId,
    status: 'completed' as const,
    messages: [
      { role: 'user' as const, parts: [{ type: 'text' as const, text: userText }] },
      { role: 'agent' as const, parts: [{ type: 'text' as const, text: responseText }] },
    ],
    artifacts: [], // Add any generated files/data here
  };

  tasks.set(taskId, task);

  return task;
}

/**
 * Handle tasks/get - retrieve a task by ID
 * Useful for checking status of async operations
 */
async function handleTasksGet(params: { taskId: string }) {
  const task = tasks.get(params.taskId);
  if (!task) {
    throw new Error('Task not found');
  }
  return task;
}

/**
 * Handle tasks/cancel - cancel a running task
 * For long-running tasks, this allows early termination
 */
async function handleTasksCancel(params: { taskId: string }) {
  const task = tasks.get(params.taskId);
  if (!task) {
    throw new Error('Task not found');
  }
  task.status = 'canceled';
  return task;
}

// ============================================================================
// Start Server
// ============================================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 A2A Server running on http://localhost:${PORT}`);
  console.log(`📋 Agent Card: http://localhost:${PORT}/.well-known/agent-card.json`);
  console.log(`🔗 JSON-RPC endpoint: http://localhost:${PORT}/a2a`);
});
