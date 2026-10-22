import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { AppError } from "../../utils/AppError";
import { ApitxtOtpProvider } from "./apitxt.provider";
import { isApitxtOtpAccepted } from "./apitxt.response";

const TEST_OTP = "654321";
const TEST_KEY = "test-apitxt-authkey";
const TEST_PHONE = "+919876543210";

const capturedLogs: string[] = [];
const originalError = console.error;

const startLogCapture = (): void => {
  capturedLogs.length = 0;
  console.error = (...args: unknown[]) => {
    capturedLogs.push(args.map(String).join(" "));
  };
};

afterEach(() => {
  console.error = originalError;
});

const assertLogsHideSecrets = (): void => {
  const joined = capturedLogs.join("\n");
  assert.equal(joined.includes(TEST_OTP), false);
  assert.equal(joined.includes(TEST_KEY), false);
};

test("APITxT sendOtp posts sendOTP with mocked fetch on success", async () => {
  startLogCapture();
  const urls: string[] = [];
  const provider = new ApitxtOtpProvider({
    apiKey: TEST_KEY,
    fetchFn: async (input) => {
      urls.push(String(input));
      return new Response(JSON.stringify({ status: "success", message: "OTP sent successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  await provider.sendOtp({ phoneNumber: TEST_PHONE, otp: TEST_OTP });

  assert.equal(urls.length, 1);
  const url = new URL(urls[0]);
  assert.equal(url.origin + url.pathname, "https://apitxt.com/api/sendOTP");
  assert.equal(url.searchParams.get("authkey"), TEST_KEY);
  assert.equal(url.searchParams.get("mobile"), "919876543210");
  assert.equal(url.searchParams.get("otp"), TEST_OTP);
  assert.equal(url.searchParams.get("channel"), "sms");
  assertLogsHideSecrets();
});

test("APITxT sendOtp maps HTTP 4xx to OTP_PROVIDER_ERROR without leaking secrets", async () => {
  startLogCapture();
  const provider = new ApitxtOtpProvider({
    apiKey: TEST_KEY,
    fetchFn: async () =>
      new Response(JSON.stringify({ type: "error", message: "invalid authkey" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  });

  await assert.rejects(
    () => provider.sendOtp({ phoneNumber: TEST_PHONE, otp: TEST_OTP }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 502);
      assert.equal(error.code, "OTP_PROVIDER_ERROR");
      return true;
    },
  );
  assertLogsHideSecrets();
});

test("APITxT sendOtp maps network failure to OTP_PROVIDER_ERROR without leaking secrets", async () => {
  startLogCapture();
  const provider = new ApitxtOtpProvider({
    apiKey: TEST_KEY,
    fetchFn: async () => {
      throw new Error("ECONNRESET");
    },
  });

  await assert.rejects(
    () => provider.sendOtp({ phoneNumber: TEST_PHONE, otp: TEST_OTP }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 502);
      assert.equal(error.code, "OTP_PROVIDER_ERROR");
      return true;
    },
  );
  assertLogsHideSecrets();
});


test("APITxT HTTP 200 with status success is accepted", () => {
  assert.equal(isApitxtOtpAccepted(200, { status: "success", message: "OTP sent successfully" }), true);
});

test("APITxT HTTP 200 with status 200 is accepted", () => {
  assert.equal(isApitxtOtpAccepted(200, { status: 200, message: "success" }), true);
});

test("APITxT HTTP 200 with type error is rejected", () => {
  assert.equal(isApitxtOtpAccepted(200, { type: "error" }), false);
});

test("APITxT HTTP 401 is rejected", () => {
  assert.equal(isApitxtOtpAccepted(401, { status: "success" }), false);
});

test("APITxT HTTP 200 with empty body is accepted", () => {
  assert.equal(isApitxtOtpAccepted(200, {}), true);
});
