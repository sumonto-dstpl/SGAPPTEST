import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Tauri dev server settings
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Don't trigger Vite rebuilds for Rust source changes
      ignored: ['**/src-tauri/**'],
    },
  },

  // Exclude lucide-react from pre-bundling (uses ESM)
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  // Make env vars available to the frontend
  envPrefix: ['VITE_', 'TAURI_'],

  build: {
    // Tauri supports ES module imports; use modern target for smaller bundle
    target: ['es2021', 'chrome105', 'safari13'],
    // Don't minify for better debug experience; Tauri handles its own release build
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
