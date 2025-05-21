import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "path";

export default defineConfig(({ command }) => ({
  root: "src/frontend",
  build: {
    outDir: "../../dist",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: command === "build" ? [react(), cloudflare()] : [react()],
}));
