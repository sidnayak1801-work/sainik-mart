import { parsePhoneNumberFromString } from "libphonenumber-js";

import { AppError } from "./AppError";

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export const invalidPhoneError = (): AppError =>
  new AppError("Please enter a valid mobile number.", 400, { code: "INVALID_PHONE_NUMBER" });

export const normalizeIndianMobile = (raw: string): string => {
  const compact = raw.trim().replace(/[\s()-]/g, "");
  if (!compact) {
    throw invalidPhoneError();
  }

  const digits = compact.replace(/^\+/, "").replace(/\D/g, "");
  const national =
    digits.length === 10
      ? digits
      : digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : null;

  if (national && INDIAN_MOBILE.test(national)) {
    const parsed = parsePhoneNumberFromString(national, "IN");
    if (parsed?.isValid() && parsed.country === "IN") {
      return parsed.format("E.164");
    }
  }

  const parsed = parsePhoneNumberFromString(compact.startsWith("+") ? compact : `+${digits}`, "IN");
  if (!parsed?.isValid() || parsed.country !== "IN" || !INDIAN_MOBILE.test(parsed.nationalNumber)) {
    throw invalidPhoneError();
  }

  return parsed.format("E.164");
};

export const maskPhone = (phone: string): string => {
  if (phone.length < 8) {
    return "****";
  }
  return `${phone.slice(0, 3)}******${phone.slice(-4)}`;
};

export const toMsg91Mobile = (e164: string): string => e164.replace(/^\+/, "");
