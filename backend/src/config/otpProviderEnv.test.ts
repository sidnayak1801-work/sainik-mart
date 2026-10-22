import assert from "node:assert/strict";
import { test } from "node:test";

import { otpProviderEnvSchema } from "./otpProviderEnv";

test("OTP_PROVIDER=apitxt without APITXT_API_KEY fails Zod", () => {
  const parsed = otpProviderEnvSchema.safeParse({
    OTP_PROVIDER: "apitxt",
  });

  assert.equal(parsed.success, false);
  if (parsed.success) {
    return;
  }
  const issue = parsed.error.issues.find((item) => item.path.join(".") === "APITXT_API_KEY");
  assert.ok(issue);
  assert.match(issue.message, /APITXT_API_KEY is required when OTP_PROVIDER=apitxt/);
});

test("OTP_PROVIDER=apitxt with APITXT_API_KEY is accepted", () => {
  const parsed = otpProviderEnvSchema.safeParse({
    OTP_PROVIDER: "apitxt",
    APITXT_API_KEY: "configured",
  });

  assert.equal(parsed.success, true);
});
