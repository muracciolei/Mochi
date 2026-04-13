import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2015',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          llm: ['./src/llm/WebLLMModule.js']
        }
      }
    },
    copyPublicDir: true
  },
  server: {
    port: 3000,
    host: true
  },
  publicDir: 'public'
});
