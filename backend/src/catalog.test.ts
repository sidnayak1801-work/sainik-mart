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

let server: Server;
let baseUrl = "";
let customerToken = "";
let adminToken = "";
let categoryId = "";
let productId = "";
let stamp = "";

const request = async (
  path: string,
  options: RequestInit = {},
): Promise<JsonResponse> => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: response.status, body };
};

const authJson = (token: string, method: string, path: string, body?: unknown) =>
  request(path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

before(async () => {
  stamp = `${Date.now()}`;
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;

  const customer = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Day11 Customer",
      email: `d11.cust.${stamp}@example.com`,
      phone: `+91${stamp.slice(-10)}`,
      password: "password123",
    }),
  });
  assert.equal(customer.status, 201);
  const customerData = customer.body.data as { accessToken: string };
  customerToken = customerData.accessToken;

  const adminReg = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Day11 Admin",
      email: `d11.admin.${stamp}@example.com`,
      phone: `+92${stamp.slice(-10)}`,
      password: "password123",
    }),
  });
  assert.equal(adminReg.status, 201);
  await prisma.user.update({
    where: { email: `d11.admin.${stamp}@example.com` },
    data: { role: "ADMIN" },
  });
  const adminLogin = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: `d11.admin.${stamp}@example.com`,
      password: "password123",
    }),
  });
  assert.equal(adminLogin.status, 200);
  const adminData = adminLogin.body.data as { accessToken: string };
  adminToken = adminData.accessToken;
});

