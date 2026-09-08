import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./utils/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Sainik-mart API listening on http://localhost:${env.PORT}`);
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received. Shutting down...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(0);
    }
  });
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
