import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { MockOtpProvider } from "./mock.provider";
import { Msg91OtpProvider } from "./msg91.provider";
import type { OtpProvider } from "./otp.provider";

const mockProvider = new MockOtpProvider();
const msg91Provider = new Msg91OtpProvider();

let testOverride: OtpProvider | null = null;

export const setOtpProviderForTests = (provider: OtpProvider | null): void => {
  testOverride = provider;
};

export const getOtpProvider = (): OtpProvider => {
  if (testOverride && env.NODE_ENV !== "production") {
    return testOverride;
  }
  if (env.OTP_PROVIDER === "msg91") {
    return msg91Provider;
  }
  if (env.NODE_ENV === "production") {
    throw new AppError("We couldn't send the OTP. Please try again.", 502, {
      code: "OTP_PROVIDER_ERROR",
    });
  }
  return mockProvider;
};

export type { OtpProvider } from "./otp.provider";
export { failNextMockOtpSend, getLastMockOtp, resetMockOtps } from "./mock.provider";
