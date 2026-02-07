
const https = require('https');

const RPC_URL = "https://bsc-rpc.publicnode.com";
const TOKEN_ADDRESS = "0x987e6269c6b7ea6898221882f11ea16f87b97777"; // HODLAI
const WALLET_ADDRESS = "0x18deEE9699526f8C8a87004b2e4e55029Fb26b9a";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// Pad address to 32 bytes
const PADDED_WALLET = "0x" + "0".repeat(24) + WALLET_ADDRESS.slice(2).toLowerCase();

async function rpcCall(method, params) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: method,
            params: params
        });

        const req = https.request(RPC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function getLogsRecursive(topicPosition, fromBlock, toBlock) {
    const CHUNK_SIZE = 49000; // Safe chunk size under 50k limit
    
    let allLogs = [];
    let currentFrom = BigInt(fromBlock);
    const endBlock = BigInt(toBlock);

    while (currentFrom <= endBlock) {
        let currentTo = currentFrom + BigInt(CHUNK_SIZE);
        if (currentTo > endBlock) currentTo = endBlock;

        const hexFrom = "0x" + currentFrom.toString(16);
        const hexTo = "0x" + currentTo.toString(16);
        
        // Topics: [Signature, From, To]
        const topics = [TRANSFER_TOPIC, null, null];
        topics[topicPosition] = PADDED_WALLET;

        // console.log(`Scanning blocks ${currentFrom} to ${currentTo}...`);

        try {
            const response = await rpcCall("eth_getLogs", [{
                fromBlock: hexFrom,
                toBlock: hexTo,
                address: TOKEN_ADDRESS,
                topics: topics
            }]);

            if (response.error) throw new Error(JSON.stringify(response.error));
            if (response.result.length > 0) {
                 allLogs.push(...response.result);
            }
            
        } catch (e) {
            console.error(`Error scanning ${hexFrom}-${hexTo}: ${e.message}`);
        }

        currentFrom = currentTo + 1n;
    }

    return allLogs;
}

async function getCurrentBlock() {
     const response = await rpcCall("eth_blockNumber", []);
     return response.result;
}

async function main() {
    try {
        console.log(`Analyzing HODLAI activity for ${WALLET_ADDRESS}...`);
        
        const latestBlockHex = await getCurrentBlock();
        const latestBlock = parseInt(latestBlockHex, 16);
        // Start from approx genesis of token to save time, or a recent range if unknown
        // HODLAI Launch approx: Jan 26, 2026. 
        // BSC Block time 3s. Days passed: ~8. Blocks: 8*24*3600/3 = 230,400.
        // Let's scan last 300,000 blocks to be safe.
        const startBlock = latestBlock - 300000; 

        console.log(`Scanning from block ${startBlock} to ${latestBlock}...`);

        // 1. Get Incoming (To Wallet)
        const incoming = await getLogsRecursive(2, startBlock, latestBlock);
        console.log(`Found ${incoming.length} incoming transfers.`);

        // 2. Get Outgoing (From Wallet)
        const outgoing = await getLogsRecursive(1, startBlock, latestBlock);
        console.log(`Found ${outgoing.length} outgoing transfers.`);

        const allTx = [...incoming.map(l => ({...l, type: 'IN'})), ...outgoing.map(l => ({...l, type: 'OUT'}))];
        
        // Sort by block number
        allTx.sort((a, b) => parseInt(a.blockNumber, 16) - parseInt(b.blockNumber, 16));

        if (allTx.length === 0) {
            console.log("No activity found in the last ~10 days range.");
            return;
        }

        // Process and display
        let balance = 0.0; // Use float for simple math representation
        
        console.log("\nHistory:");
        for (const tx of allTx) {
            const amountHex = tx.data;
            const amount = BigInt(amountHex);
            const humanAmount = Number(amount) / 1e18;
            
            const block = parseInt(tx.blockNumber, 16);
            
            if (tx.type === 'IN') {
                balance += humanAmount;
                console.log(`[Block ${block}] 📥 IN  +${humanAmount.toLocaleString()} HODLAI (Tx: ${tx.transactionHash})`);
            } else {
                balance -= humanAmount;
                console.log(`[Block ${block}] 📤 OUT -${humanAmount.toLocaleString()} HODLAI (Tx: ${tx.transactionHash})`);
            }
        }
        
    } catch (err) {
        console.error("Error:", err);
    }
}

main();
