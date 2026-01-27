
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Defines process.env to avoid "process is not defined" error in browser
    'process.env': process.env
  },
  server: {
    port: 3000,
  },
});
