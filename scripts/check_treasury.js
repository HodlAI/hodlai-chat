import { ethers } from 'ethers';

const RPC_URL = 'https://bsc-dataseed.binance.org';
const TREASURY_ADDRESS = '0x6f7D20FB985ae407Eae6157F8b298729febCe8F0';

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const balance = await provider.getBalance(TREASURY_ADDRESS);
  console.log(`Treasury BNB Balance: ${ethers.formatEther(balance)}`);
}

main().catch(console.error);
