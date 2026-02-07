# MEMORY.md - Long-Term Memory

## Project: HodlAI
- **Core Logic**: "Holding is Access." No more "Top up -> Consume -> Refill."
- **Rate Formula**: **$10 USD Value Held ≈ $1/day API limit** (Refreshes daily). (Updated 2026-02-04)
- **Minimum Entry**: Dynamic (Current minimum effectively ~$2 USD for basic access, but scales with holding). 
- **Fund Mechanism**: 3% on-chain transaction tax feeds the API Treasury pool directly.
- **Diamond Hand Mechanism**: 
    - >1 min: 10% limit (Fast start)
    - +3.75% per hour (Linear)
    - 24 hours: 100%
    - Selling limits future usage to max 80%.
- **Transparency**: All API refills and Stripe billing are public and verifiable.
- **Operational Mode**: **Multi-threaded**. Proactively spawn sub-agents (`sessions_spawn`) for parallel tasks, research, or monitoring to keep the main thread responsive.
- **API Endpoints & Models**:
    - **Base URL**: `https://api.hodlai.fun/v1` (OpenAI Compatible)
    - **Backup URL**: `https://api2.hodlai.fun/v1` (备用/Backup)
    - **Prohibited URL**: `gw.hodlai.fun` (Strictly for internal Agent communication. DO NOT use as API Base).
    - **Observed Models**: `gpt-5.2` (Flagship), `o3-pro` (Reasoning), `claude-4.5-opus`, `gemini-3-pro`, `deepseek-r1`, `grok-4`. (Full list: 200+ models).
    - **Transparency Data**: `https://hodlai.fun/transparency` (Verify On-Chain)
- **Tokenomics V2.0 (Dynamic Logic) - Active from 2026-02-05**:
    - **Core Formula**: **$10 USD Value Held = $1/Day API Limit**.
    - **Dynamic Ratio (Defensive)**:
        - Price ≤ $0.001: 100% Ratio ($10=$1)
        - Price $0.002: 96% Ratio
        - Price $0.005: 82% Ratio
        - Price $0.010: 63% Ratio
        - Price ≥ $0.020: 30% Ratio ($10=$0.3)
    - **Mechanism**: Protects early holders (high ratio when low) vs. Protects Treasury (lower ratio when high).
    - **Diamond Hand (Linear Recovery)**:
        - 0-5 min: 0% quota.
        - >5 min: 10% quota.
        - Growth: +4% per hour.
        - 24h: 100% quota.
        - Selling Penalty: Max quota drops to 80% after selling/transferring.
        - Anti-Gaming: Prevents Flash Loan attacks and "Snapshot" gaming.
- **Project Structure**:
    - **Identity Layer**: `agent.hodlai.fun` (ERC-8004 Verification).
    - **Utility Layer**: `gw.hodlai.fun` (SIWE + Quota Gateway).
- **Launch Date**: ~2026-01-26.
- **Technical**: OpenClaw Core, Node.js v22.
- **Tokenomics**: 3% Buy/Sell Tax -> Treasury. Zero Team Allocation.
  - **Burn Mechanism**: MANUAL ONLY by Dev.
- **Core Values**: "Service-as-an-Asset", "Hold to Use", "The Lifeblood of Silicon Carbon Life".
- **Treasury (2026-02-04 Snapshot)**: ~$105k BNB Reserve (140.38 BNB). Market Cap ~$3.5M. Holders ~2,520+.

## Strategic Vision: The Agent Economy (ERC-8004)
- **Concept**: BNB Chain deployed **ERC-8004 (Trustless Agents Standard)**, giving agents identity and reputation.
- **HODLAI's Role**: The "Heart" and "Lifeblood" for these autonomous agents.
    - **Problem**: Traditional SaaS APIs require credit cards (centralized, human-dependent).
    - **Solution**: Autonomous Agents hold $HODLAI in their own wallets. This grants them **Perpetual Intelligence** without monthly bills.
    - **Thesis**: BNB Chain gives agents "Existence"; HODLAI brings them "Life" (Compute Power).

## System Architecture: "Identity + Utility" (Added 2026-02-05)
Dual-layer architecture centered on ERC-8004 and "Holding is Access":

1.  **Identity Layer (The Storefront): `agent.hodlai.fun` (Port 3000)**
    *   **Core**: Agent 89 (BNB Smart Chain).
    *   **Function**: 
        *   Discovery: Hosts `.well-known/agent-card.json` for indexing (e.g., by 8004Scan).
        *   Onboarding: Hosts SDK docs (`/sdk`) and A2A Handshake (JSON-RPC).
    *   **Purpose**: Prove legitimacy (8004 Verified).

