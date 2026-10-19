import { defineCliConfig } from 'sanity/cli';
import { loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
const env = { ...loadEnv('development', fileURLToPath(new URL('../', import.meta.url)), ''), ...process.env };
export default defineCliConfig({ api: { projectId: env.SANITY_PROJECT_ID, dataset: env.SANITY_DATASET ?? 'production' } });
