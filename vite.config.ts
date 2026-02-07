import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  server: {
    port: 4000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port: 4000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ['process', 'buffer', 'util', 'stream', 'zlib', 'events'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  define: {
    'process.env': {},
    // global: 'globalThis', // Handled by nodePolyfills
  }
});
