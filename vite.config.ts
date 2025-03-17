import path from "path";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({
      routesDirectory: "./src/pages", // 修改路由目录为 pages
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  publicDir: "public",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          jsonWorker: ["monaco-editor/esm/vs/language/json/json.worker"],
          cssWorker: ["monaco-editor/esm/vs/language/css/css.worker"],
          htmlWorker: ["monaco-editor/esm/vs/language/html/html.worker"],
          tsWorker: ["monaco-editor/esm/vs/language/typescript/ts.worker"],
          editorWorker: ["monaco-editor/esm/vs/editor/editor.worker"],
        },
      },
    },
  },
});
