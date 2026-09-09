import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * The app always calls /api on its own origin, and something in front forwards
 * it to the backend: these proxies locally, a Vercel rewrite in production.
 *
 * That keeps the API's hostname out of the browser entirely, which matters
 * because some mobile networks fail to resolve the Railway domain. It also
 * makes every request same-origin, so CORS never applies to a visitor.
 */
const apiProxy = {
  "/api": {
    target: "http://localhost:5000",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 3000,
    strictPort: true,
    proxy: apiProxy,
  },

  preview: {
    port: 4173,
    strictPort: true,
    proxy: apiProxy,
  },
});
