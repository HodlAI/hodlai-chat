import { createConfig, http } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';

export const config = createConfig(
  getDefaultConfig({
    // Your dApp's chains
    chains: [bsc],
    transports: {
      [bsc.id]: http(),
    },

    // Required API Keys
    walletConnectProjectId: "2d17c76cc782299c5f886f7803604f21", // Using a public one or need to create new? Using placeholder for now.

    // Required App Info
    appName: "HodlAI",

    // Optional App Info
    appDescription: "Hold $HODLAI to use premium AI models for free.",
    appUrl: "https://hodlai.fun",
    appIcon: "https://hodlai.fun/logo.jpg",
  }),
);
