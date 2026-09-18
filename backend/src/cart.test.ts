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
};

type CartProduct = {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
};

type CartItem = {
  id: string;
  quantity: number;
  lineTotal: number;
  product: CartProduct;
};

type CartData = {
  id: string;
  items: CartItem[];
  subtotal: number;
};

let server: Server;
let baseUrl = "";
let stamp = "";
let customerAToken = "";
let customerBToken = "";
let adminToken = "";
let productAId = "";
let productBId = "";
let stockProductId = "";
let inactiveProductId = "";
let customerAItemId = "";

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

const authJson = (token: string, method: string, path: string, body?: unknown) =>
  json(method, path, body, { Authorization: `Bearer ${token}` });

const cartOf = (result: JsonResponse): CartData => result.body.data as CartData;

before(async () => {
  stamp = `${Date.now()}`;
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;

  const registerCustomer = async (email: string, phone: string) => {
    const result = await json("POST", "/api/auth/register", {
      name: "Day15 Customer",
      email,
      phone,
      password: "password123",
    });
    assert.equal(result.status, 201);
    return (result.body.data as AuthData).accessToken;
  };

  customerAToken = await registerCustomer(`d15.a.${stamp}@example.com`, `+71${stamp.slice(-10)}`);
  customerBToken = await registerCustomer(`d15.b.${stamp}@example.com`, `+72${stamp.slice(-10)}`);

  const adminReg = await json("POST", "/api/auth/register", {
    name: "Day15 Admin",
    email: `d15.admin.${stamp}@example.com`,
    phone: `+73${stamp.slice(-10)}`,
    password: "password123",
  });
  assert.equal(adminReg.status, 201);
  await prisma.user.update({
    where: { email: `d15.admin.${stamp}@example.com` },
    data: { role: "ADMIN" },
  });
  const adminLogin = await json("POST", "/api/auth/login", {
    identifier: `d15.admin.${stamp}@example.com`,
    password: "password123",
  });
  assert.equal(adminLogin.status, 200);
  adminToken = (adminLogin.body.data as AuthData).accessToken;

  const category = await authJson(adminToken, "POST", "/api/categories", {
    name: `Day15 ${stamp} Cart Cat`,
  });
  assert.equal(category.status, 201);
  const categoryId = (category.body.data as { id: string }).id;

  const productA = await authJson(adminToken, "POST", "/api/products", {
    name: `Day15 ${stamp} Product A`,
    description: "Discounted item",
    price: 100,
    discountPrice: 80,
    stockQuantity: 20,
    categoryId,
  });
  assert.equal(productA.status, 201);
  productAId = (productA.body.data as { id: string }).id;

  const productB = await authJson(adminToken, "POST", "/api/products", {
    name: `Day15 ${stamp} Product B`,
    description: "Regular item",
    price: 50,
    stockQuantity: 20,
    categoryId,
  });
  assert.equal(productB.status, 201);
  productBId = (productB.body.data as { id: string }).id;

  const stockProduct = await authJson(adminToken, "POST", "/api/products", {
    name: `Day15 ${stamp} Stock Item`,
    description: "Limited stock",
    price: 10,
    stockQuantity: 5,
    categoryId,
  });
  assert.equal(stockProduct.status, 201);
  stockProductId = (stockProduct.body.data as { id: string }).id;

  const inactiveProduct = await authJson(adminToken, "POST", "/api/products", {
    name: `Day15 ${stamp} Inactive Item`,
    description: "Not for sale",
    price: 15,
    stockQuantity: 10,
    categoryId,
    isActive: false,
  });
  assert.equal(inactiveProduct.status, 201);
  inactiveProductId = (inactiveProduct.body.data as { id: string }).id;
});

