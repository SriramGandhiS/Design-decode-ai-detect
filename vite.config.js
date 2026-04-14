import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/ai-api': {
        target: 'https://api.aiornot.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    minify: 'terser'
  }
});
