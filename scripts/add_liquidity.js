
import { ethers } from 'ethers';

// Configuration
const RPC_URL = 'https://bsc-dataseed.binance.org'; // BNB Chain RPC
const POOL_ADDRESS = '0x6fe9e9de56356f7edbfcbb29fab7cd69471a4869'; // BNB/USDT V3
const POSITION_MANAGER_ADDRESS = '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613'; // Uniswap V3 NonfungiblePositionManager
const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const PRIVATE_KEY = '0x17a5211f1705b2d3b33807533fa58d4bd90f7b0fe36cf3cddf7a121d43d53115';
const TOKEN0_IS_WBNB = true; // Address comparison: 0xbb4... < 0x55d... (WBNB < USDT) ? No.
// Let's sort addresses to be sure about token0/token1
// WBNB: 0xbb4C...
// USDT: 0x55d3...
// 0x55d3... < 0xbb4C... So USDT is token0, WBNB is token1.

// ABI for minimal interaction
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function deposit() payable", // WBNB deposit
  "function balanceOf(address account) external view returns (uint256)"
];
const PM_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "token0", "type": "address" },
          { "internalType": "address", "name": "token1", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "int24", "name": "tickLower", "type": "int24" },
          { "internalType": "int24", "name": "tickUpper", "type": "int24" },
          { "internalType": "uint256", "name": "amount0Desired", "type": "uint256" },
          { "internalType": "uint256", "name": "amount1Desired", "type": "uint256" },
          { "internalType": "uint256", "name": "amount0Min", "type": "uint256" },
          { "internalType": "uint256", "name": "amount1Min", "type": "uint256" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "internalType": "struct INonfungiblePositionManager.MintParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "mint",
    "outputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint128", "name": "liquidity", "type": "uint128" },
      { "internalType": "uint256", "name": "amount0", "type": "uint256" },
      { "internalType": "uint256", "name": "amount1", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
];
const POOL_ABI = [
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function fee() external view returns (uint24)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`🚀 Governor Wallet: ${wallet.address}`);
  
  // 1. Check Balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} BNB`);
  
  // Check WBNB Balance
  const wbnb = new ethers.Contract(WBNB_ADDRESS, ERC20_ABI, wallet);
  const wbnbBalance = await wbnb.balanceOf(wallet.address);
  console.log(`WBNB Balance: ${ethers.formatEther(wbnbBalance)} WBNB`);

  const amountToMint = ethers.parseEther("0.009");
  
  if (wbnbBalance >= amountToMint) {
      console.log("✅ Sufficient WBNB found. Skipping wrap.");
  } else {
      const amountNeeded = amountToMint - wbnbBalance;
      if (balance < amountNeeded + ethers.parseEther("0.002")) { // Gas buffer
          console.log("❌ Insufficient BNB to wrap and pay gas.");
          return;
      }
      console.log(`⏳ Wrapping ${ethers.formatEther(amountNeeded)} BNB...`);
      const wrapTx = await wbnb.deposit({ value: amountNeeded });
      await wrapTx.wait();
      console.log("✅ WBNB Wrapped");
  }

  // 3. Approve Position Manager
  console.log("⏳ Approving Position Manager...");
  const approveTx = await wbnb.approve(POSITION_MANAGER_ADDRESS, amountToMint);
  await approveTx.wait();
  console.log("✅ Approved");

  // 4. Get Pool Data
  const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI, provider);
  const [sqrtPriceX96, currentTick] = await pool.slot0();
  const fee = await pool.fee();
  console.log(`Current Tick: ${currentTick}, Fee: ${fee}`);

  // 5. Calculate Ticks (Single Side: +10% range ABOVE price)
  // USDT is token0, WBNB is token1. 
  // Price = token1/token0? No, Price = token1 per token0 usually in standard notation but tick math is specific.
  // In V3, price P = 1.0001^tick.
  // 0.01 BNB liquidity single sided.
  // Strategy: Add BNB only.
  // If we hold Token1 (WBNB), and want to sell it as price goes UP (BNB price in USDT goes up).
  // Standard pair order: token0=USDT, token1=WBNB.
  // Price represents Amount of WBNB per 1 USDT ? No.
  // Address sort:
  // USDT: 0x55d398326f99059fF775485246999027B3197955
  // WBNB: 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c
  // token0 = USDT, token1 = WBNB.
  // Price = y/x = WBNB / USDT. This means price is "How much WBNB for 1 USDT".
  // BNB Price ~$600 => 1 BNB = 600 USDT => 1 USDT = 0.00166 WBNB.
  // If BNB price goes UP ($600 -> $660), 1 USDT is worth FEWER WBNB (0.00166 -> 0.00151).
  // So "BNB Price Up" means "Price (WBNB/USDT) goes DOWN".
  
  // Wait, let's verify standard interface logic.
  // Standard view: BNB/USDT Price ~ 600.
  // If token0=BNB, token1=USDT: Price=600. Up is Up.
  // If token0=USDT, token1=BNB: Price=0.00166. Up (BNB value) is Down (tick).
  
  // Target: Range [Current Price, Current Price + 10%] (in BNB value).
  // Terms of tick (USDT/WBNB, if token0=USDT):
  // Current Price P_curr.
  // Target Price P_target (BNB +10%) => P_target_tick < P_curr_tick.
  // We want to provide WBNB, so we need to be in a range where we are converting WBNB -> USDT as price moves.
  // If token0=USDT, token1=WBNB.
  // Holding WBNB (token1) means we are providing liquidity "below" the current price tick? 
  // No. Providing token1 (WBNB) only implies we are in a range ABOVE the current tick (if price goes up into it, we buy token0/sell token1).
  // V3 Logic:
  // Range [Ta, Tb]. Current tick Tc.
  // If Tc < Ta: Position is entirely token0. 
  // If Tc > Tb: Position is entirely token1.
  // We want to provide ONLY WBNB. So we must be in the "Tc > Tb" case? No, that would mean we are already fully converted?
  // Let's re-read V3 spec.
  // If current Tick < Lower Tick: You hold Token0 (USDT).
  // If current Tick > Upper Tick: You hold Token1 (WBNB).
  
  // We have WBNB. We want to be in the "Tick > Upper Tick" state relative to the active range?
  // Wait. If we provide liquidity, and we WANT to provide WBNB.
  // We should pick a range [tickLower, tickUpper] such that CurrentTick > tickUpper. 
  // Then we are providing token1 (WBNB).
  // As price moves DOWN (tick decreases) entering our range, we buy USDT (token0) and sell WBNB. 
  // Wait. Tick decreasing means price (WBNB/USDT) decreases? 
  // Yes, since price = 1.0001^tick. Lower tick = Less WBNB per USDT = USDT is stronger? No.
  // Less WBNB per USDT = 1 USDT buys Less WBNB = WBNB is MORE valuable.
  // So: Tick DOWN = WBNB Price UP.
  
  // Verification:
  // 1 USDT = 0.00166 WBNB (Tick X)
  // 1 USDT = 0.00151 WBNB (Tick Y) -> WBNB price went from 600 to 660.
  // 0.00151 < 0.00166. So Tick Y < Tick X.
  // So Tick Decreases = WBNB Price Increases.
  
  // WE WANT: 
  // Range start: Current Price.
  // Range end: Price + 10% (BNB Value).
  // In ticks:
  // Start Tick: Current Tick.
  // End Tick: Tick corresponding to (Price_WBNB_per_USDT / 1.10).
  // Since tick decreases as price goes up.
  // So the range is [TargetTick, CurrentTick].
  // Check V3 condition again:
  // If Current Tick > Upper Tick => We hold Token1.
  // Here, Upper Tick = Current Tick (roughly).
  // So we are providing in range [Target, Current].
  // Since Current is the top of the range (numerically higher tick, lower BNB price).
  // Wait, price moves from Current (High Tick) down to Target (Low Tick).
  // As tick moves down (entering our range from the top), we are converting Token1 (WBNB) into Token0 (USDT).
  // Correct!
  
  // So:
  // tickUpper = ceil(currentTick / tickSpacing) * tickSpacing. (Round to be safe/valid)
  // tickLower = tickUpper - (corresponding to 10% price change).
  // 10% price increase in BNB => 1/1.10 decrease in WBNB/USDT ratio.
  // log(1/1.1) / log(1.0001) = -9531 ticks.
  // So tickLower = tickUpper - 9531.

  // Tick Spacing:
  // Fee 500 (0.05%) => Spacing 10.
  // Fee 3000 (0.3%) => Spacing 60.
  
  // Let's assume tickUpper = currentTick rounded down to align (so we are just barely "above" or "in" the tick).
  // Actually to be single sided WBNB, current tick must be >= tickUpper.
  // So we set tickUpper <= currentTick.
  
  const tickSpacing = fee === 500n ? 10 : 60; // Approximate check based on fee
  const currentTickInt = Number(currentTick);
  
  // We want range below us (in tick value) -> Price above us (in BNB value)
  let tickUpper = Math.floor(currentTickInt / tickSpacing) * tickSpacing;
  
  // If match exactly, we might be mixed asset. Let's shift one tick spacing down to be safe? 
  // Or just use current. If we are at the boundary, and price moves "up" (tick down), we enter.
  // Let's use tickUpper = (floor)
  
  // Calculate 10% range
  // log(1.1) / log(1.0001) ≈ 9531 ticks.
  // But wait, direction.
  // BNB Price +10% => WBNB/USDT ratio * (1/1.1).
  // log(1/1.1) ≈ -0.0953.
  // -0.0953 / 0.0001 ≈ -9531.
  // So we want a range of ~9500 ticks BELOW current tick.
  
  let tickLower = tickUpper - 9500;
  // Align tickLower
  tickLower = Math.floor(tickLower / tickSpacing) * tickSpacing;

  console.log(`Target Range Ticks: ${tickLower} -> ${tickUpper}`);
  console.log(`Current Tick: ${currentTickInt}`);
  console.log(`Action: Adding Liquidity (Selling BNB as tick drops/price rises)`);

  const pm = new ethers.Contract(POSITION_MANAGER_ADDRESS, PM_ABI, wallet);
  
  const params = {
      token0: USDT_ADDRESS, // Address < WBNB Address
      token1: WBNB_ADDRESS,
      fee: fee,
      tickLower: tickLower,
      tickUpper: tickUpper,
      amount0Desired: 0, // No USDT
      amount1Desired: amountToMint, // WBNB
      amount0Min: 0,
      amount1Min: 0, // Slippage protection omitted for demo script (dangerous in prod!)
      recipient: wallet.address,
      deadline: Math.floor(Date.now() / 1000) + 600
  };

  console.log("⏳ Minting Position...");
  const mintTx = await pm.mint(params);
  console.log(`Mint TX: ${mintTx.hash}`);
  await mintTx.wait();
  console.log("✅ Liquidity Added! NFT minted.");
}

main().catch(console.error);
