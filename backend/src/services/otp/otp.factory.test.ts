import assert from "node:assert/strict";
import { test } from "node:test";

import { ApitxtOtpProvider } from "./apitxt.provider";
import { selectOtpProvider } from "./index";
import { MockOtpProvider } from "./mock.provider";
import { Msg91OtpProvider } from "./msg91.provider";

test("selectOtpProvider returns ApitxtOtpProvider when provider is apitxt", () => {
  assert.ok(selectOtpProvider("apitxt") instanceof ApitxtOtpProvider);
});

test("selectOtpProvider returns Msg91OtpProvider when provider is msg91", () => {
  assert.ok(selectOtpProvider("msg91") instanceof Msg91OtpProvider);
});

test("selectOtpProvider returns MockOtpProvider when provider is mock", () => {
  assert.ok(selectOtpProvider("mock", "test") instanceof MockOtpProvider);
});
