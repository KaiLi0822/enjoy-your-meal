import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Remove HTTPS since Nginx handles it
  },
  build: {
    minify: "terser", // Use Terser for advanced minification
    terserOptions: {
      compress: {
        drop_console: true, // Removes console.log()
        drop_debugger: true, // Removes debugger statements
      },
    },
  },
});
