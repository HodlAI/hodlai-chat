/**
 * ERC-8004 Agent Registration Script
 * 
 * Uses the Agent0 SDK (https://sdk.ag0.xyz/) for registration.
 * The SDK handles:
 * - Two-step registration flow (mint → upload → setAgentURI)
 * - IPFS uploads via Pinata
 * - Proper metadata format with registrations array
 * 
 * Requirements:
 * - PRIVATE_KEY in .env (wallet with ETH for gas)
 * - PINATA_JWT in .env (for IPFS uploads)
 * - RPC_URL in .env (optional, defaults to public endpoint)
 * 
 * Run with: npm run register
 */

import 'dotenv/config';
import { SDK } from 'agent0-sdk';

// ============================================================================
// Agent Configuration
// ============================================================================

const AGENT_CONFIG = {
  name: 'HodlAI Protocol',
  description: 'The Energy Grid for Silicon Life. Holding $HODLAI grants perpetual access to SOTA Models (GPT-5, O3, Claude Opus). No Subscriptions. Just Asset Ownership. SDK: agent.hodlai.fun/sdk',
  image: './logo.jpg',
  // Update these URLs when you deploy your agent
  a2aEndpoint: 'https://agent.hodlai.fun/.well-known/agent-card.json',
  mcpEndpoint: 'https://agent.hodlai.fun/mcp',
};

// ============================================================================
// Main Registration Flow
// ============================================================================

async function main() {
  // Validate environment
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not set in .env');
  }

  const pinataJwt = process.env.PINATA_JWT;
  if (!pinataJwt) {
    throw new Error('PINATA_JWT not set in .env');
  }

  const rpcUrl = process.env.RPC_URL || 'https://lb.drpc.live/bsc/At_J2_4UBE0DvXufYTxkBabn_V3jAnoR8IDofhHoK236';

  // Initialize SDK
  console.log('🔧 Initializing Agent0 SDK...');
  const sdk = new SDK({
    chainId: 56,
    rpcUrl,
    signer: privateKey,
    ipfs: 'pinata',
    pinataJwt,
    registryAddress: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432', // Try deterministic deployment
  });

  // Create or Load agent
  console.log('📝 Loading agent (ID 89)...');
  // Use loadAgent to update an existing agent instead of minting a new one
  const agent = await sdk.loadAgent('56:89');

  // Update metadata using updateInfo
  console.log('🔄 Updating metadata...');
  agent.updateInfo(AGENT_CONFIG.name, AGENT_CONFIG.description, AGENT_CONFIG.image);

  // Configure endpoints
  console.log('🔗 Setting A2A endpoint...');
  agent.setA2A(AGENT_CONFIG.a2aEndpoint);

  // Configure trust models
  console.log('🔐 Setting trust models...');
  agent.setTrust(true, false, false);

  // Set status flags
  // Best practice: Keep active=false until your agent is production-ready
  // Change to true when you're ready for users to discover your agent
  agent.setActive(true);
  agent.setX402Support(false);

  // Add Skills (2026 Taxonomy)
  console.log('🧠 Adding Skills...');
  const metadata = agent.getMetadata();
  metadata.skills = [
    { name: "infrastructure/compute/llm-gateway", level: 1 },
    { name: "finance/payment/token-gating", level: 1 }
  ];
  agent.setMetadata(metadata);

  // Register on-chain with IPFS
  console.log('⛓️  Updating agent on BNB Smart Chain...');
  // ...

  const txHandle = await agent.registerIPFS();
  const { result } = await txHandle.waitMined();

  // Output results
  console.log('');
  console.log('✅ Agent registered successfully!');
  console.log('');
  console.log('🆔 Agent ID:', result.agentId);
  console.log('📄 Agent URI:', result.agentURI);
  console.log('');
  console.log('🌐 View your agent on 8004scan:');
  const agentIdNum = result.agentId?.split(':')[1] || result.agentId;
  console.log(`   https://www.8004scan.io/agents/bsc/${agentIdNum}`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Update AGENT_CONFIG endpoints with your production URLs');
  console.log('   2. Run `npm run start:a2a` to start your A2A server');
  console.log('   3. Deploy your agent to a public URL');
}

main().catch((error) => {
  console.error('❌ Registration failed:', error.message || error);
  process.exit(1);
});
