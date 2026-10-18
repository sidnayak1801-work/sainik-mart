import { AppError } from "../../utils/AppError";
import type { OtpProvider } from "./otp.provider";

const lastOtpByPhone = new Map<string, string>();
let failNext = false;

export class MockOtpProvider implements OtpProvider {
  async sendOtp(params: { phoneNumber: string; otp: string }): Promise<void> {
    if (failNext) {
      failNext = false;
      throw new AppError("We couldn't send the OTP. Please try again.", 502, {
        code: "OTP_PROVIDER_ERROR",
      });
    }
    lastOtpByPhone.set(params.phoneNumber, params.otp);
  }
}

export const getLastMockOtp = (phoneNumber: string): string | undefined => {
  return lastOtpByPhone.get(phoneNumber);
};

export const resetMockOtps = (): void => {
  lastOtpByPhone.clear();
  failNext = false;
};

export const failNextMockOtpSend = (): void => {
  failNext = true;
};
