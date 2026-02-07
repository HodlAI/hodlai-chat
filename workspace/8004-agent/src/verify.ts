import { SDK } from 'agent0-sdk';
import 'dotenv/config';

async function main() {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) throw new Error("Missing RPC_URL");

  console.log("Connecting to BSC...");
  const sdk = new SDK({
    chainId: 56,
    rpcUrl,
    // We must provide the registry address we decided to use/patch
    registryAddress: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432', 
  });

  const agentId = '89'; // ID provided in logs
  console.log(`Fetching Agent ${agentId} on Chain 56...`);

  try {
    // SDK might expect just the numeric ID if the chain is set in constructor
    const agent = sdk.getAgent(agentId);
    
    // Note: getAgent might return an object wrapper or promise depending on SDK version
    // Based on register.ts usage, it seems object-oriented.
    // Let's inspect what we can get.
    
    // Some SDKs use distinct methods for fetching data vs creating an instance
    // We'll try to read its URI.
    const uri = await agent.getAgentURI();
    console.log('Agent URI:', uri);

    // If we can get the URI, the patch and registration worked.
  } catch (err: any) {
    console.error("Verification failed:", err.message);
  }
}

main();