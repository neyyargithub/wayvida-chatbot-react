import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import path from "path";
export default defineConfig({
  plugins: [react()],
  publicDir: "public", // Ensure Vite serves public/ correctly
  build: {
    outDir: "react-app", // Ensures build files go inside the plugin
    assetsDir: "assets", // Ensures assets are inside "react-app/assets"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: "./",
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  }
})