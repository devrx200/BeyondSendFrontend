import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/hesite',
  server: {
    port: 5175,
    strictPort: true,
  },
  build: {
    // Increase chunk size warning limit to 3000 KB (main app bundle is ~2.8 MB)
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'bootstrap-vendor': ['reactstrap', 'bootstrap'],
          'editor-vendor': ['react-quill'],
          'icons-vendor': ['react-icons'],
          'utils-vendor': ['axios', 'sweetalert2'],
        },
      },
    },
  },
})
