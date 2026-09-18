import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

import { createApp } from "./app";
import { prisma } from "./utils/prisma";

type JsonResponse = {
  status: number;
  body: Record<string, unknown>;
};

type AuthData = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    phone: string;
    role: string;
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

before(async () => {
  stamp = `${Date.now()}`;
  customerEmail = `d14.cust.${stamp}@example.com`;
  customerPhone = `+81${stamp.slice(-10)}`;
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (createdCategoryId) {
    await prisma.category.deleteMany({ where: { id: createdCategoryId } });
  }
  await prisma.category.deleteMany({ where: { name: { startsWith: `Day14 ${stamp}` } } });
  await prisma.user.deleteMany({
    where: { email: { startsWith: "d14.", contains: stamp } },
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
  assert.ok(stored.passwordHash.startsWith("$2"));
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
