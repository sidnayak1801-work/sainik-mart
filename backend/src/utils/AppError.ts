export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode = 500,
    options?: { isOperational?: boolean; details?: unknown; code?: string },
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = options?.isOperational ?? true;
    this.details = options?.details;
    this.code = options?.code;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
