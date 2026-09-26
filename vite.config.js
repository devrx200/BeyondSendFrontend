import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    __SERVER_FORWARD_CONSOLE__: false,
  },
  base: "/",
  server: {
    host: true,
    port: 5175,
    strictPort: true,
    forwardConsole: false,
    hmr: {
      overlay: false,
    },
  },
  esbuild: {
    target: "es2020",
    legalComments: "none",
  },
  build: {
    target: "es2020",
    emptyOutDir: false,
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-icons") || id.includes("bootstrap-icons")) {
              return "icons-vendor";
            }
            if (id.includes("jodit-react")) {
              return "editor-vendor";
            }
            if (
              id.includes("reactstrap") ||
              id.includes("bootstrap") ||
              id.includes("sweetalert2") ||
              id.includes("swiper")
            ) {
              return "ui-vendor";
            }
            if (
              id.includes("react-pdf") ||
              id.includes("pdfjs-dist") ||
              id.includes("@smazeeapps/file-viewer") ||
              id.includes("docx-preview") ||
              id.includes("pptx-viewer") ||
              id.includes("xlsx")
            ) {
              return "viewer-vendor";
            }
            if (id.includes("axios") || id.includes("jwt-decode")) {
              return "utils-vendor";
            }
          }
        },
      },
    },
  },
});