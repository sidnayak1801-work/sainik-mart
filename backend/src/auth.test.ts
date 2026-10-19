import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

import { createApp } from "./app";
import { resetLoginIpLimit } from "./middleware/loginIpLimit";
import { failNextMockOtpSend, getLastMockOtp, resetMockOtps } from "./services/otp";
import { setMsg91WidgetVerifierForTests } from "./services/otp/msg91.widget";
import { AppError } from "./utils/AppError";
import { generateOtp, hashOtp, verifyOtpHash } from "./utils/otp";
import { normalizeIndianMobile } from "./utils/phone";
import { prisma } from "./utils/prisma";

type JsonResponse = {
  status: number;
  body: Record<string, unknown>;
};

type AuthData = {
  accessToken: string;
  isNewUser?: boolean;
  user: {
    id: string;
    email: string | null;
    phone: string;
    name: string | null;
    role: string;
    isVerified?: boolean;
    passwordHash?: string;
  };
};

let server: Server;
let baseUrl = "";
let stamp = "";
let customerToken = "";
let customerEmail = "";
let customerPhone = "";
let adminToken = "";
let createdCategoryId = "";
let suffix = "";

const request = async (path: string, options: RequestInit = {}): Promise<JsonResponse> => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: response.status, body };
};

const json = (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) =>
  request(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const assertNoPasswordHash = (value: unknown): void => {
  assert.equal(JSON.stringify(value).includes("passwordHash"), false);
};

const assertNoOtpLeak = (value: unknown, otp?: string): void => {
  const raw = JSON.stringify(value);
  assert.equal(raw.includes('"otp"'), false);
  assert.equal(raw.includes("devCode"), false);
  if (otp) {
    assert.equal(raw.includes(otp), false);
  }
};

const indianPhone = (lead: string, tail: string): string => `+91${lead}${suffix}${tail}`;

const sendOtp = (phoneNumber: string) => json("POST", "/api/auth/send-otp", { phoneNumber });
const resendOtp = (phoneNumber: string) => json("POST", "/api/auth/resend-otp", { phoneNumber });
const verifyOtp = (phoneNumber: string, otp: string) =>
  json("POST", "/api/auth/verify-otp", { phoneNumber, otp });
const verifyWidget = (accessToken: string) => json("POST", "/api/auth/verify-widget", { accessToken });

before(async () => {
  stamp = `${Date.now()}`;
  suffix = stamp.slice(-8);
  customerEmail = `d14.cust.${stamp}@example.com`;
  customerPhone = `+81${stamp.slice(-10)}`;
  resetMockOtps();
  setMsg91WidgetVerifierForTests(null);
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  setMsg91WidgetVerifierForTests(null);
  if (createdCategoryId) {
    await prisma.category.deleteMany({ where: { id: createdCategoryId } });
  }
  await prisma.category.deleteMany({ where: { name: { startsWith: `Day14 ${stamp}` } } });
  await prisma.authOtp.deleteMany({
    where: {
      OR: [{ identifier: { contains: stamp } }, { identifier: { contains: suffix } }],
    },
  });
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { startsWith: "d14.", contains: stamp } },
        { phone: { contains: suffix } },
        { phone: { contains: stamp.slice(-10) } },
      ],
    },
  });
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("register persists a hashed password and never returns passwordHash", async () => {
  const result = await json("POST", "/api/auth/register", {
    name: "Day14 Customer",
    email: customerEmail,
    phone: customerPhone,
    password: "password123",
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.success, true);
  const data = result.body.data as AuthData;
  assert.ok(data.accessToken);
  assert.equal(data.user.email, customerEmail);
  assert.equal(data.user.role, "CUSTOMER");
  assertNoPasswordHash(result.body);

  const stored = await prisma.user.findUnique({ where: { email: customerEmail } });
  assert.ok(stored);
  assert.notEqual(stored.passwordHash, "password123");
  assert.ok(stored.passwordHash && stored.passwordHash.startsWith("$2"));
  customerToken = data.accessToken;
});

test("duplicate registration is rejected", async () => {
  const duplicateEmail = await json("POST", "/api/auth/register", {
    name: "Day14 Dup Email",
    email: customerEmail,
    phone: `+83${stamp.slice(-10)}`,
    password: "password123",
  });
  assert.equal(duplicateEmail.status, 409);

  const duplicatePhone = await json("POST", "/api/auth/register", {
    name: "Day14 Dup Phone",
    email: `d14.dupphone.${stamp}@example.com`,
    phone: customerPhone,
    password: "password123",
  });
  assert.equal(duplicatePhone.status, 409);
});

test("invalid registration input is rejected", async () => {
  const missing = await json("POST", "/api/auth/register", {
    name: "Nope",
    email: `d14.bad.${stamp}@example.com`,
    phone: `+84${stamp.slice(-10)}`,
  });
  assert.equal(missing.status, 400);

  const shortPassword = await json("POST", "/api/auth/register", {
    name: "Nope",
    email: `d14.short.${stamp}@example.com`,
    phone: `+85${stamp.slice(-10)}`,
    password: "123",
  });
  assert.equal(shortPassword.status, 400);
});

test("login succeeds with JWT and rejects bad credentials", async () => {
  const success = await json("POST", "/api/auth/login", {
    identifier: customerEmail,
    password: "password123",
  });
  assert.equal(success.status, 200);
  const data = success.body.data as AuthData;
  assert.ok(data.accessToken);
  assertNoPasswordHash(success.body);
  customerToken = data.accessToken;

  const wrongPassword = await json("POST", "/api/auth/login", {
    identifier: customerEmail,
    password: "wrong-password",
  });
  assert.equal(wrongPassword.status, 401);
  assert.equal(wrongPassword.body.message, "Invalid credentials");

  const unknownUser = await json("POST", "/api/auth/login", {
    identifier: `d14.missing.${stamp}@example.com`,
    password: "password123",
  });
  assert.equal(unknownUser.status, 401);
  assert.equal(unknownUser.body.message, "Invalid credentials");

  const missingPassword = await json("POST", "/api/auth/login", {
    identifier: customerEmail,
  });
  assert.equal(missingPassword.status, 400);
});

test("POST /api/auth/admin/login accepts ADMIN and rejects everyone else", async () => {
  resetLoginIpLimit();
  const adminEmail = `d14.adminlogin.${stamp}@example.com`;
  const adminPhone = `+86${stamp.slice(-10)}`;
  const registered = await json("POST", "/api/auth/register", {
    name: "Day14 Admin Login",
    email: adminEmail,
    phone: adminPhone,
    password: "password123",
  });
  assert.equal(registered.status, 201);
  await prisma.user.update({ where: { email: adminEmail }, data: { role: "ADMIN" } });

  const success = await json("POST", "/api/auth/admin/login", {
    email: adminEmail,
    password: "password123",
  });
  assert.equal(success.status, 200);
  const data = success.body.data as AuthData;
  assert.ok(data.accessToken);
  assert.equal(data.user.role, "ADMIN");
  assertNoPasswordHash(success.body);

  const customerDenied = await json("POST", "/api/auth/admin/login", {
    email: customerEmail,
    password: "password123",
  });
  assert.equal(customerDenied.status, 401);
  assert.equal(customerDenied.body.message, "Invalid credentials");

  const unknown = await json("POST", "/api/auth/admin/login", {
    email: `d14.missing.admin.${stamp}@example.com`,
    password: "password123",
  });
  assert.equal(unknown.status, 401);
  assert.equal(unknown.body.message, "Invalid credentials");

  const shortPassword = await json("POST", "/api/auth/admin/login", {
    email: adminEmail,
    password: "123",
  });
  assert.equal(shortPassword.status, 400);

  const missingEmail = await json("POST", "/api/auth/admin/login", {
    password: "password123",
  });
  assert.equal(missingEmail.status, 400);
});

test("POST /api/auth/admin/login is rate limited per IP", async () => {
  resetLoginIpLimit();
  const email = `d14.ratelimit.${stamp}@example.com`;
  for (let i = 0; i < 10; i += 1) {
    const denied = await json("POST", "/api/auth/admin/login", {
      email,
      password: "password123",
    });
    assert.equal(denied.status, 401);
  }
  const limited = await json("POST", "/api/auth/admin/login", {
    email,
    password: "password123",
  });
  assert.equal(limited.status, 429);
  assert.equal(limited.body.code, "LOGIN_RATE_LIMITED");
});

test("GET /api/auth/me requires a valid JWT", async () => {
  const missing = await request("/api/auth/me");
  assert.equal(missing.status, 401);

  const malformed = await request("/api/auth/me", {
    headers: { Authorization: "abc" },
  });
  assert.equal(malformed.status, 401);

  const emptyBearer = await request("/api/auth/me", {
    headers: { Authorization: "Bearer" },
  });
  assert.equal(emptyBearer.status, 401);

  const invalid = await request("/api/auth/me", {
    headers: { Authorization: "Bearer invalid" },
  });
  assert.equal(invalid.status, 401);

  const valid = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert.equal(valid.status, 200);
  const payload = valid.body.data as { user: { email: string } };
  assert.equal(payload.user.email, customerEmail);
  assertNoPasswordHash(valid.body);
});

test("phone normalization accepts Indian formats and rejects invalid numbers", () => {
  assert.equal(normalizeIndianMobile("9876543210"), "+919876543210");
  assert.equal(normalizeIndianMobile("+919876543210"), "+919876543210");
  assert.equal(normalizeIndianMobile("919876543210"), "+919876543210");
  assert.throws(() => normalizeIndianMobile("12345"));
  assert.throws(() => normalizeIndianMobile("1111111111"));
});

test("OTP generation is six digits and hashing supports leading zeroes", () => {
  for (let i = 0; i < 20; i += 1) {
    const otp = generateOtp(6);
    assert.match(otp, /^\d{6}$/);
  }
  const hashed = hashOtp("004821");
  assert.equal(hashed.includes("004821"), false);
  assert.equal(verifyOtpHash("004821", hashed), true);
  assert.equal(verifyOtpHash("004822", hashed), false);
});

test("send-otp rejects invalid phones and never returns an OTP", async () => {
  const invalid = await sendOtp("12345");
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.code, "INVALID_PHONE_NUMBER");
  assertNoOtpLeak(invalid.body);
});

