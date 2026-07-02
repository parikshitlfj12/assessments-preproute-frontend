import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // The staging backend's CORS allowlist includes http://localhost:3000,
    // so we pin the dev server to that port to avoid CORS failures.
    port: 3000,
    strictPort: true,
    open: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
});
