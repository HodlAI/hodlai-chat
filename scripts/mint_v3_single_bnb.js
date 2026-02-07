const { ethers } = require("ethers");

const RPC_URL = 'https://bsc-dataseed.binance.org';
const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const POSITION_MANAGER_ADDRESS = '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613';
const POOL_ADDRESS = '0x6fe9e9de56356f7edbfcbb29fab7cd69471a4869';
const PRIVATE_KEY = '0x17a5211f1705b2d3b33807533fa58d4bd90f7b0fe36cf3cddf7a121d43d53115';

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    const wbnb = new ethers.Contract(WBNB_ADDRESS, [
        "function balanceOf(address account) external view returns (uint256)"
    ], wallet);
    const amountToMint = await wbnb.balanceOf(wallet.address);
    
    if (amountToMint === 0n) throw new Error("No WBNB to mint");

    const pool = new ethers.Contract(POOL_ADDRESS, [
        "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
    ], provider);

    const [sqrtPriceX96, currentTick] = await pool.slot0();
    const tickSpacing = 60; 

    let tickUpper = Math.floor(Number(currentTick) / tickSpacing) * tickSpacing;
    let tickLower = tickUpper - 5000;
    tickLower = Math.floor(tickLower / tickSpacing) * tickSpacing;

    const pm = new ethers.Contract(POSITION_MANAGER_ADDRESS, [
      "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
    ], wallet);

    const params = {
        token0: USDT_ADDRESS,
        token1: WBNB_ADDRESS,
        fee: 3000, 
        tickLower: tickLower,
        tickUpper: tickUpper,
        amount0Desired: 0,
        amount1Desired: amountToMint,
        amount0Min: 0,
        amount1Min: 0,
        recipient: wallet.address,
        deadline: Math.floor(Date.now() / 1000) + 600
    };

    console.log(`Minting single side BNB position in range [${tickLower}, ${tickUpper}] with ${ethers.formatEther(amountToMint)} WBNB`);
    const mintTx = await pm.mint(params);
    const receipt = await mintTx.wait();
    console.log(`Success! TX: ${mintTx.hash}`);
}

main().catch(console.error);