test("new customer is created on OTP verify and can call /me", async () => {
  resetMockOtps();
  const phone = indianPhone("9", "1");
  const sent = await sendOtp(phone);
  assert.equal(sent.status, 200);
  const data = sent.body.data as { message?: string; otp?: string };
  assert.equal(data.message, "OTP sent successfully");
  assertNoOtpLeak(sent.body);

  const otp = getLastMockOtp(phone);
  assert.equal(typeof otp, "string");
  assert.match(otp ?? "", /^\d{6}$/);
  assertNoOtpLeak(sent.body, otp);

  const verified = await verifyOtp(phone, otp ?? "");
  assert.equal(verified.status, 200);
  const auth = verified.body.data as AuthData;
  assert.equal(auth.isNewUser, true);
  assert.equal(auth.user.role, "CUSTOMER");
  assert.equal(auth.user.phone, phone);
  assert.equal(auth.user.isVerified, true);
  assert.equal(auth.user.name, null);
  assert.equal(auth.user.email, null);
  assert.ok(auth.accessToken);
  assertNoPasswordHash(verified.body);
  assertNoOtpLeak(verified.body, otp);

  const stored = await prisma.user.findUnique({ where: { phone } });
  assert.ok(stored);
  assert.equal(stored.role, "CUSTOMER");
  assert.equal(stored.isVerified, true);
  assert.equal(stored.passwordHash, null);

  const me = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });
  assert.equal(me.status, 200);
  const meUser = (me.body.data as { user: { phone: string; role: string } }).user;
  assert.equal(meUser.phone, phone);
  assert.equal(meUser.role, "CUSTOMER");
});