after(async () => {
  try {
    await prisma.user.deleteMany({
      where: { email: { startsWith: "d15.", contains: stamp } },
    });
    await prisma.product.deleteMany({ where: { name: { startsWith: `Day15 ${stamp}` } } });
    await prisma.category.deleteMany({ where: { name: { startsWith: `Day15 ${stamp}` } } });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("cart endpoints require a valid JWT", async () => {
  const missing = await request("/api/cart");
  assert.equal(missing.status, 401);

  const invalid = await request("/api/cart", {
    headers: { Authorization: "Bearer not-a-token" },
  });
  assert.equal(invalid.status, 401);

  const addMissing = await json("POST", "/api/cart/items", {
    productId: productAId,
    quantity: 1,
  });
  assert.equal(addMissing.status, 401);
});

test("new customer gets an empty cart", async () => {
  const result = await authJson(customerAToken, "GET", "/api/cart");
  assert.equal(result.status, 200);
  const cart = cartOf(result);
  assert.ok(cart.id);
  assert.deepEqual(cart.items, []);
  assert.equal(cart.subtotal, 0);
});

test("add item, add again, update, and delete cart flow", async () => {
  const added = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: productAId,
    quantity: 2,
  });
  assert.equal(added.status, 201);
  let cart = cartOf(added);
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0]?.quantity, 2);
  assert.equal(cart.items[0]?.lineTotal, 160);
  assert.equal(cart.subtotal, 160);
  customerAItemId = cart.items[0]?.id ?? "";

  const again = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: productAId,
    quantity: 1,
  });
  assert.equal(again.status, 201);
  cart = cartOf(again);
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0]?.quantity, 3);
  assert.equal(cart.items[0]?.lineTotal, 240);
  assert.equal(cart.subtotal, 240);

  const updated = await authJson(customerAToken, "PATCH", `/api/cart/items/${customerAItemId}`, {
    quantity: 2,
  });
  assert.equal(updated.status, 200);
  cart = cartOf(updated);
  assert.equal(cart.items[0]?.quantity, 2);
  assert.equal(cart.subtotal, 160);

  const withB = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: productBId,
    quantity: 3,
  });
  assert.equal(withB.status, 201);
  cart = cartOf(withB);
  assert.equal(cart.items.length, 2);
  assert.equal(cart.subtotal, 310);

  const afterGet = await authJson(customerAToken, "GET", "/api/cart");
  assert.equal(afterGet.status, 200);
  assert.equal(cartOf(afterGet).subtotal, 310);

  const removed = await authJson(customerAToken, "DELETE", `/api/cart/items/${customerAItemId}`);
  assert.equal(removed.status, 200);
  cart = cartOf(removed);
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0]?.product.id, productBId);
  assert.equal(cart.subtotal, 150);

  const emptied = await authJson(customerAToken, "DELETE", `/api/cart/items/${cart.items[0]?.id}`);
  assert.equal(emptied.status, 200);
  assert.deepEqual(cartOf(emptied).items, []);
  assert.equal(cartOf(emptied).subtotal, 0);
});

test("quantity and product validation", async () => {
  const zero = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: productAId,
    quantity: 0,
  });
  assert.equal(zero.status, 400);

  const negative = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: productAId,
    quantity: -1,
  });
  assert.equal(negative.status, 400);

  const decimal = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: productAId,
    quantity: 1.5,
  });
  assert.equal(decimal.status, 400);

  const badId = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: "not-a-uuid",
    quantity: 2,
  });
  assert.equal(badId.status, 400);

  const missing = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: "00000000-0000-4000-8000-000000000099",
    quantity: 1,
  });
  assert.equal(missing.status, 404);

  const inactive = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: inactiveProductId,
    quantity: 1,
  });
  assert.equal(inactive.status, 400);
});

test("stock validation adds quantities and does not reduce inventory", async () => {
  const tooMany = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: stockProductId,
    quantity: 6,
  });
  assert.equal(tooMany.status, 400);

  const first = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: stockProductId,
    quantity: 3,
  });
  assert.equal(first.status, 201);
  assert.equal(cartOf(first).items[0]?.quantity, 3);

  const second = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: stockProductId,
    quantity: 2,
  });
  assert.equal(second.status, 201);
  assert.equal(cartOf(second).items[0]?.quantity, 5);

  const overflow = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: stockProductId,
    quantity: 1,
  });
  assert.equal(overflow.status, 400);

  const stored = await prisma.product.findUnique({ where: { id: stockProductId } });
  assert.equal(stored?.stockQuantity, 5);

  const itemId = cartOf(second).items[0]?.id ?? "";
  const overPatch = await authJson(customerAToken, "PATCH", `/api/cart/items/${itemId}`, {
    quantity: 6,
  });
  assert.equal(overPatch.status, 400);

  const removed = await authJson(customerAToken, "DELETE", `/api/cart/items/${itemId}`);
  assert.equal(removed.status, 200);
});

test("user B cannot see or change user A's cart items", async () => {
  const added = await authJson(customerAToken, "POST", "/api/cart/items", {
    productId: productAId,
    quantity: 1,
  });
  assert.equal(added.status, 201);
  const itemId = cartOf(added).items[0]?.id ?? "";
  assert.ok(itemId);

  const bCart = await authJson(customerBToken, "GET", "/api/cart");
  assert.equal(bCart.status, 200);
  assert.equal(cartOf(bCart).items.length, 0);
  assert.equal(cartOf(bCart).subtotal, 0);

  const bPatch = await authJson(customerBToken, "PATCH", `/api/cart/items/${itemId}`, {
    quantity: 4,
  });
  assert.equal(bPatch.status, 404);

  const bDelete = await authJson(customerBToken, "DELETE", `/api/cart/items/${itemId}`);
  assert.equal(bDelete.status, 404);

  const missing = await authJson(customerAToken, "DELETE", "/api/cart/items/00000000-0000-4000-8000-000000000099");
  assert.equal(missing.status, 404);

  const aCart = await authJson(customerAToken, "GET", "/api/cart");
  assert.equal(aCart.status, 200);
  assert.equal(cartOf(aCart).items.some((item) => item.id === itemId), true);
});
