import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

const envPath = path.resolve(process.cwd(), ".env");
loadEnv({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("15m"),
  CORS_ORIGIN: z.string().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse({
  ...process.env,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? process.env.JWT_EXPIRES_IN ?? "15m",
  CORS_ORIGIN: process.env.CORS_ORIGIN || undefined,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || undefined,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || undefined,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || undefined,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  const hint = existsSync(envPath)
    ? ""
    : " Missing .env file. Copy .env.example to .env and fill in the values.";
  throw new Error(`Invalid environment variables: ${details}.${hint}`);
}

export const env = parsed.data;
