import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/illusion-of-understanding-project/' : '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