test("existing customer OTP login does not create a duplicate user", async () => {
  resetMockOtps();
  const phone = indianPhone("8", "1");
  const created = await json("POST", "/api/auth/register", {
    name: "Existing OTP User",
    email: `d14.otp.existing.${stamp}@example.com`,
    phone,
    password: "password123",
  });
  assert.equal(created.status, 201);

  const sent = await sendOtp(phone);
  assert.equal(sent.status, 200);
  const otp = getLastMockOtp(phone);
  assert.ok(otp);

  const verified = await verifyOtp(phone, otp);
  assert.equal(verified.status, 200);
  const auth = verified.body.data as AuthData;
  assert.equal(auth.isNewUser, false);
  assert.equal(auth.user.role, "CUSTOMER");
  assert.equal(auth.user.phone, phone);

  const count = await prisma.user.count({ where: { phone } });
  assert.equal(count, 1);
});

test("wrong OTP then correct OTP authenticates", async () => {
  resetMockOtps();
  const phone = indianPhone("8", "2");
  const sent = await sendOtp(phone);
  assert.equal(sent.status, 200);
  const otp = getLastMockOtp(phone) ?? "000000";
  const wrong = otp === "000000" ? "111111" : "000000";

  const failed = await verifyOtp(phone, wrong);
  assert.equal(failed.status, 401);
  assert.equal(failed.body.code, "INVALID_OTP");

  const success = await verifyOtp(phone, otp);
  assert.equal(success.status, 200);
  assert.equal((success.body.data as AuthData).isNewUser, true);
});

