import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { logger } from "../../utils/logger";
import { normalizeIndianMobile } from "../../utils/phone";

const VERIFY_URL = "https://control.msg91.com/api/v5/widget/verifyAccessToken";

type Msg91VerifyResponse = {
  type?: string;
  message?: string;
};

export type Msg91WidgetVerifier = (accessToken: string) => Promise<string>;

let testOverride: Msg91WidgetVerifier | null = null;

export const setMsg91WidgetVerifierForTests = (verifier: Msg91WidgetVerifier | null): void => {
  testOverride = verifier;
};

const invalidWidgetTokenError = (): AppError =>
  new AppError("Incorrect OTP. Please try again.", 401, { code: "INVALID_OTP" });

const providerError = (): AppError =>
  new AppError("We couldn't send the OTP. Please try again.", 502, { code: "OTP_PROVIDER_ERROR" });

const parseIdentifier = (raw: string): string => {
  const identifier = raw.trim();
  if (!identifier || identifier.includes("@")) {
    throw new AppError("Please enter a valid mobile number.", 400, { code: "INVALID_PHONE_NUMBER" });
  }
  return normalizeIndianMobile(identifier);
};

export const verifyMsg91AccessToken = async (accessToken: string): Promise<string> => {
  if (testOverride && env.NODE_ENV !== "production") {
    return parseIdentifier(await testOverride(accessToken));
  }

  if (!env.MSG91_AUTH_KEY) {
    logger.error("MSG91 Authkey is not configured for widget verification");
    throw providerError();
  }

  let response: Response;
  try {
    response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        authkey: env.MSG91_AUTH_KEY,
        "access-token": accessToken,
      }),
    });
  } catch (error) {
    logger.error("MSG91 widget token verification request failed", error);
    throw providerError();
  }

  let payload: Msg91VerifyResponse = {};
  try {
    payload = (await response.json()) as Msg91VerifyResponse;
  } catch {
    throw providerError();
  }

  if (!response.ok || payload.type !== "success" || typeof payload.message !== "string") {
    throw invalidWidgetTokenError();
  }

  return parseIdentifier(payload.message);
};
