import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { UserConfig, ServerOptions } from 'vite';

const port = process.env.PORT ? parseInt(process.env.PORT) : undefined;
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5191';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/api/chat/stream': {
        target: backendUrl,
        ws: true,
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'build'
  }
} as UserConfig);