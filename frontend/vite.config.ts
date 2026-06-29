import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const api = "http://127.0.0.1:8010";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["recharts"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "^/predict$": { target: api, changeOrigin: true },
      "^/analyze$": { target: api, changeOrigin: true },
      "^/scenario$": { target: api, changeOrigin: true },
      "^/chat$": { target: api, changeOrigin: true },
      "/health": { target: api, changeOrigin: true },
    },
  },
});
