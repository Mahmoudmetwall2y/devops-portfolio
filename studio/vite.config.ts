import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, fileURLToPath(new URL('../', import.meta.url)), ''), ...process.env };
  return { plugins: [react()], base: '/admin/', define: { __SANITY_PROJECT_ID__: JSON.stringify(env.SANITY_PROJECT_ID ?? ''), __SANITY_DATASET__: JSON.stringify(env.SANITY_DATASET ?? 'production') }, build: { outDir: '../dist/admin', emptyOutDir: false }, server: { fs: { allow: ['..'] } } };
});
