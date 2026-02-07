
import { ethers } from 'ethers';

const RPC_URL = 'https://bsc-dataseed.binance.org';
const POSITION_MANAGER_ADDRESS = '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613';
const GOVERNOR_ADDRESS = '0xa7A2950af4608b5058c23e09147B06039e1CEfbB';

const PM_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
  "function collect(tuple(uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max) params) external payable returns (uint256 amount0, uint256 amount1)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const pm = new ethers.Contract(POSITION_MANAGER_ADDRESS, PM_ABI, provider);

  // 1. Get Balance
  const balance = await pm.balanceOf(GOVERNOR_ADDRESS);
  console.log(`🔍 Found ${balance} V3 positions for Governor.`);

  if (balance == 0n) {
      console.log("No positions found.");
      return;
  }

  // 2. Iterate
  for (let i = 0; i < balance; i++) {
      const tokenId = await pm.tokenOfOwnerByIndex(GOVERNOR_ADDRESS, i);
      console.log(`\n🎫 Token ID: ${tokenId}`);
      
      const pos = await pm.positions(tokenId);
      console.log(`   Liquidity: ${pos.liquidity}`);
      console.log(`   Range: [${pos.tickLower}, ${pos.tickUpper}]`);
      
      // 3. Simulate Collect to see pending fees
      // We use staticCall to simulate the transaction exactly as if we were claiming
      // MAX_UINT128 allows us to check all available fees.
      try {
          // Note: In Ethers v6, we can use staticCall on the contract function
          const results = await pm.collect.staticCall({
              tokenId: tokenId,
              recipient: GOVERNOR_ADDRESS,
              amount0Max: 340282366920938463463374607431768211455n, // MaxUint128
              amount1Max: 340282366920938463463374607431768211455n  // MaxUint128
          });
          
          const fees0 = ethers.formatUnits(results[0], 18); // Assume BNB/USDT 18 decimals (USDT is 18 on BSC)
          const fees1 = ethers.formatUnits(results[1], 18); // WBNB is 18
          
          console.log(`   💰 Pending Fees:`);
          console.log(`      Token0 (USDT): ${fees0}`);
          console.log(`      Token1 (WBNB): ${fees1}`);
      } catch (e) {
          console.log(`   ⚠️ Failed to simulate fee collection: ${e.message}`);
      }
  }
}

main().catch(console.error);
