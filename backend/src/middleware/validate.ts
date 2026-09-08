import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

import { AppError } from "../utils/AppError";

type RequestValidationTarget = "body" | "query" | "params";

export const validate =
  (schema: ZodTypeAny, target: RequestValidationTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(
        new AppError("Validation failed", 400, {
          details: result.error.flatten(),
        }),
      );
      return;
    }

    req[target] = result.data;
    next();
  };
