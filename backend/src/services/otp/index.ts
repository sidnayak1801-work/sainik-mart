import { env } from "../../config/env";
import type { OtpProviderName } from "../../config/otpProviderEnv";
import { AppError } from "../../utils/AppError";
import { ApitxtOtpProvider } from "./apitxt.provider";
import { MockOtpProvider } from "./mock.provider";
import { Msg91OtpProvider } from "./msg91.provider";
import type { OtpProvider } from "./otp.provider";

const mockProvider = new MockOtpProvider();
const msg91Provider = new Msg91OtpProvider();
const apitxtProvider = new ApitxtOtpProvider();

let testOverride: OtpProvider | null = null;

export const setOtpProviderForTests = (provider: OtpProvider | null): void => {
  testOverride = provider;
};

export const selectOtpProvider = (
  name: OtpProviderName,
  nodeEnv: "development" | "test" | "production" = env.NODE_ENV,
): OtpProvider => {
  if (name === "msg91") {
    return msg91Provider;
  }
  if (name === "apitxt") {
    return apitxtProvider;
  }
  if (nodeEnv === "production") {
    throw new AppError("We couldn't send the OTP. Please try again.", 502, {
      code: "OTP_PROVIDER_ERROR",
    });
  }
  return mockProvider;
};

export const getOtpProvider = (): OtpProvider => {
  if (testOverride && env.NODE_ENV !== "production") {
    return testOverride;
  }
  return selectOtpProvider(env.OTP_PROVIDER);
};

export type { OtpProvider } from "./otp.provider";
export { failNextMockOtpSend, getLastMockOtp, resetMockOtps } from "./mock.provider";
