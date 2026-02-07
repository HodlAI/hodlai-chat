# 2026-02-01 Session Summary

## Technical Stack
- **Architecture**: OpenClaw (Self-hosted).
- **Underlying API Gateway**: **New API** (https://github.com/QuantumNous/new-api).
    - **Protocol Support**:
        - OpenAI Compatible (`/v1/chat/completions`) - **Recommended/Primary**.
        - Claude Native (`/v1/messages`) - Supported.
        - **Gemini Native**: **SUPPORTED** (`/v1beta/models/...`). Verified via POST 401 response. Users can use Google Vertex/Gemini SDK.
- **Model Strategy**: 
    - Chat/Routing: `gemini-3-flash-preview` (Cost-effective).
    - Complex Tasks: `gemini-3-pro-preview`.

## Project Status (HodlAI)
- **Token**: $HODLAI (BSC).
- **Core Logic**: "Holding is Access" (Tax 3% -> API Treasury). 
- **Treasury**: ~$100k+ (Rapid growth confirmed).
- **Traffic**: High on-chain volume ($550k/24h).
- **User Feedback**:
    - "API 消耗快" (Opus is expensive, users notice).
    - "价格波动" (Swing traders active, but diamond hands forming).
    - "Transparency" (Users like the 0% team tax / visible treasury).

## Moderation
- **Policy**: Zero tolerance for "Selling API", "Scam Tokens", "Private DM solicitations".
- **Action**: Auto-delete active.
- **Unban Process**: Bot cannot unban. Escalate `User ID` to Ti via private message (or tag in group if urgent).

## Verified Links
- **Flap**: https://flap.sh/bnb/board (HodlAI listed? TBD).
- **Ave.ai**: SPA/Cloudflare protected, difficult to scrape. Use DexScreener for data.
- **New API**: Core backend.

## Known Issues
- **Headless Chrome**: Installed but struggling with dynamic SPA hydration (Ave.ai/Flap).
- **Gemini Native**: Earlier hallucination corrected. **Use OpenAI SDK for Gemini models**.
