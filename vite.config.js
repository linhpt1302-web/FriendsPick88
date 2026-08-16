import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths so assets load correctly on any subpath or domain
  server: {
    port: 3000,
    open: true
  }
});
