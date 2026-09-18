import { createApp } from "./app";
import { prisma } from "./config/database";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const app = createApp();

const server = app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`Sainik-mart API listening on http://0.0.0.0:${env.PORT}`);
});

const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down...`);
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
