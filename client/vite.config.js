/* // ── POST /api/auth/login desarrollo local ─────────────────────────────────────────────
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/admonliliysusazoncompleta/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // ← desarrollo local
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',  // ← desarrollo local
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: { '@': '/src' },
  },
});
*/


// ── POST /api/auth/login producción ─────────────────────────────────────────────────────
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