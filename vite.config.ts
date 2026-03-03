
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [],
  resolve: {
    alias: {
      "@": "./src",
    },
  },
}));
