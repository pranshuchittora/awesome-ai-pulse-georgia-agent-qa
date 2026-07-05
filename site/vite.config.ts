import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project Pages is served from /<repo>/, so assets must be base-prefixed.
export default defineConfig({
  base: "/awesome-ai-pulse-georgia/",
  plugins: [react()],
  build: { target: "es2020", sourcemap: false },
});
