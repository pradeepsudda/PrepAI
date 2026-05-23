import { defineConfig, loadEnv } from 'vite' 
import react from '@vitejs/plugin-react'
import path  from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const backendUrl = env.VITE_API_BASE_URL;

  return {
    plugins: [react()],
    define: {
      global: 'globalThis',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target:       backendUrl,  
          changeOrigin: true,
        },
        '/ws': {
          target:       backendUrl, 
          ws:           true,
          changeOrigin: true,
        },
      },
    },
  }
})