import { prisma } from "../utils/prisma";

export type HealthStatus = {
  status: "ok";
  db: "up" | "down";
  timestamp: string;
};

export const getHealthStatus = async (): Promise<HealthStatus> => {
  let db: "up" | "down" = "down";

  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "up";
  } catch {
    // keep db as "down"
  }

  return {
    status: "ok",
    db,
    timestamp: new Date().toISOString(),
  };
};
