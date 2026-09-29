import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development the API runs separately on :8000 (see `npm run dev`);
    // proxying keeps the client on a single origin in both modes.
    proxy: {
      '/generate-excuse': 'http://localhost:8000',
    },
  },
});
