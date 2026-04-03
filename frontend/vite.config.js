import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const LOCAL_BACKEND_ORIGIN = 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: LOCAL_BACKEND_ORIGIN,
        changeOrigin: true,
      },
    },
  },
});
