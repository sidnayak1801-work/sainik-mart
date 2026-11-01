import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: false,
  },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: false,
  },
});
