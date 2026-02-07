/**
 * Frontend Configuration
 */

export const config = {
  // API URL - Change this to your Zeabur deployment URL in production
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // BSC Chain Info
  BSC_CHAIN_ID: 56,
  
  // Storage Keys
  STORAGE_KEYS: {
    WALLET_ADDRESS: 'bsc_ai_hub_address',
    AUTH_TOKEN: 'bsc_ai_hub_token',
  },
  
  // Default Settings
  DEFAULT_CUSTOM_BASE_URL: 'https://api.hodlai.fun/v1',
};
