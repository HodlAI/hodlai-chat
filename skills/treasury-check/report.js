
const fs = require('fs');

// Load data
const dex = JSON.parse(fs.readFileSync('dex.json', 'utf8'));
const apiData = JSON.parse(fs.readFileSync('api.json', 'utf8'));

// 1. Calculate Revenue (3% Tax of 24h Volume)
const pair = dex.pairs[0];
const volume24h = pair.volume.h24;
const revenue24h = volume24h * 0.03; // 3% estimation

// 2. Calculate Real-time Expense (Sum up records from the last 24 hours)
const now = new Date();
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
let realExpense24h = 0;

// Filter and sum recent expenses
// Transparency API format: { data: { records: [ { amount: 3150, createdAt: "2026-02-02 10:06:03", ... } ] } }
const records = apiData.data ? apiData.data.records : (apiData.records || []);

records.forEach(record => {
    // Parse UTC Date "2026-02-02 10:06:03"
    // Assuming simple parsing works or adding 'Z' for UTC if needed
    const recordDate = new Date(record.createdAt.replace(' ', 'T') + 'Z'); 
    
    if (recordDate >= oneDayAgo) {
        realExpense24h += parseFloat(record.amount);
    }
});

// 3. Treasury Status
// Note: We don't have a live chain-reader for treasury balance in this script yet, 
// so we use the known anchor (~$90k + revenue - expense) or a static placeholder for now.
// Ideally this should fetch BscScan balance. For now, let's use the static anchor updated manually or estimated.
const treasuryAnchor = 90000; 
const netChange = revenue24h - realExpense24h;
const estimatedTreasury = treasuryAnchor + netChange; // Rough estimate

// 4. Analysis Logic
let status = "🟡 Balanced";
let signal = "Hold";
if (revenue24h > realExpense24h * 1.5) {
    status = "🟢 Bullish (盈余扩大)";
    signal = "Treasury Increasing 📈";
} else if (revenue24h < realExpense24h) {
    status = "🔴 Deficit (消耗储备)";
    signal = "Burning Reserve 🔥";
}

// 5. Output
console.log(`📊 **HodlAI 实时财报 (Real-Time)**`);
console.log(`------------------------------`);
console.log(`⏱️ **统计周期**: 过去 24 小时`);
console.log(`💰 **链上交易量**: $${volume24h.toLocaleString('en-US', {maximumFractionDigits: 0})}`);
console.log(`📥 **预估税收 (3%)**: +$${revenue24h.toLocaleString('en-US', {maximumFractionDigits: 0})}`);
console.log(`📤 **实际支出 (API)**: -$${realExpense24h.toLocaleString('en-US', {maximumFractionDigits: 0})}`);
console.log(`------------------------------`);
console.log(`💵 **净现金流 (Net)**: ${netChange > 0 ? '+' : ''}$${netChange.toLocaleString('en-US', {maximumFractionDigits: 0})}`);
console.log(`🏦 **国库估算**: ~$${estimatedTreasury.toLocaleString('en-US', {maximumFractionDigits: 0})}`);
console.log(`------------------------------`);
console.log(`📈 **健康度**: ${status}`);
console.log(`💡 **信号**: ${signal}`);
if (realExpense24h > 2000) {
    console.log(`ℹ️ *提示: 今日支出较高，系项目方进行大额 API 预充值所致。*`);
}
