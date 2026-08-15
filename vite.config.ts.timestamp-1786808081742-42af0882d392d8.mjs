// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  // Tauri dev server settings
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Don't trigger Vite rebuilds for Rust source changes
      ignored: ["**/src-tauri/**"]
    }
  },
  // Exclude lucide-react from pre-bundling (uses ESM)
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  // Make env vars available to the frontend
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports ES module imports; use modern target for smaller bundle
    target: ["es2021", "chrome105", "safari13"],
    // Don't minify for better debug experience; Tauri handles its own release build
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG5cbiAgLy8gVGF1cmkgZGV2IHNlcnZlciBzZXR0aW5nc1xuICBjbGVhclNjcmVlbjogZmFsc2UsXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDE0MjAsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICB3YXRjaDoge1xuICAgICAgLy8gRG9uJ3QgdHJpZ2dlciBWaXRlIHJlYnVpbGRzIGZvciBSdXN0IHNvdXJjZSBjaGFuZ2VzXG4gICAgICBpZ25vcmVkOiBbJyoqL3NyYy10YXVyaS8qKiddLFxuICAgIH0sXG4gIH0sXG5cbiAgLy8gRXhjbHVkZSBsdWNpZGUtcmVhY3QgZnJvbSBwcmUtYnVuZGxpbmcgKHVzZXMgRVNNKVxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxuXG4gIC8vIE1ha2UgZW52IHZhcnMgYXZhaWxhYmxlIHRvIHRoZSBmcm9udGVuZFxuICBlbnZQcmVmaXg6IFsnVklURV8nLCAnVEFVUklfJ10sXG5cbiAgYnVpbGQ6IHtcbiAgICAvLyBUYXVyaSBzdXBwb3J0cyBFUyBtb2R1bGUgaW1wb3J0czsgdXNlIG1vZGVybiB0YXJnZXQgZm9yIHNtYWxsZXIgYnVuZGxlXG4gICAgdGFyZ2V0OiBbJ2VzMjAyMScsICdjaHJvbWUxMDUnLCAnc2FmYXJpMTMnXSxcbiAgICAvLyBEb24ndCBtaW5pZnkgZm9yIGJldHRlciBkZWJ1ZyBleHBlcmllbmNlOyBUYXVyaSBoYW5kbGVzIGl0cyBvd24gcmVsZWFzZSBidWlsZFxuICAgIG1pbmlmeTogIXByb2Nlc3MuZW52LlRBVVJJX0RFQlVHID8gJ2VzYnVpbGQnIDogZmFsc2UsXG4gICAgc291cmNlbWFwOiAhIXByb2Nlc3MuZW52LlRBVVJJX0RFQlVHLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUE7QUFBQSxFQUdqQixhQUFhO0FBQUEsRUFDYixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixPQUFPO0FBQUE7QUFBQSxNQUVMLFNBQVMsQ0FBQyxpQkFBaUI7QUFBQSxJQUM3QjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUFBO0FBQUEsRUFHQSxXQUFXLENBQUMsU0FBUyxRQUFRO0FBQUEsRUFFN0IsT0FBTztBQUFBO0FBQUEsSUFFTCxRQUFRLENBQUMsVUFBVSxhQUFhLFVBQVU7QUFBQTtBQUFBLElBRTFDLFFBQVEsQ0FBQyxRQUFRLElBQUksY0FBYyxZQUFZO0FBQUEsSUFDL0MsV0FBVyxDQUFDLENBQUMsUUFBUSxJQUFJO0FBQUEsRUFDM0I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
