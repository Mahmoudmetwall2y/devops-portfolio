import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { portfolioContentPlugin } from './content/vite.ts';

export default defineConfig(async ({ mode }) => ({
  plugins: [react(), await portfolioContentPlugin({ ...loadEnv(mode, process.cwd(), ''), ...process.env })],
  server: { host: '127.0.0.1', port: 5173 },
  preview: { host: '127.0.0.1', port: 4173 },
}));
