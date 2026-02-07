# Tokenomics V2.0 (Dynamic Quota Protocol)

**Status**: Active (Effective Feb 5, 2026)
**Core Philosophy**: "Yield follows Revenue" (API 产出率跟随协议收入/风险动态调整).

## 1. The Adaptive Anchor (自适应锚定)
- **Concept**: The quota ratio ($10 Held = $X Quota) is NOT fixed. It is a variable function of **Treasury Health** and **Token Stability**.
- **Current Anchor (Bootstrapping Phase)**:
  - **Ratio**: `$10 Held = $1 Quota / Day` (Daily Yield ≈ 10%).
  - **Purpose**: Extremely high substrate yield to attract early adopters/builders and subsidize "Proof of Utility".

## 2. Dynamic Adjustment Logic (Risk Control)
- **Bear Market / Low Volume (Current)**:
  - Action: **Increase Ratio** (e.g., maintain $10=$1).
  - Why: Compensate holders for price volatility risk. Keep the "Utility Floor" high.
- **Bull Market / High Volume**:
  - Action: **Normalize Ratio** (e.g., $10=$0.5 or $10=$0.1).
  - Why:
    1. Prevent treasury depletion by arbitrageurs (if price 10x, static quota would drain treasury 10x faster).
    2. Maintain sustainability when speculation drives price > utility value.
- **Goal**:
  - Keep the *real dollar value* of API Utility stable-ish, regardless of token price volatility.

## 3. Future Scaling (Revenue Based)
- If Daily Tax Revenue > Daily API Cost:
  - **Protocol Dividend Action**: INCREASE Ratio (e.g., $10=$2).
  - Treat API Quota as a "Shareholder Dividend" payed in Compute Credits.

*Archived by instruction from user Brogan.*
