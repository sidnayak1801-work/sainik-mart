import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { after, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

import { createApp } from "./app";
import { env } from "./config/env";
import {
  sendToUser,
  setNotificationSender,
  type NotificationPayload,
} from "./services/notification.service";
import { setRazorpayOrdersClient } from "./services/razorpay.service";
import { prisma } from "./utils/prisma";

setRazorpayOrdersClient({
  create: async ({ amount, currency, receipt }) => ({
    id: `order_test_${receipt.replace(/-/g, "").slice(0, 14)}`,
    amount,
    currency,
  }),
});

type JsonResponse = {
  status: number;
  body: Record<string, unknown>;
};

type AuthData = {
  accessToken: string;
  user: { id: string };
};

const notificationCalls: Array<{ tokens: string[]; payload: NotificationPayload }> = [];

const recordSender = async (tokens: string[], payload: NotificationPayload) => {
  notificationCalls.push({ tokens, payload });
  return { invalidTokens: [] };
};

let server: Server;
let baseUrl = "";
let stamp = "";
let customerAId = "";
let customerBId = "";
let customerAToken = "";
let customerBToken = "";
let adminToken = "";
let categoryId = "";
let productId = "";
let addressAId = "";

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

before(async () => {
  setNotificationSender(recordSender);
  stamp = `${Date.now()}`;
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const info = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${info.port}`;

  const register = async (name: string, email: string, phone: string) => {
    const result = await json("POST", "/api/auth/register", {
      name,
      email,
      phone,
      password: "password123",
    });
    assert.equal(result.status, 201);
    return result.body.data as AuthData;
  };

  const customerA = await register("Day32 A", `d32.a.${stamp}@example.com`, `+61${stamp.slice(-10)}`);
  const customerB = await register("Day32 B", `d32.b.${stamp}@example.com`, `+62${stamp.slice(-10)}`);
  customerAId = customerA.user.id;
  customerBId = customerB.user.id;
  customerAToken = customerA.accessToken;
  customerBToken = customerB.accessToken;

  const adminReg = await register("Day32 Admin", `d32.admin.${stamp}@example.com`, `+63${stamp.slice(-10)}`);
  await prisma.user.update({
    where: { id: adminReg.user.id },
    data: { role: "ADMIN" },
  });
  const adminLogin = await json("POST", "/api/auth/login", {
    identifier: `d32.admin.${stamp}@example.com`,
    password: "password123",
  });
  adminToken = (adminLogin.body.data as AuthData).accessToken;

  const category = await authJson(adminToken, "POST", "/api/categories", {
    name: `Day32 ${stamp} Push Cat`,
  });
  categoryId = (category.body.data as { id: string }).id;

  const product = await authJson(adminToken, "POST", "/api/products", {
    name: `Day32 ${stamp} Milk`,
    description: "Milk",
    price: 40,
    stockQuantity: 20,
    categoryId,
  });
  productId = (product.body.data as { id: string }).id;

  const address = await authJson(customerAToken, "POST", "/api/addresses", {
    addressLine: "1 Push Lane",
    city: "Delhi",
    pincode: "110001",
  });
  addressAId = (address.body.data as { id: string }).id;
});

after(async () => {
  try {
    await prisma.deviceToken.deleteMany({
      where: { userId: { in: [customerAId, customerBId].filter(Boolean) } },
    });
    await prisma.order.deleteMany({ where: { userId: { in: [customerAId, customerBId].filter(Boolean) } } });
    await prisma.address.deleteMany({ where: { userId: { in: [customerAId, customerBId].filter(Boolean) } } });
    await prisma.cart.deleteMany({ where: { userId: { in: [customerAId, customerBId].filter(Boolean) } } });
    await prisma.product.deleteMany({ where: { name: { startsWith: `Day32 ${stamp}` } } });
    await prisma.category.deleteMany({ where: { name: { startsWith: `Day32 ${stamp}` } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: "d32.", contains: stamp } } });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("device token APIs require auth and reject invalid payloads", async () => {
  const missing = await json("POST", "/api/notifications/device-token", {
    token: "token-a",
    platform: "ANDROID",
  });
  assert.equal(missing.status, 401);

  const emptyToken = await authJson(customerAToken, "POST", "/api/notifications/device-token", {
    token: "",
    platform: "ANDROID",
  });
  assert.equal(emptyToken.status, 400);

  const badPlatform = await authJson(customerAToken, "POST", "/api/notifications/device-token", {
    token: "token-a",
    platform: "DESKTOP",
  });
  assert.equal(badPlatform.status, 400);
});

test("admin can register a WEB token and duplicates upsert", async () => {
  const first = await authJson(adminToken, "POST", "/api/notifications/device-token", {
    token: `d32-admin-web-${stamp}`,
    platform: "WEB",
  });
  assert.equal(first.status, 200);
  const again = await authJson(adminToken, "POST", "/api/notifications/device-token", {
    token: `d32-admin-web-${stamp}`,
    platform: "WEB",
  });
  assert.equal(again.status, 200);
  assert.equal(await prisma.deviceToken.count({ where: { token: `d32-admin-web-${stamp}` } }), 1);
});

test("registers, upserts, supports multiple devices, and enforces token ownership", async () => {
  const first = await authJson(customerAToken, "POST", "/api/notifications/device-token", {
    token: `d32-a-android-${stamp}`,
    platform: "ANDROID",
  });
  assert.equal(first.status, 200);
  assert.deepEqual(first.body.data, { registered: true });

  const again = await authJson(customerAToken, "POST", "/api/notifications/device-token", {
    token: `d32-a-android-${stamp}`,
    platform: "ANDROID",
  });
  assert.equal(again.status, 200);
  assert.equal(await prisma.deviceToken.count({ where: { token: `d32-a-android-${stamp}` } }), 1);

  const second = await authJson(customerAToken, "POST", "/api/notifications/device-token", {
    token: `d32-a-ios-${stamp}`,
    platform: "IOS",
  });
  assert.equal(second.status, 200);
  assert.equal(await prisma.deviceToken.count({ where: { userId: customerAId } }), 2);

  const reassigned = await authJson(customerBToken, "POST", "/api/notifications/device-token", {
    token: `d32-a-ios-${stamp}`,
    platform: "IOS",
  });
  assert.equal(reassigned.status, 200);
  const moved = await prisma.deviceToken.findUniqueOrThrow({ where: { token: `d32-a-ios-${stamp}` } });
  assert.equal(moved.userId, customerBId);

  const stolen = await authJson(customerAToken, "DELETE", "/api/notifications/device-token", {
    token: `d32-a-ios-${stamp}`,
  });
  assert.equal(stolen.status, 404);

  const removed = await authJson(customerBToken, "DELETE", "/api/notifications/device-token", {
    token: `d32-a-ios-${stamp}`,
  });
  assert.equal(removed.status, 200);
  assert.deepEqual(removed.body.data, { removed: true });
  assert.equal(await prisma.deviceToken.count({ where: { token: `d32-a-ios-${stamp}` } }), 0);
});

test("invalid FCM tokens are removed without dropping valid devices", async () => {
  await prisma.deviceToken.createMany({
    data: [
      { userId: customerAId, token: `d32-valid-b-${stamp}`, platform: "ANDROID" },
      { userId: customerAId, token: `d32-valid-c-${stamp}`, platform: "IOS" },
      { userId: customerAId, token: `d32-invalid-a-${stamp}`, platform: "ANDROID" },
    ],
  });

  setNotificationSender(async (tokens, payload) => {
    notificationCalls.push({ tokens, payload });
    return { invalidTokens: [`d32-invalid-a-${stamp}`] };
  });

  await sendToUser(customerAId, {
    title: "Order Update",
    body: "Your order has been confirmed.",
    data: { type: "ORDER_STATUS_UPDATED", orderId: "order-1", status: "CONFIRMED" },
  });

  assert.equal(await prisma.deviceToken.count({ where: { token: `d32-invalid-a-${stamp}` } }), 0);
  assert.equal(await prisma.deviceToken.count({ where: { token: `d32-valid-b-${stamp}` } }), 1);
  assert.equal(await prisma.deviceToken.count({ where: { token: `d32-valid-c-${stamp}` } }), 1);

  setNotificationSender(async (tokens, payload) => {
    notificationCalls.push({ tokens, payload });
    return { invalidTokens: [] };
  });
});

test("order create notifies and FCM failure does not fail the order", async () => {
  await authJson(customerAToken, "POST", "/api/notifications/device-token", {
    token: `d32-order-${stamp}`,
    platform: "ANDROID",
  });
  notificationCalls.length = 0;
  assert.equal(
    (await authJson(customerAToken, "POST", "/api/cart/items", { productId, quantity: 1 })).status,
    201,
  );
  const created = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressAId });
  assert.equal(created.status, 201);
  const orderId = (created.body.data as { id: string }).id;
  await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: "CANCELLED" },
  });
  const createdCall = notificationCalls.find(
    (call) => call.payload.data.type === "ORDER_CREATED" && call.payload.data.orderId === orderId,
  );
  assert.ok(createdCall);
  assert.equal(createdCall.payload.title, "Order Placed");

  setNotificationSender(async () => {
    throw new Error("FCM unavailable");
  });
  assert.equal(
    (await authJson(customerAToken, "POST", "/api/cart/items", { productId, quantity: 1 })).status,
    201,
  );
  const stillCreated = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressAId });
  assert.equal(stillCreated.status, 201);
  assert.ok((stillCreated.body.data as { id?: string }).id);

  setNotificationSender(async (tokens, payload) => {
    notificationCalls.push({ tokens, payload });
    return { invalidTokens: [] };
  });
});

test("admin status update notifies the customer and invalid transitions do not", async () => {
  notificationCalls.length = 0;
  await prisma.order.updateMany({
    where: {
      userId: customerAId,
      paymentMethod: "RAZORPAY",
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
    },
    data: { orderStatus: "CANCELLED" },
  });
  assert.equal(
    (await authJson(customerAToken, "POST", "/api/cart/items", { productId, quantity: 1 })).status,
    201,
  );
  const created = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressAId });
  assert.equal(created.status, 201);
  const orderId = (created.body.data as { id: string }).id;
  notificationCalls.length = 0;

  const skip = await authJson(adminToken, "PATCH", `/api/admin/orders/${orderId}/status`, {
    status: "PACKING",
  });
  assert.equal(skip.status, 400);
  assert.equal(notificationCalls.length, 0);

  const confirmed = await authJson(adminToken, "PATCH", `/api/admin/orders/${orderId}/status`, {
    status: "CONFIRMED",
  });
  assert.equal(confirmed.status, 200);
  assert.equal(notificationCalls.length, 1);
  assert.equal(notificationCalls[0]?.payload.data.type, "ORDER_STATUS_UPDATED");
  assert.equal(notificationCalls[0]?.payload.data.orderId, orderId);
  assert.equal(notificationCalls[0]?.payload.data.status, "CONFIRMED");
  assert.equal(notificationCalls[0]?.payload.body, "Your order has been confirmed.");
});

const signPayment = (razorpayOrderId: string, razorpayPaymentId: string): string => {
  assert.ok(env.RAZORPAY_KEY_SECRET);
  return createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
};

test("first paid order notifies admin tokens only and sender failure does not fail verify", async () => {
  const adminPush = `d32-admin-paid-${stamp}`;
  const customerPush = `d32-cust-paid-${stamp}`;
  assert.equal(
    (await authJson(adminToken, "POST", "/api/notifications/device-token", {
      token: adminPush,
      platform: "WEB",
    })).status,
    200,
  );
  assert.equal(
    (await authJson(customerAToken, "POST", "/api/notifications/device-token", {
      token: customerPush,
      platform: "ANDROID",
    })).status,
    200,
  );

  notificationCalls.length = 0;
  await prisma.cartItem.deleteMany({ where: { cart: { userId: customerAId } } });
  assert.equal((await authJson(customerAToken, "POST", "/api/cart/items", { productId, quantity: 1 })).status, 201);
  const created = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressAId });
  assert.equal(created.status, 201);
  const order = created.body.data as { id: string; razorpay?: { orderId: string } };
  assert.ok(order.razorpay?.orderId);
  assert.equal(
    notificationCalls.some((call) => call.payload.data.type === "ADMIN_ORDER_PAID"),
    false,
  );

  const paymentId = `pay_admin_${stamp}`;
  const verified = await authJson(customerAToken, "POST", "/api/payments/verify", {
    orderId: order.id,
    razorpayOrderId: order.razorpay.orderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signPayment(order.razorpay.orderId, paymentId),
  });
  assert.equal(verified.status, 200);
  const adminCall = notificationCalls.find((call) => call.payload.data.type === "ADMIN_ORDER_PAID");
  assert.ok(adminCall);
  assert.equal(adminCall.payload.data.orderId, order.id);
  assert.ok(adminCall.tokens.includes(adminPush));
  assert.equal(adminCall.tokens.includes(customerPush), false);

  notificationCalls.length = 0;
  const replay = await authJson(customerAToken, "POST", "/api/payments/verify", {
    orderId: order.id,
    razorpayOrderId: order.razorpay.orderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signPayment(order.razorpay.orderId, paymentId),
  });
  assert.equal(replay.status, 200);
  assert.equal(
    notificationCalls.some((call) => call.payload.data.type === "ADMIN_ORDER_PAID"),
    false,
  );

  setNotificationSender(async () => {
    throw new Error("FCM down");
  });
  await prisma.cartItem.deleteMany({ where: { cart: { userId: customerAId } } });
  assert.equal((await authJson(customerAToken, "POST", "/api/cart/items", { productId, quantity: 1 })).status, 201);
  const created2 = await authJson(customerAToken, "POST", "/api/orders", { addressId: addressAId });
  assert.equal(created2.status, 201);
  const order2 = created2.body.data as { id: string; razorpay?: { orderId: string } };
  assert.ok(order2.razorpay?.orderId);
  const pay2 = `pay_admin_fail_${stamp}`;
  const verified2 = await authJson(customerAToken, "POST", "/api/payments/verify", {
    orderId: order2.id,
    razorpayOrderId: order2.razorpay.orderId,
    razorpayPaymentId: pay2,
    razorpaySignature: signPayment(order2.razorpay.orderId, pay2),
  });
  assert.equal(verified2.status, 200);
  setNotificationSender(recordSender);
});

test("COD create notifies admins and sender failure does not fail the order", async () => {
  const adminPush = `d32-admin-cod-${stamp}`;
  assert.equal(
    (
      await authJson(adminToken, "POST", "/api/notifications/device-token", {
        token: adminPush,
        platform: "WEB",
      })
    ).status,
    200,
  );

  notificationCalls.length = 0;
  await prisma.cartItem.deleteMany({ where: { cart: { userId: customerAId } } });
  assert.equal((await authJson(customerAToken, "POST", "/api/cart/items", { productId, quantity: 1 })).status, 201);
  const created = await authJson(customerAToken, "POST", "/api/orders", {
    addressId: addressAId,
    paymentMethod: "COD",
  });
  assert.equal(created.status, 201);
  const orderId = (created.body.data as { id: string }).id;
  const adminCall = notificationCalls.find((call) => call.payload.data.type === "ADMIN_ORDER_COD");
  assert.ok(adminCall);
  assert.equal(adminCall.payload.data.orderId, orderId);
  assert.ok(adminCall.tokens.includes(adminPush));

  setNotificationSender(async () => {
    throw new Error("FCM down");
  });
  await prisma.cartItem.deleteMany({ where: { cart: { userId: customerAId } } });
  assert.equal((await authJson(customerAToken, "POST", "/api/cart/items", { productId, quantity: 1 })).status, 201);
  const created2 = await authJson(customerAToken, "POST", "/api/orders", {
    addressId: addressAId,
    paymentMethod: "COD",
  });
  assert.equal(created2.status, 201);
  assert.ok((created2.body.data as { id?: string }).id);
  setNotificationSender(recordSender);
});