after(async () => {
  await prisma.product.deleteMany({ where: { name: { startsWith: `Day11 ${stamp}` } } });
  await prisma.category.deleteMany({ where: { name: { startsWith: `Day11 ${stamp}` } } });
  await prisma.user.deleteMany({
    where: { email: { startsWith: "d11.", contains: stamp } },
  });
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("GET categories is public", async () => {
  const result = await request("/api/categories");
  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.ok(Array.isArray(result.body.data));
});

test("unauthenticated and invalid token cannot create categories", async () => {
  const missing = await request("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: `Day11 ${stamp} blocked` }),
  });
  assert.equal(missing.status, 401);

  const invalid = await authJson("not-a-token", "POST", "/api/categories", {
    name: `Day11 ${stamp} blocked`,
  });
  assert.equal(invalid.status, 401);
});

test("customer cannot create or update categories", async () => {
  const created = await authJson(customerToken, "POST", "/api/categories", {
    name: `Day11 ${stamp} Dairy`,
  });
  assert.equal(created.status, 403);

  const updated = await authJson(
    customerToken,
    "PATCH",
    "/api/categories/00000000-0000-4000-8000-000000000001",
    { name: "Nope" },
  );
  assert.equal(updated.status, 403);
});

test("admin creates, updates, and deactivates a category", async () => {
  const created = await authJson(adminToken, "POST", "/api/categories", {
    name: `Day11 ${stamp} Dairy`,
  });
  assert.equal(created.status, 201);
  const category = created.body.data as { id: string; name: string };
  categoryId = category.id;
  assert.equal(category.name, `Day11 ${stamp} Dairy`);

  const duplicate = await authJson(adminToken, "POST", "/api/categories", {
    name: `Day11 ${stamp} Dairy`,
  });
  assert.equal(duplicate.status, 409);

  const updated = await authJson(adminToken, "PATCH", `/api/categories/${categoryId}`, {
    name: `Day11 ${stamp} Dairy Fresh`,
  });
  assert.equal(updated.status, 200);

  const byId = await request(`/api/categories/${categoryId}`);
  assert.equal(byId.status, 200);
});

test("invalid and missing category ids", async () => {
  const invalid = await request("/api/categories/not-a-uuid");
  assert.equal(invalid.status, 400);

  const missing = await request("/api/categories/00000000-0000-4000-8000-000000000099");
  assert.equal(missing.status, 404);
});

test("customer cannot create products", async () => {
  const created = await authJson(customerToken, "POST", "/api/products", {
    name: `Day11 ${stamp} Milk`,
    description: "Fresh milk",
    price: 60,
    categoryId,
  });
  assert.equal(created.status, 403);
});

test("admin product validation", async () => {
  const negativeStock = await authJson(adminToken, "POST", "/api/products", {
    name: `Day11 ${stamp} Milk`,
    description: "Fresh milk",
    price: 60,
    stockQuantity: -1,
    categoryId,
  });
  assert.equal(negativeStock.status, 400);

  const negativePrice = await authJson(adminToken, "POST", "/api/products", {
    name: `Day11 ${stamp} Milk`,
    description: "Fresh milk",
    price: -5,
    categoryId,
  });
  assert.equal(negativePrice.status, 400);

  const badDiscount = await authJson(adminToken, "POST", "/api/products", {
    name: `Day11 ${stamp} Milk`,
    description: "Fresh milk",
    price: 60,
    discountPrice: 80,
    categoryId,
  });
  assert.equal(badDiscount.status, 400);

  const missingCategory = await authJson(adminToken, "POST", "/api/products", {
    name: `Day11 ${stamp} Milk`,
    description: "Fresh milk",
    price: 60,
    categoryId: "00000000-0000-4000-8000-000000000099",
  });
  assert.equal(missingCategory.status, 404);
});

test("admin creates and updates products", async () => {
  const milk = await authJson(adminToken, "POST", "/api/products", {
    name: `Day11 ${stamp} Milk`,
    description: "Fresh milk carton",
    price: 60,
    discountPrice: 50,
    stockQuantity: 25,
    categoryId,
  });
  assert.equal(milk.status, 201);
  const milkProduct = milk.body.data as { id: string; price: number };
  productId = milkProduct.id;
  assert.equal(milkProduct.price, 60);

  const bread = await authJson(adminToken, "POST", "/api/products", {
    name: `Day11 ${stamp} Bread`,
    description: "Whole wheat bread",
    price: 40,
    categoryId,
  });
  assert.equal(bread.status, 201);

  const apples = await authJson(adminToken, "POST", "/api/products", {
    name: `Day11 ${stamp} Apples`,
    description: "Crisp apples",
    price: 120,
    categoryId,
  });
  assert.equal(apples.status, 201);

  const updated = await authJson(adminToken, "PATCH", `/api/products/${productId}`, {
    stockQuantity: 40,
    price: 65,
    discountPrice: 55,
  });
  assert.equal(updated.status, 200);
});

test("search, filter, and pagination", async () => {
  const search = await request(`/api/products?search=milk`);
  assert.equal(search.status, 200);
  const searchData = search.body.data as Array<{ name: string }>;
  assert.ok(searchData.some((item) => item.name.includes("Milk")));

  const filtered = await request(`/api/products?categoryId=${categoryId}`);
  assert.equal(filtered.status, 200);
  const filteredData = filtered.body.data as Array<{ categoryId: string }>;
  assert.ok(filteredData.every((item) => item.categoryId === categoryId));

  const page1 = await request(`/api/products?page=1&limit=1&categoryId=${categoryId}&search=Day11`);
  assert.equal(page1.status, 200);
  const pagination = page1.body.pagination as { page: number; limit: number; total: number };
  assert.equal(pagination.page, 1);
  assert.equal(pagination.limit, 1);
  assert.ok(pagination.total >= 3);
  assert.equal((page1.body.data as unknown[]).length, 1);

  const page2 = await request(`/api/products?page=2&limit=1&categoryId=${categoryId}&search=Day11`);
  assert.equal(page2.status, 200);
  assert.equal((page2.body.pagination as { page: number }).page, 2);

  const combined = await request(
    `/api/products?search=milk&categoryId=${categoryId}&page=1&limit=10`,
  );
  assert.equal(combined.status, 200);
});

test("invalid product id and public hides inactive products", async () => {
  const invalid = await request("/api/products/not-a-uuid");
  assert.equal(invalid.status, 400);

  const missing = await request("/api/products/00000000-0000-4000-8000-000000000099");
  assert.equal(missing.status, 404);

  const byId = await request(`/api/products/${productId}`);
  assert.equal(byId.status, 200);

  const deactivated = await authJson(adminToken, "DELETE", `/api/products/${productId}`);
  assert.equal(deactivated.status, 200);

  const hidden = await request(`/api/products/${productId}`);
  assert.equal(hidden.status, 404);

  const adminSees = await authJson(adminToken, "GET", `/api/products/${productId}`);
  assert.equal(adminSees.status, 200);

  const categoryOff = await authJson(adminToken, "DELETE", `/api/categories/${categoryId}`);
  assert.equal(categoryOff.status, 200);
  const categoryHidden = await request(`/api/categories/${categoryId}`);
  assert.equal(categoryHidden.status, 404);
});
