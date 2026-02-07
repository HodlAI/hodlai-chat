
import { ethers } from 'ethers';

// Configuration
const RPC_URL = process.env.RPC_URL || 'https://bsc-dataseed.binance.org';
const PM_ADDRESS = '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613'; // BSC Position Manager
const POOL_ABI = [
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)"
];
const PM_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
  "function collect(tuple(uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max) params) external payable returns (uint256 amount0, uint256 amount1)"
];
const ERC20_ABI = [
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)"
];

const ERC20_CACHE = {};

async function getTokenInfo(address, provider) {
    if (ERC20_CACHE[address]) return ERC20_CACHE[address];
    try {
        const contract = new ethers.Contract(address, ERC20_ABI, provider);
        const [symbol, decimals] = await Promise.all([contract.symbol(), contract.decimals()]);
        const info = { symbol, decimals };
        ERC20_CACHE[address] = info;
        return info;
    } catch (e) {
        return { symbol: '???', decimals: 18 };
    }
}

async function getPoolAddress(factoryAddress, token0, token1, fee, provider) {
    // Basic compute address or just fetch from PM if possible? 
    // PM doesn't store pool address directly, but we can compute it if we had factory.
    // For simplicity, we just assume we are looking at positions and we want to check current tick.
    // We need the Factory to find the pool.
    // BSC Uniswap V3 Factory: 0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7
    const FACTORY = '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7'; 
    const FACTORY_ABI = ["function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"];
    const factory = new ethers.Contract(FACTORY, FACTORY_ABI, provider);
    return await factory.getPool(token0, token1, fee);
}

async function main() {
    const args = process.argv.slice(2);
    const targetAddress = args[0];

    if (!targetAddress) {
        console.error("Usage: node monitor.js <address>");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const pm = new ethers.Contract(PM_ADDRESS, PM_ABI, provider);

    console.log(`🔎 Scanning positions for: ${targetAddress}`);
    
    const balance = await pm.balanceOf(targetAddress);
    console.log(`📊 Total Positions: ${balance}`);

    for (let i = 0; i < balance; i++) {
        const tokenId = await pm.tokenOfOwnerByIndex(targetAddress, i);
        const pos = await pm.positions(tokenId);
        
        // 1. Get Token Info
        const info0 = await getTokenInfo(pos.token0, provider);
        const info1 = await getTokenInfo(pos.token1, provider);
        
        // 2. Get Pool Info (to check In-Range status)
        const poolAddress = await getPoolAddress('0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7', pos.token0, pos.token1, pos.fee, provider);
        const pool = new ethers.Contract(poolAddress, POOL_ABI, provider);
        const [_, currentTick] = await pool.slot0();
        
        // 3. Status
        const inRange = currentTick >= pos.tickLower && currentTick <= pos.tickUpper;
        const statusIcon = inRange ? "🟢 Active" : "🔴 Out of Range";

        // 4. Pending Fees
        let fees0 = "0", fees1 = "0";
        try {
            const results = await pm.collect.staticCall({
                tokenId: tokenId,
                recipient: targetAddress,
                amount0Max: 340282366920938463463374607431768211455n,
                amount1Max: 340282366920938463463374607431768211455n
            });
            fees0 = ethers.formatUnits(results[0], info0.decimals);
            fees1 = ethers.formatUnits(results[1], info1.decimals);
        } catch (e) {
            console.error(`Error simulating collect: ${e.message}`);
        }

        console.log(`\n🎫 Token ID: ${tokenId} | ${statusIcon}`);
        console.log(`   Pair: ${info0.symbol} / ${info1.symbol} (Fee: ${Number(pos.fee)/10000}%)`);
        console.log(`   Range: [${pos.tickLower} < ${currentTick} < ${pos.tickUpper}]`);
        console.log(`   Liquidity: ${pos.liquidity}`);
        console.log(`   💰 Pending Fees: ${fees0} ${info0.symbol} + ${fees1} ${info1.symbol}`);
    }
}

main().catch(console.error);
