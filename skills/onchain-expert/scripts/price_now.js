
const fs = require('fs');
const dex = JSON.parse(fs.readFileSync('dex.json', 'utf8'));
const pair = dex.pairs[0];
const p = parseFloat(pair.priceUsd);
const change = pair.priceChange.h24;
const mcap = pair.fdv;

console.log(`💎 **$HODLAI Price Check**`);
console.log(`💵 **Price**: $${p.toFixed(6)}`);
console.log(`📉 **24h Change**: ${change >= 0 ? '🟢 +' + change : '🔴 ' + change}%`);
console.log(`🏦 **Market Cap**: $${Math.floor(mcap).toLocaleString()}`);
console.log(`📊 **Link**: [DexScreener](${pair.url})`);
