import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { logger } from "../../utils/logger";
import { maskPhone, toMsg91Mobile } from "../../utils/phone";
import type { OtpProvider } from "./otp.provider";

const MSG91_OTP_URL = "https://control.msg91.com/api/v5/otp";

export class Msg91OtpProvider implements OtpProvider {
  async sendOtp(params: { phoneNumber: string; otp: string }): Promise<void> {
    const authKey = env.MSG91_AUTH_KEY;
    const templateId = env.MSG91_TEMPLATE_ID;
    const senderId = env.MSG91_SENDER_ID;

    if (!authKey || !templateId || !senderId) {
      logger.error("MSG91 is not configured");
      throw new AppError("We couldn't send the OTP. Please try again.", 502, {
        code: "OTP_PROVIDER_ERROR",
      });
    }

    let response: Response;
    try {
      response = await fetch(MSG91_OTP_URL, {
        method: "POST",
        headers: {
          authkey: authKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          template_id: templateId,
          sender: senderId,
          mobile: toMsg91Mobile(params.phoneNumber),
          otp: params.otp,
          otp_expiry: env.OTP_EXPIRY_MINUTES,
        }),
      });
    } catch (error) {
      logger.error(`MSG91 request failed for ${maskPhone(params.phoneNumber)}`, error);
      throw new AppError("We couldn't send the OTP. Please try again.", 502, {
        code: "OTP_PROVIDER_ERROR",
      });
    }

    if (!response.ok) {
      logger.error(`MSG91 rejected OTP send for ${maskPhone(params.phoneNumber)} (${response.status})`);
      throw new AppError("We couldn't send the OTP. Please try again.", 502, {
        code: "OTP_PROVIDER_ERROR",
      });
    }
  }
}