test("expired OTP is rejected", async () => {
  resetMockOtps();
  const phone = indianPhone("7", "1");
  const sent = await sendOtp(phone);
  assert.equal(sent.status, 200);
  const otp = getLastMockOtp(phone);
  assert.ok(otp);

  await prisma.authOtp.updateMany({
    where: { identifier: phone, consumedAt: null },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });

  const expired = await verifyOtp(phone, otp);
  assert.equal(expired.status, 401);
  assert.equal(expired.body.code, "OTP_EXPIRED");
});

test("already used OTP cannot be reused", async () => {
  resetMockOtps();
  const phone = indianPhone("7", "2");
  await sendOtp(phone);
  const otp = getLastMockOtp(phone);
  assert.ok(otp);
  const first = await verifyOtp(phone, otp);
  assert.equal(first.status, 200);
  const second = await verifyOtp(phone, otp);
  assert.equal(second.status, 401);
  assert.equal(second.body.code, "INVALID_OTP");
});

test("maximum OTP attempts are enforced", async () => {
  resetMockOtps();
  const phone = indianPhone("6", "1");
  await sendOtp(phone);
  const otp = getLastMockOtp(phone) ?? "123456";
  const wrong = otp === "000000" ? "111111" : "000000";

  for (let i = 0; i < 4; i += 1) {
    const failed = await verifyOtp(phone, wrong);
    assert.equal(failed.status, 401);
    assert.equal(failed.body.code, "INVALID_OTP");
  }

  const last = await verifyOtp(phone, wrong);
  assert.equal(last.status, 401);
  assert.equal(last.body.code, "OTP_ATTEMPTS_EXCEEDED");

  const blocked = await verifyOtp(phone, otp);
  assert.equal(blocked.status, 401);
});

test("resend cooldown and previous OTP invalidation", async () => {
  resetMockOtps();
  const phone = indianPhone("6", "2");
  const first = await sendOtp(phone);
  assert.equal(first.status, 200);
  const firstOtp = getLastMockOtp(phone);
  assert.ok(firstOtp);

  const cooldown = await sendOtp(phone);
  assert.equal(cooldown.status, 429);
  assert.equal(cooldown.body.code, "OTP_COOLDOWN");

  await prisma.authOtp.updateMany({
    where: { identifier: phone },
    data: { createdAt: new Date(Date.now() - 31_000) },
  });

  const resent = await resendOtp(phone);
  assert.equal(resent.status, 200);
  const secondOtp = getLastMockOtp(phone);
  assert.ok(secondOtp);

  const oldRejected = await verifyOtp(phone, firstOtp);
  assert.equal(oldRejected.status, 401);

  const next = await verifyOtp(phone, secondOtp);
  assert.equal(next.status, 200);
});

