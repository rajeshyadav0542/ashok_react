import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
 
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      host: true,
      port: 3000,
      strictPort: false,
      allowedHosts: [
        'dev-pharma-omnichannel.indegene.com',
        'localhost',
        '127.0.0.1'
      ],
      cors: true,
      hmr: {
        host: 'dev-pharma-omnichannel.indegene.com'
      },
    },
    preview: {
      host: true,
      port: 3000, // match dev server port if needed
      strictPort: false,
      allowedHosts: [
        'dev-pharma-omnichannel.indegene.com',
        'localhost',
        '127.0.0.1'
      ],
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});