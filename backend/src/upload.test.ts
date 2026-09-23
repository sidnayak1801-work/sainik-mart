import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

import { createApp } from "./app";
import { setUploadImplementation } from "./services/upload.service";
import { prisma } from "./utils/prisma";

type JsonResponse = {
  status: number;
  body: Record<string, unknown>;
};

type AuthData = {
  accessToken: string;
  user: { id: string };
};

let server: Server;
let baseUrl = "";
let stamp = "";
let customerToken = "";
let adminToken = "";

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

const authForm = (token: string, form: FormData) =>
  request("/api/admin/uploads", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

const jpegFile = () => new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: "image/jpeg" });

before(async () => {
  stamp = `${Date.now()}`;
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const info = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${info.port}`;

  const customerReg = await json("POST", "/api/auth/register", {
    name: "Upload Customer",
    email: `d28.cust.${stamp}@example.com`,
    phone: `+86${stamp.slice(-10)}`,
    password: "password123",
  });
  assert.equal(customerReg.status, 201);
  const customer = customerReg.body.data as AuthData;
  customerToken = customer.accessToken;

  const adminReg = await json("POST", "/api/auth/register", {
    name: "Upload Admin",
    email: `d28.admin.${stamp}@example.com`,
    phone: `+87${stamp.slice(-10)}`,
    password: "password123",
  });
  assert.equal(adminReg.status, 201);
  await prisma.user.update({
    where: { email: `d28.admin.${stamp}@example.com` },
    data: { role: "ADMIN" },
  });
  const adminLogin = await json("POST", "/api/auth/login", {
    identifier: `d28.admin.${stamp}@example.com`,
    password: "password123",
  });
  assert.equal(adminLogin.status, 200);
  adminToken = (adminLogin.body.data as AuthData).accessToken;
});

afterEach(() => {
  setUploadImplementation(null);
});

after(async () => {
  try {
    await prisma.user.deleteMany({ where: { email: { startsWith: "d28.", contains: stamp } } });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("image upload requires admin auth", async () => {
  const form = new FormData();
  form.append("file", jpegFile(), "photo.jpg");

  const missing = await request("/api/admin/uploads", { method: "POST", body: form });
  assert.equal(missing.status, 401);

  const customer = await authForm(customerToken, form);
  assert.equal(customer.status, 403);
});

test("image upload rejects a missing or unsupported file", async () => {
  const empty = await request("/api/admin/uploads", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: new FormData(),
  });
  assert.equal(empty.status, 400);
  assert.equal((empty.body as { message?: string }).message, "Image file is required");

  const form = new FormData();
  form.append("file", new Blob(["not-an-image"], { type: "text/plain" }), "notes.txt");
  const badType = await authForm(adminToken, form);
  assert.equal(badType.status, 400);
  assert.equal((badType.body as { message?: string }).message, "Image must be a JPEG, PNG, or WebP file");
});

test("admin can upload an image through the Cloudinary proxy", async () => {
  const uploadedUrl = "https://res.cloudinary.com/demo/image/upload/v1/sainik-mart/products/banana.jpg";
  setUploadImplementation(async () => ({
    url: uploadedUrl,
    publicId: "sainik-mart/products/banana",
  }));

  const form = new FormData();
  form.append("file", jpegFile(), "banana.jpg");
  const result = await authForm(adminToken, form);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.data, {
    url: uploadedUrl,
    publicId: "sainik-mart/products/banana",
  });
});