test("hourly OTP request limit is enforced", async () => {
  resetMockOtps();
  const phone = indianPhone("9", "3");
  const createdAt = new Date(Date.now() - 2 * 60 * 1000);
  for (let index = 0; index < 5; index += 1) {
    await prisma.authOtp.create({
      data: {
        identifier: phone,
        codeHash: hashOtp(`00000${index}`),
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: createdAt,
        createdAt,
      },
    });
  }

  const limited = await sendOtp(phone);
  assert.equal(limited.status, 429);
  assert.equal(limited.body.code, "OTP_RATE_LIMITED");
});

test("OTP provider failure does not authenticate", async () => {
  resetMockOtps();
  failNextMockOtpSend();
  const phone = indianPhone("9", "4");
  const failed = await sendOtp(phone);
  assert.equal(failed.status, 502);
  assert.equal(failed.body.code, "OTP_PROVIDER_ERROR");
  assert.equal(getLastMockOtp(phone), undefined);

  const verify = await verifyOtp(phone, "123456");
  assert.equal(verify.status, 401);
});

test("MSG91 widget token creates a new customer after MSG91 success", async () => {
  const phone = indianPhone("9", "5");
  setMsg91WidgetVerifierForTests(async (token) => {
    assert.equal(token, "widget-access-token");
    return phone;
  });

  const verified = await verifyWidget("widget-access-token");
  assert.equal(verified.status, 200);
  const auth = verified.body.data as AuthData;
  assert.equal(auth.isNewUser, true);
  assert.equal(auth.user.phone, phone);
  assert.equal(auth.user.role, "CUSTOMER");
  assert.equal(auth.user.isVerified, true);
  assert.ok(auth.accessToken);
  assertNoPasswordHash(verified.body);
  assert.equal(JSON.stringify(verified.body).includes("widget-access-token"), false);

  const stored = await prisma.user.findUnique({ where: { phone } });
  assert.ok(stored);
  assert.equal(stored.passwordHash, null);
  setMsg91WidgetVerifierForTests(null);
});

test("MSG91 widget token logs in an existing customer", async () => {
  const phone = indianPhone("9", "6");
  const created = await json("POST", "/api/auth/register", {
    name: "Widget Existing",
    email: `d14.widget.existing.${stamp}@example.com`,
    phone,
    password: "password123",
  });
  assert.equal(created.status, 201);

  setMsg91WidgetVerifierForTests(async () => phone);
  const verified = await verifyWidget("existing-widget-token");
  assert.equal(verified.status, 200);
  const auth = verified.body.data as AuthData;
  assert.equal(auth.isNewUser, false);
  assert.equal(auth.user.phone, phone);
  assert.equal(await prisma.user.count({ where: { phone } }), 1);
  setMsg91WidgetVerifierForTests(null);
});

test("MSG91 widget token failure does not create a user", async () => {
  setMsg91WidgetVerifierForTests(async () => {
    throw new AppError("Incorrect OTP. Please try again.", 401, { code: "INVALID_OTP" });
  });
  const rejected = await verifyWidget("bad-widget-token");
  assert.equal(rejected.status, 401);
  assert.equal(rejected.body.code, "INVALID_OTP");
  setMsg91WidgetVerifierForTests(null);
});

test("MSG91 widget email identifiers are rejected", async () => {
  setMsg91WidgetVerifierForTests(async () => "customer@example.com");
  const failed = await verifyWidget("email-widget-token");
  assert.equal(failed.status, 400);
  assert.equal(failed.body.code, "INVALID_PHONE_NUMBER");
  setMsg91WidgetVerifierForTests(null);
});

