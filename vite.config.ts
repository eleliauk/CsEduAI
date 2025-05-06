import path from "path";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "./", // 确保资源使用相对路径
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
        manualChunks: (id) => {
          if (id.includes('node_modules/monaco-editor')) {
            if (id.includes('/esm/vs/editor/editor.worker')) {
              return 'monaco-editor-worker';
            }
            if (id.includes('/esm/vs/language/json/json.worker')) {
              return 'monaco-json-worker';
            }
            if (id.includes('/esm/vs/language/css/css.worker')) {
              return 'monaco-css-worker';
            }
            if (id.includes('/esm/vs/language/html/html.worker')) {
              return 'monaco-html-worker';
            }
            if (id.includes('/esm/vs/language/typescript/ts.worker')) {
              return 'monaco-ts-worker';
            }
            return 'monaco-editor';
          }
        }
      }
    }
  },
});
