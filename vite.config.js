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
    port: 5175,
    strictPort: true,
  },

  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "bootstrap-vendor": ["reactstrap", "bootstrap"],
          "editor-vendor": ["react-quill"],
          "icons-vendor": ["react-icons"],
          "utils-vendor": ["axios", "sweetalert2"],
        },
      },
    },
  },
});