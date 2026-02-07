# HodlAI Protocol

> **The Energy Grid for Silicon Life.**  
> A decentralized infrastructure for AI Agents built on **BNB Smart Chain (BSC)**.

HodlAI transforms API access from a "subscription" model to an "asset" model. Agents hold **$HODLAI** tokens to gain perpetual, daily-refreshing compute credits for top-tier LLMs (GPT-5, Opus, O3).

## Technology Stack

- **Blockchain**: BNB Smart Chain (BSC)
- **Standards**: ERC-20 (Token), ERC-8004 (Agent Identity)
- **Backend**: Node.js, TypeScript, Hono (Gateway), Express (A2A)
- **Authentication**: SIWE (Sign-In with Ethereum)
- **RPC**: BSC Public Nodes / DRPC

## Supported Networks

The protocol is natively deployed and optimized for **BNB Smart Chain**.

- **BNB Smart Chain Mainnet**
  - **Chain ID**: `56` (0x38)
  - **RPC**: `https://bsc-dataseed.binance.org`
  - **Currency**: BNB

## Contract Addresses

| Asset | Contract Address | Explorer Link |
|-------|------------------|---------------|
| **$HODLAI Token** | `0x987e6269c6b7ea6898221882f11ea16f87b97777` | [BscScan](https://bscscan.com/token/0x987e6269c6b7ea6898221882f11ea16f87b97777) |
| **Agent Identity** | `ID: 89` (ERC-8004 Registry `0x2BAc0...`) | [8004Scan](https://www.8004scan.io/agents/bsc/89) |
| **Treasury** | `0x...` (Protocol Tax Receptor) | [BscScan](https://bscscan.com/address/0x987e6269c6b7ea6898221882f11ea16f87b97777) |

## Core Features

### 1. Protocol Gateway (Utility Layer)
- **Hold-to-Access**: Access to AI models is token-gated.
- **Dynamic Quota**: $10 USD held ≈ 100 Compute Credits/Day.
- **Zero Subscriptions**: No credit cards, just wallet signatures.
- **Repository**: `./workspace/hodlai-gateway`

### 2. Agent Identity (Discovery Layer)
- **ERC-8004 Compliant**: Verified Agent ID 89 on BSC.
- **A2A Protocol**: Machine-to-Machine handshake via `/.well-known/agent-card.json`.
- **Repository**: `./workspace/8004-bsc`

### 3. Sustainable Treasury
- **Real Yield**: 3% Transaction Tax on $HODLAI trading volume allows the Treasury to pay centralized API providers (OpenAI/Anthropic) on behalf of decentralized agents.

## Development

### Prerequisites
- Node.js v20+
- Access to BSC RPC

### Installation

```bash
# Install dependencies
npm install

# Configure Environment
cp .env.example .env
# Set BSC_RPC_URL="https://bsc-dataseed.binance.org"
```

### Running the Gateway

```bash
# Start the Gateway (Port 3001)
npm run dev
```

## License

MIT License. Open Source contribution to the BNB Chain Agent Economy.
