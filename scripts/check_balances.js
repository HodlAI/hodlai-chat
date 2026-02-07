const { ethers } = require("ethers");

const RPC_URL = "https://bsc-dataseed.binance.org/";
const provider = new ethers.JsonRpcProvider(RPC_URL);

const USDT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC-USD

async function check() {
  const wallets = [
    { name: "Governor", addr: "0xa7A2950af4608b5058c23e09147B06039e1CEfbB" },
    { name: "Treasury", addr: "0x6f7D20FB985ae407Eae6157F8b298729febCe8F0" }
  ];

  const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);

  for (const w of wallets) {
    const bnbBal = await provider.getBalance(w.addr);
    const usdtBal = await usdtContract.balanceOf(w.addr);
    
    console.log(`--- ${w.name} ---`);
    console.log(`Address: ${w.addr}`);
    console.log(`BNB: ${ethers.formatEther(bnbBal)}`);
    console.log(`USDT: ${ethers.formatUnits(usdtBal, 18)}`);
  }
}

check().catch(console.error);
