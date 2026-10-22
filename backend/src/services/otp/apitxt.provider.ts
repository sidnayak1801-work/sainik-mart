import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { logger } from "../../utils/logger";
import { maskPhone, toMsg91Mobile } from "../../utils/phone";
import type { OtpProvider } from "./otp.provider";
import { isApitxtOtpAccepted, type ApitxtSendResponse } from "./apitxt.response";

const APITXT_OTP_URL = "https://apitxt.com/api/sendOTP";

type ApitxtDeps = {
  fetchFn?: typeof fetch;
  apiKey?: string;
  channel?: "sms" | "whatsapp" | "voice";
  templateId?: string;
};

const providerError = (): AppError =>
  new AppError("We couldn't send the OTP. Please try again.", 502, {
    code: "OTP_PROVIDER_ERROR",
  });

export class ApitxtOtpProvider implements OtpProvider {
  constructor(private readonly deps: ApitxtDeps = {}) {}

  async sendOtp(params: { phoneNumber: string; otp: string }): Promise<void> {
    const authKey = this.deps.apiKey ?? env.APITXT_API_KEY;
    if (!authKey) {
      logger.error("APITxT is not configured");
      throw providerError();
    }

    const channel = this.deps.channel ?? env.APITXT_CHANNEL;
    const templateId = this.deps.templateId ?? env.APITXT_TEMPLATE_ID;
    const body = new URLSearchParams({
      authkey: authKey,
      mobile: toMsg91Mobile(params.phoneNumber),
      otp: params.otp,
      channel,
    });
    if (templateId) {
      body.set("template_id", templateId);
    }

    const fetchFn = this.deps.fetchFn ?? fetch;
    let response: Response;
    try {
      response = await fetchFn(APITXT_OTP_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
    } catch (error) {
      logger.error(`APITxT request failed for ${maskPhone(params.phoneNumber)}`, error);
      throw providerError();
    }

    let payload: ApitxtSendResponse = {};
    try {
      payload = (await response.json()) as ApitxtSendResponse;
    } catch {
      logger.error(`APITxT returned a non-JSON OTP response for ${maskPhone(params.phoneNumber)} (${response.status})`);
      throw providerError();
    }

    if (!isApitxtOtpAccepted(response.status, payload)) {
      const kind = payload.type ?? payload.status ?? "http";
      logger.error(`APITxT rejected OTP send for ${maskPhone(params.phoneNumber)} (${response.status} ${kind})`);
      throw providerError();
    }
  }
}
