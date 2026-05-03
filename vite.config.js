import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
    allowedHosts: true,
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    }
  },
  optimizeDeps: {
    include: ['buffer', 'bs58'],
    esbuildOptions: {
      target: 'esnext',
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [],
    }
  }
})
