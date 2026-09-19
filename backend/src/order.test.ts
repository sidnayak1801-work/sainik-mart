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
  user: { id: string };
};

type OrderItemData = {
  id: string;
  productId: string | null;
  productName: string;
  price: number;
  quantity: number;
  total: number;
};

type OrderData = {
  id: string;
  addressId: string;
  orderStatus: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  items: OrderItemData[];
};

const MISSING_ID = "00000000-0000-4000-8000-000000000000";

let server: Server;
let baseUrl = "";
let stamp = "";
let customerAId = "";
let customerBId = "";
let customerAToken = "";
let customerBToken = "";
let adminToken = "";
let categoryId = "";
let addressAId = "";
let addressBId = "";
let productAId = "";
let productBId = "";
let productCId = "";
let productLowId = "";
let productSingleId = "";
let productPriceId = "";
let productInactiveId = "";

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

const orderOf = (result: JsonResponse): OrderData => result.body.data as OrderData;

const addToCart = (token: string, productId: string, quantity: number) =>
  authJson(token, "POST", "/api/cart/items", { productId, quantity });

before(async () => {
  stamp = `${Date.now()}`;
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const info = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${info.port}`;

  const registerCustomer = async (email: string, phone: string) => {
    const result = await json("POST", "/api/auth/register", {
      name: "Day19 Customer",
      email,
      phone,
      password: "password123",
    });
    assert.equal(result.status, 201);
    const data = result.body.data as AuthData;
    return { token: data.accessToken, id: data.user.id };
  };

  const customerA = await registerCustomer(`d19.a.${stamp}@example.com`, `+76${stamp.slice(-10)}`);
  const customerB = await registerCustomer(`d19.b.${stamp}@example.com`, `+77${stamp.slice(-10)}`);
  customerAToken = customerA.token;
  customerAId = customerA.id;
  customerBToken = customerB.token;
  customerBId = customerB.id;

  const adminReg = await json("POST", "/api/auth/register", {
    name: "Day19 Admin",
    email: `d19.admin.${stamp}@example.com`,
    phone: `+78${stamp.slice(-10)}`,
    password: "password123",
  });
  assert.equal(adminReg.status, 201);
  await prisma.user.update({
    where: { email: `d19.admin.${stamp}@example.com` },
    data: { role: "ADMIN" },
  });
  const adminLogin = await json("POST", "/api/auth/login", {
    identifier: `d19.admin.${stamp}@example.com`,
    password: "password123",
  });
  assert.equal(adminLogin.status, 200);
  adminToken = (adminLogin.body.data as AuthData).accessToken;

  const category = await authJson(adminToken, "POST", "/api/categories", {
    name: `Day19 ${stamp} Order Cat`,
  });
  assert.equal(category.status, 201);
  categoryId = (category.body.data as { id: string }).id;

  const createProduct = async (name: string, price: number, stockQuantity: number, discountPrice?: number) => {
    const result = await authJson(adminToken, "POST", "/api/products", {
      name: `Day19 ${stamp} ${name}`,
      description: name,
      price,
      ...(discountPrice === undefined ? {} : { discountPrice }),
      stockQuantity,
      categoryId,
    });
    assert.equal(result.status, 201);
    return (result.body.data as { id: string }).id;
  };

  productAId = await createProduct("Product A", 100, 20, 80);
  productBId = await createProduct("Product B", 50, 20);
  productCId = await createProduct("Product C", 25, 20);
  productLowId = await createProduct("Low Stock", 10, 2);
  productSingleId = await createProduct("Single Stock", 15, 1);
  productPriceId = await createProduct("Price Change", 100, 10);
  productInactiveId = await createProduct("Inactive Later", 30, 10);

  const addressA = await authJson(customerAToken, "POST", "/api/addresses", {
    addressLine: "12 Order Street",
    city: "Delhi",
    pincode: "110001",
  });
  assert.equal(addressA.status, 201);
  addressAId = (addressA.body.data as { id: string }).id;

  const addressB = await authJson(customerBToken, "POST", "/api/addresses", {
    addressLine: "88 Other Street",
    city: "Mumbai",
    pincode: "400001",
  });
  assert.equal(addressB.status, 201);
  addressBId = (addressB.body.data as { id: string }).id;
});

after(async () => {
  try {
    const userIds = [customerAId, customerBId].filter(Boolean);
    await prisma.order.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.address.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.cart.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.product.deleteMany({ where: { name: { startsWith: `Day19 ${stamp}` } } });
    await prisma.category.deleteMany({ where: { name: { startsWith: `Day19 ${stamp}` } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: "d19.", contains: stamp } } });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("create order requires a valid JWT and addressId", async () => {
  const missing = await json("POST", "/api/orders", { addressId: addressAId });
  assert.equal(missing.status, 401);

  const invalid = await json("POST", "/api/orders", { addressId: addressAId }, {
    Authorization: "Bearer not-a-token",
  });
  assert.equal(invalid.status, 401);

  const emptyBody = await authJson(customerAToken, "POST", "/api/orders", {});
  assert.equal(emptyBody.status, 400);

  const emptyId = await authJson(customerAToken, "POST", "/api/orders", { addressId: "" });
  assert.equal(emptyId.status, 400);
});

test("empty cart and invalid addresses are rejected", async () => {
  const beforeCount = await prisma.order.count({ where: { userId: customerBId } });
  const empty = await authJson(customerBToken, "POST", "/api/orders", { addressId: addressBId });
  assert.equal(empty.status, 400);
  assert.equal((empty.body as { message?: string }).message, "Cart is empty");
  assert.equal(await prisma.order.count({ where: { userId: customerBId } }), beforeCount);

  const missing = await authJson(customerAToken, "POST", "/api/orders", { addressId: MISSING_ID });
  assert.equal(missing.status, 404);
  assert.equal((missing.body as { message?: string }).message, "Address not found");

  const added = await addToCart(customerAToken, productAId, 1);
  assert.equal(added.status, 201);
  const cross = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressBId });
  assert.equal(cross.status, 404);
  assert.equal((cross.body as { message?: string }).message, "Address not found");
  assert.equal(await prisma.order.count({ where: { userId: customerAId } }), 0);
  const cart = await authJson(customerAToken, "GET", "/api/cart");
  assert.equal(((cart.body.data as { items: unknown[] }).items).length, 1);
  await authJson(customerAToken, "DELETE", `/api/cart/items/${(cart.body.data as { items: { id: string }[] }).items[0]?.id}`);
});

test("creates an order, snapshots prices, reduces stock, and clears the cart", async () => {
  assert.equal((await addToCart(customerAToken, productAId, 2)).status, 201);
  assert.equal((await addToCart(customerAToken, productBId, 1)).status, 201);

  const stockABefore = (await prisma.product.findUniqueOrThrow({ where: { id: productAId } })).stockQuantity;
  const stockBBefore = (await prisma.product.findUniqueOrThrow({ where: { id: productBId } })).stockQuantity;

  const created = await authJson(customerAToken, "POST", "/api/orders", {
    addressId: addressAId,
    totalAmount: 1,
    userId: customerBId,
  });
  assert.equal(created.status, 201);
  const order = orderOf(created);
  assert.equal(order.addressId, addressAId);
  assert.equal(order.orderStatus, "PENDING");
  assert.equal(order.paymentStatus, "PENDING");
  assert.equal(order.deliveryFee, 0);
  assert.equal(order.discount, 0);
  assert.equal(order.items.length, 2);
  const lineA = order.items.find((item) => item.productId === productAId);
  const lineB = order.items.find((item) => item.productId === productBId);
  assert.equal(lineA?.price, 80);
  assert.equal(lineA?.quantity, 2);
  assert.equal(lineA?.total, 160);
  assert.equal(lineB?.price, 50);
  assert.equal(lineB?.quantity, 1);
  assert.equal(lineB?.total, 50);
  assert.equal(order.subtotal, 210);
  assert.equal(order.totalAmount, 210);

  const stored = await prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    include: { items: true },
  });
  assert.equal(stored.userId, customerAId);

  assert.equal(
    (await prisma.product.findUniqueOrThrow({ where: { id: productAId } })).stockQuantity,
    stockABefore - 2,
  );
  assert.equal(
    (await prisma.product.findUniqueOrThrow({ where: { id: productBId } })).stockQuantity,
    stockBBefore - 1,
  );

  const cart = await authJson(customerAToken, "GET", "/api/cart");
  assert.equal(cart.status, 200);
  assert.deepEqual((cart.body.data as { items: unknown[] }).items, []);
});

test("uses current product price after a catalog change", async () => {
  assert.equal((await addToCart(customerAToken, productPriceId, 1)).status, 201);
  const patched = await authJson(adminToken, "PATCH", `/api/products/${productPriceId}`, { price: 120 });
  assert.equal(patched.status, 200);

  const created = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressAId });
  assert.equal(created.status, 201);
  const line = orderOf(created).items[0];
  assert.equal(line?.price, 120);
  assert.equal(line?.total, 120);
  assert.equal(orderOf(created).totalAmount, 120);
});

test("rejects insufficient stock and inactive products without writing an order", async () => {
  assert.equal((await addToCart(customerAToken, productLowId, 2)).status, 201);
  const item = await prisma.cartItem.findFirstOrThrow({
    where: { productId: productLowId, cart: { userId: customerAId } },
  });
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: 5 } });
  const stockBefore = (await prisma.product.findUniqueOrThrow({ where: { id: productLowId } })).stockQuantity;
  const ordersBefore = await prisma.order.count({ where: { userId: customerAId } });

  const oversold = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressAId });
  assert.equal(oversold.status, 400);
  assert.equal((oversold.body as { message?: string }).message, "Insufficient stock");
  assert.equal(await prisma.order.count({ where: { userId: customerAId } }), ordersBefore);
  assert.equal(
    (await prisma.product.findUniqueOrThrow({ where: { id: productLowId } })).stockQuantity,
    stockBefore,
  );
  const cartAfter = await authJson(customerAToken, "GET", "/api/cart");
  assert.equal((cartAfter.body.data as { items: { quantity: number }[] }).items[0]?.quantity, 5);

  await prisma.cartItem.deleteMany({ where: { cart: { userId: customerAId } } });

  assert.equal((await addToCart(customerAToken, productInactiveId, 1)).status, 201);
  const deactivated = await authJson(adminToken, "PATCH", `/api/products/${productInactiveId}`, {
    isActive: false,
  });
  assert.equal(deactivated.status, 200);
  const inactive = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressAId });
  assert.equal(inactive.status, 400);
  assert.equal((inactive.body as { message?: string }).message, "Product is not available");
  const stillInCart = await authJson(customerAToken, "GET", "/api/cart");
  assert.equal((stillInCart.body.data as { items: unknown[] }).items.length, 1);
  await prisma.cartItem.deleteMany({ where: { cart: { userId: customerAId } } });
});

test("sums multiple products and prevents oversell on last unit", async () => {
  assert.equal((await addToCart(customerAToken, productAId, 2)).status, 201);
  assert.equal((await addToCart(customerAToken, productBId, 3)).status, 201);
  assert.equal((await addToCart(customerAToken, productCId, 4)).status, 201);

  const created = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressAId });
  assert.equal(created.status, 201);
  const order = orderOf(created);
  assert.equal(order.items.find((item) => item.productId === productAId)?.total, 160);
  assert.equal(order.items.find((item) => item.productId === productBId)?.total, 150);
  assert.equal(order.items.find((item) => item.productId === productCId)?.total, 100);
  assert.equal(order.totalAmount, 410);

  assert.equal((await addToCart(customerAToken, productSingleId, 1)).status, 201);
  assert.equal((await addToCart(customerBToken, productSingleId, 1)).status, 201);

  const first = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressAId });
  const second = await authJson(customerBToken, "POST", "/api/orders", { addressId: addressBId });
  const statuses = [first.status, second.status].sort();
  assert.deepEqual(statuses, [201, 400]);
  assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: productSingleId } })).stockQuantity, 0);
  assert.equal(await prisma.order.count({ where: { userId: { in: [customerAId, customerBId] }, items: { some: { productId: productSingleId } } } }), 1);
});

test("rejects inactive category and blocks deleting an address used by an order", async () => {
  const category = await authJson(adminToken, "POST", "/api/categories", {
    name: `Day19 ${stamp} Inactive Cat`,
  });
  assert.equal(category.status, 201);
  const inactiveCategoryId = (category.body.data as { id: string }).id;

  const product = await authJson(adminToken, "POST", "/api/products", {
    name: `Day19 ${stamp} Category Product`,
    description: "Inactive category product",
    price: 40,
    stockQuantity: 5,
    categoryId: inactiveCategoryId,
  });
  assert.equal(product.status, 201);
  const productId = (product.body.data as { id: string }).id;

  assert.equal((await addToCart(customerAToken, productId, 1)).status, 201);
  const deactivated = await authJson(adminToken, "PATCH", `/api/categories/${inactiveCategoryId}`, {
    isActive: false,
  });
  assert.equal(deactivated.status, 200);

  const ordersBefore = await prisma.order.count({ where: { userId: customerAId } });
  const stockBefore = (await prisma.product.findUniqueOrThrow({ where: { id: productId } })).stockQuantity;
  const rejected = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressAId });
  assert.equal(rejected.status, 400);
  assert.equal((rejected.body as { message?: string }).message, "Product is not available");
  assert.equal(await prisma.order.count({ where: { userId: customerAId } }), ordersBefore);
  assert.equal(
    (await prisma.product.findUniqueOrThrow({ where: { id: productId } })).stockQuantity,
    stockBefore,
  );
  const cart = await authJson(customerAToken, "GET", "/api/cart");
  assert.equal((cart.body.data as { items: unknown[] }).items.length, 1);
  await prisma.cartItem.deleteMany({ where: { cart: { userId: customerAId } } });

  const deleted = await authJson(customerAToken, "DELETE", `/api/addresses/${addressAId}`);
  assert.equal(deleted.status, 409);
  assert.equal(
    (deleted.body as { message?: string }).message,
    "Address cannot be deleted because it is used by an order",
  );
});
