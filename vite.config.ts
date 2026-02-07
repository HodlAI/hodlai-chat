import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
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
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          process: "process/browser",
          stream: "stream-browserify",
          zlib: "browserify-zlib",
          util: "util",
        }
      },
      define: {
        'process.env': {},
        global: 'globalThis',
      }
    };
});
