import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import jwt from "jsonwebtoken";

import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./utils/prisma";

type JsonResponse = {
  status: number;
  body: Record<string, unknown>;
};

type AuthData = {
  accessToken: string;
  user: { id: string; email: string; role: string };
};

let server: Server;
let baseUrl = "";
let stamp = "";
let customerId = "";
let customerToken = "";
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

const authJson = (token: string, method: string, path: string, body?: unknown, extraHeaders: Record<string, string> = {}) =>
  json(method, path, body, { Authorization: `Bearer ${token}`, ...extraHeaders });

const categoryCount = async () => prisma.category.count({ where: { name: { startsWith: `Day24 ${stamp}` } } });

before(async () => {
  stamp = `${Date.now()}`;
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;

  const customerReg = await json("POST", "/api/auth/register", {
    name: "Day24 Customer",
    email: `d24.cust.${stamp}@example.com`,
    phone: `+84${stamp.slice(-10)}`,
    password: "password123",
  });
  assert.equal(customerReg.status, 201);
  const customer = customerReg.body.data as AuthData;
  customerToken = customer.accessToken;
  customerId = customer.user.id;
  assert.equal(customer.user.role, "CUSTOMER");

  const adminReg = await json("POST", "/api/auth/register", {
    name: "Day24 Admin",
    email: `d24.admin.${stamp}@example.com`,
    phone: `+85${stamp.slice(-10)}`,
    password: "password123",
  });
  assert.equal(adminReg.status, 201);
  await prisma.user.update({
    where: { email: `d24.admin.${stamp}@example.com` },
    data: { role: "ADMIN" },
  });
  const adminLogin = await json("POST", "/api/auth/login", {
    identifier: `d24.admin.${stamp}@example.com`,
    password: "password123",
  });
  assert.equal(adminLogin.status, 200);
  adminToken = (adminLogin.body.data as AuthData).accessToken;
});

after(async () => {
  try {
    await prisma.category.deleteMany({ where: { name: { startsWith: `Day24 ${stamp}` } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: "d24.", contains: stamp } } });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("admin JWT can access protected admin writes", async () => {
  const created = await authJson(adminToken, "POST", "/api/categories", {
    name: `Day24 ${stamp} Allowed`,
  });
  assert.equal(created.status, 201);
  createdCategoryId = (created.body.data as { id: string }).id;
  assert.ok(createdCategoryId);
});

test("customer JWT is forbidden from admin writes", async () => {
  const beforeCount = await categoryCount();
  const blocked = await authJson(customerToken, "POST", "/api/categories", {
    name: `Day24 ${stamp} Blocked`,
  });
  assert.equal(blocked.status, 403);
  assert.equal((blocked.body as { message?: string }).message, "Forbidden");
  assert.equal(await categoryCount(), beforeCount);
});

test("admin writes reject missing and invalid JWTs", async () => {
  const missing = await json("POST", "/api/categories", { name: `Day24 ${stamp} Missing` });
  assert.equal(missing.status, 401);

  const invalid = await json(
    "POST",
    "/api/categories",
    { name: `Day24 ${stamp} Invalid` },
    { Authorization: "Bearer not-a-token" },
  );
  assert.equal(invalid.status, 401);
});

test("tampered and expired JWTs are rejected", async () => {
  const parts = customerToken.split(".");
  assert.equal(parts.length, 3);
  const tampered = `${parts[0]}.${parts[1]}.invalid-signature`;
  const tamperedResult = await json(
    "POST",
    "/api/categories",
    { name: `Day24 ${stamp} Tampered` },
    { Authorization: `Bearer ${tampered}` },
  );
  assert.equal(tamperedResult.status, 401);

  const expired = jwt.sign(
    { sub: customerId, role: "CUSTOMER", exp: Math.floor(Date.now() / 1000) - 60 },
    env.JWT_ACCESS_SECRET,
  );
  const expiredResult = await json(
    "POST",
    "/api/categories",
    { name: `Day24 ${stamp} Expired` },
    { Authorization: `Bearer ${expired}` },
  );
  assert.equal(expiredResult.status, 401);
});

test("JWT role claim cannot override the database role", async () => {
  const forged = jwt.sign({ sub: customerId, role: "ADMIN" }, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
  const beforeCount = await categoryCount();
  const result = await json(
    "POST",
    "/api/categories",
    { name: `Day24 ${stamp} Forged Role` },
    { Authorization: `Bearer ${forged}` },
  );
  assert.equal(result.status, 403);
  assert.equal(await categoryCount(), beforeCount);
});

test("client-provided role values cannot grant admin access", async () => {
  const beforeCount = await categoryCount();
  const withBody = await authJson(
    customerToken,
    "POST",
    "/api/categories",
    { name: `Day24 ${stamp} Body Role`, role: "ADMIN" },
    { "X-Role": "ADMIN" },
  );
  assert.equal(withBody.status, 403);
  assert.equal(await categoryCount(), beforeCount);

  const spoofRegister = await json("POST", "/api/auth/register", {
    name: "Day24 Spoof",
    email: `d24.spoof.${stamp}@example.com`,
    phone: `+86${stamp.slice(-10)}`,
    password: "password123",
    role: "ADMIN",
  });
  assert.equal(spoofRegister.status, 201);
  const spoof = spoofRegister.body.data as AuthData;
  assert.equal(spoof.user.role, "CUSTOMER");
  const spoofWrite = await authJson(spoof.accessToken, "POST", "/api/categories", {
    name: `Day24 ${stamp} Spoof Write`,
  });
  assert.equal(spoofWrite.status, 403);
});

test("customer authentication still works after admin authorization", async () => {
  const me = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert.equal(me.status, 200);
  const payload = me.body.data as { user: { id: string; role: string } };
  assert.equal(payload.user.id, customerId);
  assert.equal(payload.user.role, "CUSTOMER");
});
