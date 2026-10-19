import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

const envPath = path.resolve(process.cwd(), ".env");
loadEnv({ path: envPath });

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
    JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("7d"),
    CORS_ORIGIN: z.string().min(1).optional(),
    CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_API_SECRET: z.string().min(1).optional(),
    RAZORPAY_KEY_ID: z.string().min(1).optional(),
    RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
    FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    FIREBASE_CLIENT_EMAIL: z.string().min(1).optional(),
    FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
    OTP_PROVIDER: z.enum(["msg91", "mock"]).default("mock"),
    OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(6),
    OTP_EXPIRY_MINUTES: z.coerce.number().int().positive().default(5),
    OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(30),
    OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
    OTP_MAX_REQUESTS_PER_HOUR: z.coerce.number().int().positive().default(5),
    OTP_HMAC_SECRET: z.string().min(1).optional(),
    MSG91_AUTH_KEY: z.string().min(1).optional(),
    MSG91_TEMPLATE_ID: z.string().min(1).optional(),
    MSG91_SENDER_ID: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production" && data.OTP_PROVIDER === "mock") {
      ctx.addIssue({
        code: "custom",
        path: ["OTP_PROVIDER"],
        message: "mock OTP provider is not allowed in production",
      });
    }
    if (data.OTP_PROVIDER === "msg91" && !data.MSG91_AUTH_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["MSG91_AUTH_KEY"],
        message: "MSG91_AUTH_KEY is required when OTP_PROVIDER=msg91",
      });
    }
  });

const parsed = envSchema.safeParse({
  ...process.env,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? process.env.JWT_EXPIRES_IN ?? "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || undefined,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || undefined,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || undefined,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || undefined,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_API_KEY || undefined,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || undefined,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || undefined,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || undefined,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || undefined,
  OTP_PROVIDER: process.env.OTP_PROVIDER || undefined,
  OTP_HMAC_SECRET: process.env.OTP_HMAC_SECRET || undefined,
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY || undefined,
  MSG91_TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID || undefined,
  MSG91_SENDER_ID: process.env.MSG91_SENDER_ID || undefined,
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

const assertDatabaseUrl = (url: string): void => {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(
      "DATABASE_URL is not a valid URL. Quote DATABASE_URL and percent-encode @ and # in the password.",
    );
  }

  if (/^\d+$/.test(parsedUrl.hostname)) {
    throw new Error(
      "DATABASE_URL is malformed (hostname looks like a truncated password). Quote DATABASE_URL and percent-encode @ and # in the password.",
    );
  }
};

assertDatabaseUrl(parsed.data.DATABASE_URL);

export const env = {
  ...parsed.data,
  OTP_HMAC_SECRET: parsed.data.OTP_HMAC_SECRET ?? parsed.data.JWT_ACCESS_SECRET,
};
