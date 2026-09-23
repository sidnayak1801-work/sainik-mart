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

type AdminOrderSummary = {
  id: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
  customer: { name: string; email: string; phone: string };
};

type AdminOrderDetail = {
  id: string;
  addressId: string;
  orderStatus: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  items: OrderItemData[];
  address: { id: string; addressLine: string; city: string; pincode: string };
  customer: { id: string; name: string; email: string; phone: string };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
let productId = "";
let orderAPendingId = "";
let orderASecondId = "";
let orderBConfirmedId = "";
let customerAEmail = "";
let customerBEmail = "";
let customerAPhone = "";
let customerBPhone = "";

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

const addToCart = (token: string, productIdValue: string, quantity: number) =>
  authJson(token, "POST", "/api/cart/items", { productId: productIdValue, quantity });

const checkout = async (token: string, addressId: string) => {
  const created = await authJson(token, "POST", "/api/orders", { addressId });
  assert.equal(created.status, 201);
  return (created.body.data as { id: string }).id;
};

before(async () => {
  stamp = `${Date.now()}`;
  customerAEmail = `d27.a.${stamp}@example.com`;
  customerBEmail = `d27.b.${stamp}@example.com`;
  customerAPhone = `+81${stamp.slice(-10)}`;
  customerBPhone = `+82${stamp.slice(-10)}`;

  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const info = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${info.port}`;

  const registerCustomer = async (name: string, email: string, phone: string) => {
    const result = await json("POST", "/api/auth/register", {
      name,
      email,
      phone,
      password: "password123",
    });
    assert.equal(result.status, 201);
    const data = result.body.data as AuthData;
    return { token: data.accessToken, id: data.user.id };
  };

  const customerA = await registerCustomer(`Day27 Alpha ${stamp}`, customerAEmail, customerAPhone);
  const customerB = await registerCustomer(`Day27 Bravo ${stamp}`, customerBEmail, customerBPhone);
  customerAToken = customerA.token;
  customerAId = customerA.id;
  customerBToken = customerB.token;
  customerBId = customerB.id;

  const adminReg = await json("POST", "/api/auth/register", {
    name: "Day27 Admin",
    email: `d27.admin.${stamp}@example.com`,
    phone: `+83${stamp.slice(-10)}`,
    password: "password123",
  });
  assert.equal(adminReg.status, 201);
  await prisma.user.update({
    where: { email: `d27.admin.${stamp}@example.com` },
    data: { role: "ADMIN" },
  });
  const adminLogin = await json("POST", "/api/auth/login", {
    identifier: `d27.admin.${stamp}@example.com`,
    password: "password123",
  });
  assert.equal(adminLogin.status, 200);
  adminToken = (adminLogin.body.data as AuthData).accessToken;

  const category = await authJson(adminToken, "POST", "/api/categories", {
    name: `Day27 ${stamp} Order Cat`,
  });
  assert.equal(category.status, 201);
  categoryId = (category.body.data as { id: string }).id;

  const product = await authJson(adminToken, "POST", "/api/products", {
    name: `Day27 ${stamp} Rice 1kg`,
    description: "Admin order product",
    price: 80,
    stockQuantity: 50,
    categoryId,
  });
  assert.equal(product.status, 201);
  productId = (product.body.data as { id: string }).id;

  const addressA = await authJson(customerAToken, "POST", "/api/addresses", {
    addressLine: "27 Admin Street",
    city: "Pune",
    pincode: "411001",
  });
  assert.equal(addressA.status, 201);
  addressAId = (addressA.body.data as { id: string }).id;

  const addressB = await authJson(customerBToken, "POST", "/api/addresses", {
    addressLine: "90 Bravo Road",
    city: "Nagpur",
    pincode: "440001",
  });
  assert.equal(addressB.status, 201);
  addressBId = (addressB.body.data as { id: string }).id;

  assert.equal((await addToCart(customerAToken, productId, 2)).status, 201);
  orderAPendingId = await checkout(customerAToken, addressAId);

  assert.equal((await addToCart(customerAToken, productId, 1)).status, 201);
  orderASecondId = await checkout(customerAToken, addressAId);

  assert.equal((await addToCart(customerBToken, productId, 3)).status, 201);
  orderBConfirmedId = await checkout(customerBToken, addressBId);
  await prisma.order.update({
    where: { id: orderBConfirmedId },
    data: { orderStatus: "CONFIRMED" },
  });
});

after(async () => {
  try {
    const userIds = [customerAId, customerBId].filter(Boolean);
    await prisma.order.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.address.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.cart.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.product.deleteMany({ where: { name: { startsWith: `Day27 ${stamp}` } } });
    await prisma.category.deleteMany({ where: { name: { startsWith: `Day27 ${stamp}` } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: "d27.", contains: stamp } } });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("admin order list and detail require admin auth", async () => {
  const missingList = await json("GET", "/api/admin/orders");
  assert.equal(missingList.status, 401);

  const invalidList = await json("GET", "/api/admin/orders", undefined, {
    Authorization: "Bearer not-a-token",
  });
  assert.equal(invalidList.status, 401);

  const customerList = await authJson(customerAToken, "GET", "/api/admin/orders");
  assert.equal(customerList.status, 403);

  const customerDetail = await authJson(customerAToken, "GET", `/api/admin/orders/${orderAPendingId}`);
  assert.equal(customerDetail.status, 403);

  const customerPatch = await authJson(customerAToken, "PATCH", `/api/admin/orders/${orderAPendingId}/status`, {
    status: "CONFIRMED",
  });
  assert.equal(customerPatch.status, 403);

  const missingPatch = await json("PATCH", `/api/admin/orders/${orderAPendingId}/status`, { status: "CONFIRMED" });
  assert.equal(missingPatch.status, 401);
});

test("admin lists all customers' orders with customer fields, filters, search, and pagination", async () => {
  const listed = await authJson(adminToken, "GET", `/api/admin/orders?search=${stamp}&limit=50`);
  assert.equal(listed.status, 200);
  const summaries = listed.body.data as AdminOrderSummary[];
  assert.equal(summaries.length, 3);
  assert.ok(summaries.every((order) => order.customer && order.customer.name && order.customer.email));
  assert.ok(summaries.some((order) => order.id === orderAPendingId && order.customer.email === customerAEmail));
  assert.ok(summaries.some((order) => order.id === orderBConfirmedId && order.customer.email === customerBEmail));
  const createdAts = summaries.map((order) => new Date(order.createdAt).getTime());
  assert.deepEqual(createdAts, [...createdAts].sort((a, b) => b - a));

  const customerList = await authJson(customerAToken, "GET", "/api/orders?limit=50");
  assert.equal(customerList.status, 200);
  const customerSummaries = customerList.body.data as Array<Record<string, unknown>>;
  assert.ok(customerSummaries.every((order) => !("customer" in order)));
  assert.ok(customerSummaries.every((order) => order.id !== orderBConfirmedId));

  const confirmed = await authJson(adminToken, "GET", `/api/admin/orders?search=${stamp}&status=CONFIRMED`);
  assert.equal(confirmed.status, 200);
  const confirmedItems = confirmed.body.data as AdminOrderSummary[];
  assert.equal(confirmedItems.length, 1);
  assert.equal(confirmedItems[0]?.id, orderBConfirmedId);
  assert.equal(confirmedItems[0]?.orderStatus, "CONFIRMED");

  const page1 = await authJson(adminToken, "GET", `/api/admin/orders?search=${stamp}&page=1&limit=1`);
  assert.equal(page1.status, 200);
  const page1Data = page1.body.data as AdminOrderSummary[];
  const pagination = page1.body.pagination as Pagination;
  assert.equal(page1Data.length, 1);
  assert.equal(pagination.page, 1);
  assert.equal(pagination.limit, 1);
  assert.equal(pagination.total, 3);
  assert.equal(pagination.totalPages, 3);
  assert.equal(page1Data[0]?.id, summaries[0]?.id);

  const page2 = await authJson(adminToken, "GET", `/api/admin/orders?search=${stamp}&page=2&limit=1`);
  assert.equal(page2.status, 200);
  assert.equal((page2.body.data as AdminOrderSummary[])[0]?.id, summaries[1]?.id);

  const byId = await authJson(adminToken, "GET", `/api/admin/orders?search=${orderAPendingId}`);
  assert.equal(byId.status, 200);
  assert.equal((byId.body.data as AdminOrderSummary[])[0]?.id, orderAPendingId);

  const byEmail = await authJson(adminToken, "GET", `/api/admin/orders?search=${encodeURIComponent(customerBEmail)}`);
  assert.equal(byEmail.status, 200);
  const emailHits = byEmail.body.data as AdminOrderSummary[];
  assert.equal(emailHits.length, 1);
  assert.equal(emailHits[0]?.id, orderBConfirmedId);

  const byPhone = await authJson(adminToken, "GET", `/api/admin/orders?search=${encodeURIComponent(customerAPhone)}`);
  assert.equal(byPhone.status, 200);
  const phoneHits = byPhone.body.data as AdminOrderSummary[];
  assert.ok(phoneHits.every((order) => order.customer.phone === customerAPhone));
  assert.equal(phoneHits.length, 2);

  const byName = await authJson(adminToken, "GET", `/api/admin/orders?search=${encodeURIComponent(`bravo ${stamp}`)}`);
  assert.equal(byName.status, 200);
  assert.equal((byName.body.data as AdminOrderSummary[])[0]?.id, orderBConfirmedId);
});

test("admin can read any order detail with snapshots and live address", async () => {
  const detail = await authJson(adminToken, "GET", `/api/admin/orders/${orderBConfirmedId}`);
  assert.equal(detail.status, 200);
  const order = detail.body.data as AdminOrderDetail;
  assert.equal(order.id, orderBConfirmedId);
  assert.equal(order.orderStatus, "CONFIRMED");
  assert.equal(order.customer.id, customerBId);
  assert.equal(order.customer.email, customerBEmail);
  assert.equal(order.address.id, addressBId);
  assert.equal(order.address.addressLine, "90 Bravo Road");
  assert.equal(order.address.city, "Nagpur");
  assert.equal(order.address.pincode, "440001");
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0]?.productName.includes("Rice 1kg"), true);
  assert.equal(order.items[0]?.price, 80);
  assert.equal(order.items[0]?.quantity, 3);
  assert.equal(order.items[0]?.total, 240);
  assert.equal(order.totalAmount, 240);
  assert.equal("price" in (order.items[0] ?? {}), true);

  const other = await authJson(customerAToken, "GET", `/api/orders/${orderBConfirmedId}`);
  assert.equal(other.status, 404);
  assert.equal((other.body as { message?: string }).message, "Order not found");
  assert.equal(other.body.data, undefined);

  const missing = await authJson(adminToken, "GET", `/api/admin/orders/${MISSING_ID}`);
  assert.equal(missing.status, 404);
  assert.equal((missing.body as { message?: string }).message, "Order not found");

  const malformed = await authJson(adminToken, "GET", "/api/admin/orders/not-a-uuid");
  assert.equal(malformed.status, 400);
  assert.equal((malformed.body as { message?: string }).message, "Validation failed");
});

test("admin status transitions follow the MVP path and reject illegal skips", async () => {
  const skip = await authJson(adminToken, "PATCH", `/api/admin/orders/${orderAPendingId}/status`, {
    status: "PACKING",
  });
  assert.equal(skip.status, 400);
  assert.equal((skip.body as { message?: string }).message, "Invalid status transition");

  const confirmed = await authJson(adminToken, "PATCH", `/api/admin/orders/${orderAPendingId}/status`, {
    status: "CONFIRMED",
  });
  assert.equal(confirmed.status, 200);
  assert.equal((confirmed.body.data as AdminOrderDetail).orderStatus, "CONFIRMED");

  const packing = await authJson(adminToken, "PATCH", `/api/admin/orders/${orderAPendingId}/status`, {
    status: "PACKING",
  });
  assert.equal(packing.status, 200);
  assert.equal((packing.body.data as AdminOrderDetail).orderStatus, "PACKING");

  const out = await authJson(adminToken, "PATCH", `/api/admin/orders/${orderAPendingId}/status`, {
    status: "OUT_FOR_DELIVERY",
  });
  assert.equal(out.status, 200);

  const delivered = await authJson(adminToken, "PATCH", `/api/admin/orders/${orderAPendingId}/status`, {
    status: "DELIVERED",
  });
  assert.equal(delivered.status, 200);
  assert.equal((delivered.body.data as AdminOrderDetail).orderStatus, "DELIVERED");

  const afterDelivered = await authJson(adminToken, "PATCH", `/api/admin/orders/${orderAPendingId}/status`, {
    status: "CANCELLED",
  });
  assert.equal(afterDelivered.status, 400);
  assert.equal((afterDelivered.body as { message?: string }).message, "Invalid status transition");

  const invalidEnum = await authJson(adminToken, "PATCH", `/api/admin/orders/${orderASecondId}/status`, {
    status: "SHIPPED",
  });
  assert.equal(invalidEnum.status, 400);
  assert.equal((invalidEnum.body as { message?: string }).message, "Validation failed");

  const badId = await authJson(adminToken, "PATCH", "/api/admin/orders/not-a-uuid/status", {
    status: "CONFIRMED",
  });
  assert.equal(badId.status, 400);

  const missing = await authJson(adminToken, "PATCH", `/api/admin/orders/${MISSING_ID}/status`, {
    status: "CONFIRMED",
  });
  assert.equal(missing.status, 404);
  assert.equal((missing.body as { message?: string }).message, "Order not found");
});

test("cancelling does not restock and historical item prices stay frozen", async () => {
  const stockBefore = (await prisma.product.findUniqueOrThrow({ where: { id: productId } })).stockQuantity;
  const cancelled = await authJson(adminToken, "PATCH", `/api/admin/orders/${orderASecondId}/status`, {
    status: "CANCELLED",
  });
  assert.equal(cancelled.status, 200);
  assert.equal((cancelled.body.data as AdminOrderDetail).orderStatus, "CANCELLED");
  assert.equal(
    (await prisma.product.findUniqueOrThrow({ where: { id: productId } })).stockQuantity,
    stockBefore,
  );

  const terminal = await authJson(adminToken, "PATCH", `/api/admin/orders/${orderASecondId}/status`, {
    status: "CONFIRMED",
  });
  assert.equal(terminal.status, 400);
  assert.equal((terminal.body as { message?: string }).message, "Invalid status transition");

  const patched = await authJson(adminToken, "PATCH", `/api/products/${productId}`, { price: 999 });
  assert.equal(patched.status, 200);

  const detail = await authJson(adminToken, "GET", `/api/admin/orders/${orderBConfirmedId}`);
  assert.equal(detail.status, 200);
  const order = detail.body.data as AdminOrderDetail;
  assert.equal(order.items[0]?.price, 80);
  assert.equal(order.items[0]?.total, 240);
  assert.equal(order.totalAmount, 240);
});
