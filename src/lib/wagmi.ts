import { 
  createConfig, 
  http,
  cookieStorage,
  createStorage
} from 'wagmi'
import { bsc } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'
import { injected } from 'wagmi/connectors'
import { getDefaultConfig } from 'connectkit'

const projectId = "b460d24f7aaa1a403ad76a3f16cb8bea";

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
    // Explicit connectors for stability
    connectors: [
      injected(),
      walletConnect({ projectId, showQrModal: false }), // showQrModal: false is KEY for ConnectKit (it handles UI)
    ],

    // Required API Keys
    walletConnectProjectId: projectId,

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