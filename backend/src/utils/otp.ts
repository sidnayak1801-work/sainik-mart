import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { env } from "../config/env";

export const generateOtp = (length = env.OTP_LENGTH): string => {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, "0");
};

export const hashOtp = (otp: string, secret = env.OTP_HMAC_SECRET): string => {
  return createHmac("sha256", secret).update(otp).digest("hex");
};

export const verifyOtpHash = (otp: string, otpHash: string, secret = env.OTP_HMAC_SECRET): boolean => {
  const computed = Buffer.from(hashOtp(otp, secret), "hex");
  const stored = Buffer.from(otpHash, "hex");
  if (computed.length !== stored.length) {
    return false;
  }
  return timingSafeEqual(computed, stored);
};
