import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";

const firebaseWebConfigPlugin = (mode: string): Plugin => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const source = JSON.stringify({
    apiKey: env.VITE_FIREBASE_API_KEY?.trim() ?? "",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? "",
    projectId: env.VITE_FIREBASE_PROJECT_ID?.trim() ?? "",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "",
    appId: env.VITE_FIREBASE_APP_ID?.trim() ?? "",
  });

  return {
    name: "firebase-web-config",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== "/firebase-web-config.json") {
          next();
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.end(source);
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "firebase-web-config.json",
        source,
      });
    },
  };
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), firebaseWebConfigPlugin(mode)],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    restoreMocks: true,
  },
}));
