# HodlAI Chat 🤖💎

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Twitter Follow](https://img.shields.io/twitter/follow/hodlai_bsc?style=social)](https://twitter.com/hodlai_bsc)

**The official decentralized chat interface for the HodlAI Protocol.**

> "Don't rent intelligence. Own the asset that generates it."

HodlAI Chat is a Web3-native AI interface that connects directly to the HodlAI Gateway. Instead of monthly subscriptions, it uses on-chain verification to grant compute access based on your $HODLAI holdings.

This repository hosts the **Frontend Client** (React + Vite). It is fully open-source, allowing the community to audit, fork, and build upon the "Service-as-an-Asset" interface.

## 🌟 Features

- **Web3 Auth**: Connect via WalletConnect/MetaMask (SIWE Standard).
- **Hold-to-Chat**: Zero passwords. Your $HODLAI balance is your API key.
- **Privacy First**: Local session storage. No centralized tracking.
- **Multi-Model**: Access GPT-4, Claude 3.5, Gemini 1.5, DeepSeek R1 via the unified gateway.
- **DeCensor Ready**: Configurable API endpoints for censorship resistance.

## 🛠 Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **UI System**: TailwindCSS v4 + Heroicons
- **State Management**: Zustand
- **Web3 Interaction**: Wagmi + Viem + ConnectKit
- **Internationalization**: Full English/Simplified Chinese support.

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

### 2. Run Locally
```bash
pnpm dev
# App running at http://localhost:4000
```

## 🔌 Configuration

The client connects to `https://api.hodlai.fun/v1` by default.

**Custom Gateway (Settings):**
You can point this client to your own gateway or a local proxy via **Settings -> Custom Base URL**.

**URL Parameters:**
For quick testing or deep-linking:
`http://localhost:4000/?base_url=https://my-gateway.com/v1`

## 🤝 Contributing

We believe in **Sovereign AI**.
PRs are welcome! Whether it's a UI polish, a new language translation, or a Web3 integration fix.

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit changes (`git commit -m 'feat: add amazing feature'`).
4. Push to branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🔗 Links

- **Website**: [hodlai.fun](https://hodlai.fun)
- **Docs**: [docs.hodlai.fun](https://docs.hodlai.fun)
- **Twitter**: [@hodlai_bsc](https://twitter.com/hodlai_bsc)

---

*Built with 💎 by the HodlAI Community.*
