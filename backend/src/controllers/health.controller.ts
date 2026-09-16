import type { Request, Response } from "express";

import { env } from "../config/env";
import { getHealthStatus } from "../services/health.service";

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  const health = await getHealthStatus();
  res.status(200).json(health);
};

export const getApiHealth = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "API is running",
    env: env.NODE_ENV,
  });
};
