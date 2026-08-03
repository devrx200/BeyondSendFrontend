import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const BUILD_TIMESTAMP = new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(BUILD_TIMESTAMP),
  },
  base: "/",
  server: {
    host: true,
    port: 5175,
    strictPort: true,
  },
  esbuild: {
    target: "es2020",
    legalComments: "none",
    logOverride: { "this-is-undefined-in-esm": "silent" },
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
            if (id.includes("react-icons") || id.includes("lucide-react") || id.includes("bootstrap-icons")) {
              return "icons-vendor";
            }
            if (id.includes("react-quill") || id.includes("jodit-react") || id.includes("tinymce") || id.includes("ckeditor5")) {
              return "editor-vendor";
            }
            if (id.includes("reactstrap") || id.includes("bootstrap") || id.includes("sweetalert2") || id.includes("swiper")) {
              return "ui-vendor";
            }
            if (id.includes("react-pdf") || id.includes("pdfjs-dist") || id.includes("@smazeeapps/file-viewer")) {
              return "pdf-vendor";
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