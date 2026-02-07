/**
 * Update Agent Endpoint Script
 * 
 * Uses sdk.loadAgent() to hydrate from chain + IPFS
 * Then updates the endpoint and re-registers (updates IPFS/Contract)
 */
import 'dotenv/config';
import { SDK } from 'agent0-sdk';

const AGENT_ID = '56:89';
const NEW_CARD_URL = 'https://agent.hodlai.fun/.well-known/agent-card.json';

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL;
  if (!privateKey || !rpcUrl) throw new Error('Missing configuration');

  console.log(`🔧 Connecting to BSC...`);
  const sdk = new SDK({
    chainId: 56,
    rpcUrl,
    signer: privateKey,
    // We must provide the registry address (patched or not, we override to be safe)
    // Actually, if we patched the code, we might not strictly need this if we rely on imports,
    // but the patching might have been specific to the 'contracts.js' file.
    // However, for consistency, passing it is safer.
    registryOverrides: {
        56: {
            IDENTITY: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432'
        }
    },
    // Also include IPFS config to read the existing file
    ipfs: 'pinata',
    pinataJwt: process.env.PINATA_JWT,
  });

  console.log(`📥 Loading Agent ${AGENT_ID}...`);
  try {
      const agent = await sdk.loadAgent(AGENT_ID);
      console.log(`   Name: ${agent.name}`);
      console.log(`   Old A2A: ${agent.a2aEndpoint}`);
      
      console.log(`🔄 Updating A2A Endpoint to: ${NEW_CARD_URL}`);
      await agent.setA2A(NEW_CARD_URL);
      
      console.log('⛓️  Committing update to BSC...');
      const txHandle = await agent.registerIPFS();
      const { result } = await txHandle.waitMined();
      
      console.log('✅ Update successful!');
      console.log('   New URI:', result.agentURI);
      
  } catch (err: any) {
      console.error("❌ Update failed:", err.message);
      if (err.cause) console.error("   Cause:", err.cause);
      process.exit(1);
  }
}

main();