test("POST /api/auth/logout returns success", async () => {
  const result = await json("POST", "/api/auth/logout");
  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
});

test("GET /privacy and /account-deletion serve Play listing pages", async () => {
  for (const path of ["/privacy", "/api/privacy", "/account-deletion", "/api/account-deletion", "/terms", "/api/terms"]) {
    const response = await fetch(`${baseUrl}${path}`);
    const text = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /html/);
    assert.match(text, /Sainik Mart/);
  }
});

test("DELETE /api/auth/account anonymizes a customer and rejects admin", async () => {
  const phone = indianPhone("8", "7");
  const registered = await json("POST", "/api/auth/register", {
    name: "Day14 Delete Me",
    email: `d14.delete.${stamp}@example.com`,
    phone,
    password: "password123",
  });
  assert.equal(registered.status, 201);
  const token = (registered.body.data as AuthData).accessToken;
  const userId = (registered.body.data as AuthData).user.id;

  const missing = await json("DELETE", "/api/auth/account");
  assert.equal(missing.status, 401);

  const deleted = await json("DELETE", "/api/auth/account", undefined, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(deleted.status, 200);
  assert.equal((deleted.body.data as { deleted: boolean }).deleted, true);

  const stored = await prisma.user.findUnique({ where: { id: userId } });
  assert.ok(stored?.deletedAt);
  assert.equal(stored.email, null);
  assert.equal(stored.name, null);
  assert.equal(stored.phone.startsWith("d"), true);
  assert.equal(stored.passwordHash, null);

  const meAfter = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(meAfter.status, 401);

  const samePhone = await json("POST", "/api/auth/register", {
    name: "Day14 Reborn",
    email: `d14.reborn.${stamp}@example.com`,
    phone,
    password: "password123",
  });
  assert.equal(samePhone.status, 201);

  await prisma.user.delete({ where: { id: userId } });

  const adminEmail = `d14.deleteadmin.${stamp}@example.com`;
  const adminPhone = indianPhone("7", "6");
  const adminReg = await json("POST", "/api/auth/register", {
    name: "Day14 Delete Admin",
    email: adminEmail,
    phone: adminPhone,
    password: "password123",
  });
  assert.equal(adminReg.status, 201);
  await prisma.user.update({ where: { email: adminEmail }, data: { role: "ADMIN" } });
  const adminLogin = await json("POST", "/api/auth/login", {
    identifier: adminEmail,
    password: "password123",
  });
  assert.equal(adminLogin.status, 200);
  const adminDenied = await json("DELETE", "/api/auth/account", undefined, {
    Authorization: `Bearer ${(adminLogin.body.data as AuthData).accessToken}`,
  });
  assert.equal(adminDenied.status, 403);
});

test("CUSTOMER is forbidden from admin catalog writes while ADMIN is allowed", async () => {
  const customerCreate = await json(
    "POST",
    "/api/categories",
    { name: `Day14 ${stamp} Blocked` },
    { Authorization: `Bearer ${customerToken}` },
  );
  assert.equal(customerCreate.status, 403);

  const adminReg = await json("POST", "/api/auth/register", {
    name: "Day14 Admin",
    email: `d14.admin.${stamp}@example.com`,
    phone: `+82${stamp.slice(-10)}`,
    password: "password123",
  });
  assert.equal(adminReg.status, 201);

  await prisma.user.update({
    where: { email: `d14.admin.${stamp}@example.com` },
    data: { role: "ADMIN" },
  });

  const adminLogin = await json("POST", "/api/auth/login", {
    identifier: `d14.admin.${stamp}@example.com`,
    password: "password123",
  });
  assert.equal(adminLogin.status, 200);
  adminToken = (adminLogin.body.data as AuthData).accessToken;

  const adminCreate = await json(
    "POST",
    "/api/categories",
    { name: `Day14 ${stamp} Allowed` },
    { Authorization: `Bearer ${adminToken}` },
  );
  assert.equal(adminCreate.status, 201);
  createdCategoryId = (adminCreate.body.data as { id: string }).id;
});