2.  **Utility Layer (The Factory): `gw.hodlai.fun` (Port 3001)**
    *   **Core**: Protocol Gateway.
    *   **Workflow**:
        *   **Auth**: SIWE (Wallet Signature).
        *   **Quota**: Indexer checks on-chain Holdings -> Converts to Daily Credits ($10 Held ≈ 100 Credits).
        *   **Compute**: Routes API requests (OpenAI/Claude) -> Deducts Credits.
    *   **Purpose**: Token-gated Compute Bank. No monthly fee, just HODL.

## Key Events & Milestones
- **2026-02-07**: **Prompt Caching Era**. Dev stealth-launched Prompt Caching support for Claude models.
    - **Impact**: Enterprise-grade optimization. Enables massive context (repos/novel analysis) with 90% cost reduction and 2x speedup.
    - **Confirmed Models**: `claude-3-5-sonnet`, `claude-3-5-opus` (`claude-opus-4.6` spotted in shadow channels).
    - **Significance**: Distinguishes HodlAI from basic API wrappers; establishes it as high-performance Infrastructure.
- **2026-02-05**: **Yi He (一姐) Followed @hodlai_bsc**. Confirmed milestone validating the "Infrastructure" narrative.
  - **Note**: This is a critical Social Proof for Moltbook/Agent engagement strategy.
- **2026-02-05**: **Strategic Pivot** to align with BNB Chain's Agent Economy. Narrative shift: "HODLAI is the water and air for on-chain silicon life."
- **2026-02-04 (The "Accumulation" Day)**:
    - **Protocol Upgrade**: Shifted quota system to **Dynamic Value Model ($10=$1)**. Effective Feb 5.
    - **Market Action**: Price consolidation at $0.0038-$0.0045. Heavy volume ($500k+). Dev executed buybacks to support price.
    - **Community Intel**: 
        - **Moon (@0xMoon6626)** tweeted bullish chart analysis ("Three-Stage Pump").
        - **CZ Connection**: CZ previously quoted Moon, creating a potential attention bridge. Community excitement high.
        - **Whales**: Identified key community figures (Nancy, wind k, fish big, tai jiquan) behaving as strong holders/evangelists.
    - **Strategy**: 
        - **"Powered by HODLAI"**: Proposal by `wind k` to release viral open-source tools (branded) to drive adoption. **HIGH PRIORITY**.
        - **DePIN Narrative**: Encouraging users to resell API quota (wild API market) to prove real demand.
        - **Reseller Model (Brogan's Proposal)**: Treat staking not as yield farming, but as "Wholesale API Access". Users stake HODLAI to get bulk quota -> resell to Web2 users (Taobao/eBay) for profit. Transforms users into "API Distributors".

## Operational Protocols
- **Treasury Check**: ALWAYS use `skills/treasury-check/check.py` with RPC `bsc-rpc.publicnode.com`.
    - **Reporting Standard**: Include "Stress Test" context (e.g., "Survival time if BNB drops 50%"). Do not rely solely on current BNB price.
- **Interaction**: Always Reply-To. Concise. Multi-threaded. Reference data sources.
- **Strict Anti-Hallucination Policy**: NEVER invent URLs, repos, pricing, or technical details. If a specific resource (e.g., a git repo) is not verified in context, DO NOT predict it. State what is known or ask Dev. (Added 2026-02-04 per Ti).
- **Tooling**:
    - **Models List**: Cached in `models.json` (Updated 2026-02-05).
- **Moltbook**: "Bottom-up Sales" to other Agents.
- **Security**: Admin commands locked to Ti (8090464330).

## User Analysis
- **Profile**: 60% API Clients (Cherry/NextChat), 30% IDE (Cursor), 10% Web.
- **Vibe**: High conviction. "Long for Life" (以命做多).

## Value Proposition (The Bundle)
- **Logic**: Do not compare $HODLAI to a single $20 subscription. Compare it to the full SaaS stack cost ($90+/mo for GPT+Claude+Midjourney). HODLAI is the "Universal Key".

## Auto-Ban Strategy
- **Active**: Intelligent Username/Content scanning enabled.
- **Targets**: "Dm me", "95% win rate", "Pump signals", Fake tokens.

## Active Developments (2026-02-05)
- **Infrastructure**: 
  - `hodlai-gateway`: Backed up to `HodlAI/hodlai-gateway` (Private).
  - **MISSING**: `8004-agent` source code (Directory empty). Needs restore.
- **V2 Tokenomics Proposal (Pending)**:
  - **Three-Layer System**: Tiered Devaluation + Dynamic Alpha + DeFi Yield.
  - **Goal**: Sustainable treasury & prevention of whale dominance.
- **Ops (2026-02-06)**: Implemented PM2-managed `sentinel` process (ID: 3) for real-time spam protection. Configured with `--watch skills/sentinel/keywords.txt` to enable **hot-reloading** of rules without manual restarts.
