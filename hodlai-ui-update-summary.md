# HodlAI Website & Chat Update

## Updated Components
- **Website (hodlai.fun)**:
    - New `index.html` with Web3/Dark aesthetic.
    - Updated hero section with dynamic "Hold to Access" messaging.
    - Enhanced Glassmorphism UI cards.
    - Internationalization readiness (English default).
- **Chat App (hodlai-chat)**:
    - Updated `src/index.css` with Tailwind v4 theme variables for deep black/violet palette.
    - Updated `src/pages/Chat.tsx` with:
        - Modern GlassPanel UI.
        - Improved Mobile Sidebar.
        - Enhanced CodeBlock rendering (ChatGPT-style).
        - Integrated Wallet Connect stats in Settings.
        - Smart Model Selector (Bottom & Top).

## Instructions for Deployment
1. **Website**: Deploy `hodlai-official/hodlai.fun` to production server relative path.
2. **Chat**: Run `pnpm build` in `hodlai-chat/` and deploy `dist/`.

## Review Notes
- **Visuals**: Dark mode is now native and default.
- **Performance**: Tailwind optimized.
- **UX**: Added touch feedback and smooth transitions.
