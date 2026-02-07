import { 
  createConfig, 
  http,
  cookieStorage,
  createStorage
} from 'wagmi'
import { bsc } from 'wagmi/chains'
import { getDefaultConfig } from 'connectkit'

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [bsc],
    transports: {
      // RPC URL for each chain
      [bsc.id]: http(
        `https://bsc-dataseed.binance.org/`,
      ),
    },

    // Required API Keys
    walletConnectProjectId: "354b3211566444855363456345332", // Placeholder, replace with env if needed

    // Required App Info
    appName: "HodlAI Chat",

    // Optional App Info
    appDescription: "Hold to Chat",
    appUrl: "https://ai.hodlai.fun",
    appIcon: "https://ai.hodlai.fun/logo.svg",
    
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
  }),
)