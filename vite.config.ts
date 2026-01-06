import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  console.log('--- Vite Config Debug ---');
  console.log('Mode:', mode);
  console.log('VITE_SUPABASE_URL in env:', env.VITE_SUPABASE_URL ? 'Loaded' : 'NOT FOUND');
  console.log('VITE_SUPABASE_ANON_KEY in env:', env.VITE_SUPABASE_ANON_KEY ? 'Loaded' : 'NOT FOUND');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
