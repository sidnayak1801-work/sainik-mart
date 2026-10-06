import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,19}$/, "Invalid phone"),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

export const otpRequestSchema = z.object({
  identifier: z.string().trim().min(1),
});

export const otpVerifySchema = z.object({
  identifier: z.string().trim().min(1),
  code: z.string().regex(/^\d{6}$/, "Invalid code"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
