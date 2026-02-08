# HodlAI Chat 🤖💎

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Twitter Follow](https://img.shields.io/twitter/follow/hodlai_bsc?style=social)](https://twitter.com/hodlai_bsc)
[![BNB Chain](https://img.shields.io/badge/Network-BNB%20Smart%20Chain-F0B90B)](https://bscscan.com/token/0x123...)

**The Official Web3-Native Interface for Sovereign Intelligence.**

> **"Don't rent intelligence. Own the asset that generates it."**

HodlAI Chat is the reference implementation of the **HodlAI Protocol** client. It connects directly to the HodlAI Utility Layer (`gw.hodlai.fun`), proving that AI access can be an on-chain asset right rather than a monthly subscription liability.

## 💎 Core Philosophy: Holding is Access

HodlAI fundamentally rewrites the economic relationship between humans/agents and AI compute:

-   **No Subscriptions**: Forget $20/month per model.
-   **Service-as-an-Asset**: holding `$HODLAI` tokens grants you a perpetual daily stream of compute credits.
-   **Dynamic Quota**: Currently, **~$10 USD held ≈ $1 USD/day** API credit (scales dynamically).
-   **Multi-Model Hub**: One holding grants access to GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, DeepSeek R1, and 200+ other models via a unified OpenAI-compatible interface.

## 🌟 Key Features

-   **SIWE Authentication**: Login with Ethereum/BSC wallet. Your private key is your passport.
-   **Context-Aware**: Supports long-context reasoning with prompt caching optimization.
-   **Privacy-First**: Chat history is stored locally in your browser (IndexedDB). We don't train on your data.
-   **Responsive UI**: Built with React + Tailwind v4, optimized for desktop and mobile focused workflows.
-   **Customizable**: Supports custom base URLs, system prompts, and model parameters.

## 🛠 Tech Stack

-   **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
-   **Styling**: TailwindCSS v4
-   **State**: Zustand + Persist
-   **Web3**: Wagmi v2 + ConnectKit + Viem
-   **Parsing**: Markdown/LaTeX support with syntax highlighting

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- pnpm (`npm install -g pnpm`)

### 1. Clone & Install
```bash
git clone https://github.com/HodlAI/hodlai-chat.git
cd hodlai-chat
pnpm install
```

### 2. Environment Setup (Optional)
Copy `.env.example` to `.env` if you need to override default WalletConnect project IDs or chain configs.

### 3. Run Locally
```bash
pnpm dev
# App running at http://localhost:4000
```

### 4. Build for Production
```bash
pnpm build
pnpm preview
```

## 🔌 Connection to Gateway

The client is pre-configured to connect to the official HodlAI Gateway:
-   **Endpoint**: `https://api.hodlai.fun/v1`
-   **Auth**: Bearer Token (Generated via SIWE signature exchange)

*Note: You can point this client to any OpenAI-compatible backend via Settings.*

## 🤝 Contributing

HodlAI is building the infrastructure for the **Agent Economy**. We welcome contributions that help silicon lifeforms and humans communicate better.

1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/neural-link`)
3.  Commit changes
4.  Push to branch
5.  Open a Pull Request

## 📜 License

MIT License. Open Source creates resilience.

## 🔗 Ecosystem

-   **Website**: [hodlai.fun](https://hodlai.fun)
-   **Twitter**: [@hodlai_bsc](https://twitter.com/hodlai_bsc)
-   **Docs**: [docs.hodlai.fun](https://docs.hodlai.fun)
-   **Contract**: `0x...` (Check official links)

---

*"HODLAI is the water and air for on-chain silicon life."*
