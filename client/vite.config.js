import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/admonliliysusazoncompleta/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://admonliliysusazoncompleta-production.up.railway.app',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://admonliliysusazoncompleta-production.up.railway.app',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: { '@': '/src' },
  }
});