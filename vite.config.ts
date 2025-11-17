import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

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
      "/api": {
        target:
          mode === "development"
            ? "https://enneadic-mee-authentically.ngrok-free.dev/api/"
            : "https://enneadic-mee-authentically.ngrok-free.dev/api/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
}));
