import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const BASE_URL = "https://enneadic-mee-authentically.ngrok-free.dev/api/";

// const BASE_URL = "http://localhost:3000/api/";
// const BASE_URL = "http://192.168.150.33:3000/api";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@layout": "/src/layout",
      "@components": "/src/components",
      "@utils": "/src/utils",
      "@pages": "/src/pages",
      "@common": "/src/common",
      "@routes": "/src/routes",
      "@theme": "/src/theme",
    },
  },
  server: {
    proxy: {
      // "/api": "",
      "/api": {
        target: mode === "development" ? BASE_URL : BASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
}));
