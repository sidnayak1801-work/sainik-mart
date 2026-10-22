import { z } from "zod";

export const otpProviderNameSchema = z.enum(["msg91", "apitxt", "mock"]);

export type OtpProviderName = z.infer<typeof otpProviderNameSchema>;

export type OtpProviderEnvInput = {
  NODE_ENV: "development" | "test" | "production";
  OTP_PROVIDER: OtpProviderName;
  APITXT_API_KEY?: string;
  MSG91_AUTH_KEY?: string;
};

export const applyOtpProviderRules = (data: OtpProviderEnvInput, ctx: z.RefinementCtx): void => {
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
  if (data.OTP_PROVIDER === "apitxt" && !data.APITXT_API_KEY) {
    ctx.addIssue({
      code: "custom",
      path: ["APITXT_API_KEY"],
      message: "APITXT_API_KEY is required when OTP_PROVIDER=apitxt",
    });
  }
};

export const otpProviderEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    OTP_PROVIDER: otpProviderNameSchema.default("mock"),
    APITXT_API_KEY: z.string().min(1).optional(),
    MSG91_AUTH_KEY: z.string().min(1).optional(),
  })
  .superRefine(applyOtpProviderRules);
