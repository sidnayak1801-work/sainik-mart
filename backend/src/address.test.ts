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

type AddressData = {
  id: string;
  addressLine: string;
  city: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
};

const MISSING_ID = "00000000-0000-4000-8000-000000000000";

let server: Server;
let baseUrl = "";
let stamp = "";
let customerAId = "";
let customerBId = "";
let customerAToken = "";
let customerBToken = "";
let addressAId = "";
let addressBId = "";

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

const addressOf = (result: JsonResponse): AddressData => result.body.data as AddressData;
const addressesOf = (result: JsonResponse): AddressData[] => result.body.data as AddressData[];

before(async () => {
  stamp = `${Date.now()}`;
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;

  const registerCustomer = async (email: string, phone: string) => {
    const result = await json("POST", "/api/auth/register", {
      name: "Day17 Customer",
      email,
      phone,
      password: "password123",
    });
    assert.equal(result.status, 201);
    const data = result.body.data as AuthData;
    return { token: data.accessToken, id: data.user.id };
  };

  const customerA = await registerCustomer(`d17.a.${stamp}@example.com`, `+74${stamp.slice(-10)}`);
  const customerB = await registerCustomer(`d17.b.${stamp}@example.com`, `+75${stamp.slice(-10)}`);
  customerAToken = customerA.token;
  customerAId = customerA.id;
  customerBToken = customerB.token;
  customerBId = customerB.id;
});

after(async () => {
  try {
    await prisma.address.deleteMany({
      where: { userId: { in: [customerAId, customerBId].filter(Boolean) } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: "d17.", contains: stamp } },
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("address endpoints require a valid JWT", async () => {
  const missingGet = await request("/api/addresses");
  assert.equal(missingGet.status, 401);

  const invalidGet = await request("/api/addresses", {
    headers: { Authorization: "Bearer not-a-token" },
  });
  assert.equal(invalidGet.status, 401);

  const missingPost = await json("POST", "/api/addresses", {
    addressLine: "123 Main Street",
    city: "Delhi",
    pincode: "110001",
  });
  assert.equal(missingPost.status, 401);

  const missingPatch = await json("PATCH", `/api/addresses/${MISSING_ID}`, { city: "Mumbai" });
  assert.equal(missingPatch.status, 401);

  const missingDelete = await json("DELETE", `/api/addresses/${MISSING_ID}`);
  assert.equal(missingDelete.status, 401);
});

test("new customer gets an empty address list", async () => {
  const result = await authJson(customerBToken, "GET", "/api/addresses");
  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.deepEqual(addressesOf(result), []);
});

test("create rejects invalid address data", async () => {
  const missingLine = await authJson(customerAToken, "POST", "/api/addresses", {
    city: "Delhi",
    pincode: "110001",
  });
  assert.equal(missingLine.status, 400);

  const emptyLine = await authJson(customerAToken, "POST", "/api/addresses", {
    addressLine: "   ",
    city: "Delhi",
    pincode: "110001",
  });
  assert.equal(emptyLine.status, 400);

  const missingCity = await authJson(customerAToken, "POST", "/api/addresses", {
    addressLine: "123 Main Street",
    pincode: "110001",
  });
  assert.equal(missingCity.status, 400);

  for (const pincode of ["11000", "ABC123", "1234567"]) {
    const invalidPin = await authJson(customerAToken, "POST", "/api/addresses", {
      addressLine: "123 Main Street",
      city: "Delhi",
      pincode,
    });
    assert.equal(invalidPin.status, 400);
  }

  const invalidLat = await authJson(customerAToken, "POST", "/api/addresses", {
    addressLine: "123 Main Street",
    city: "Delhi",
    pincode: "110001",
    latitude: 91,
  });
  assert.equal(invalidLat.status, 400);

  const invalidLng = await authJson(customerAToken, "POST", "/api/addresses", {
    addressLine: "123 Main Street",
    city: "Delhi",
    pincode: "110001",
    longitude: -181,
  });
  assert.equal(invalidLng.status, 400);
});

test("create, list, update, and delete own addresses", async () => {
  const created = await authJson(customerAToken, "POST", "/api/addresses", {
    addressLine: "123 Main Street, Sector 10",
    city: "Delhi",
    pincode: "110001",
    latitude: 28.6139,
    longitude: 77.209,
    userId: customerBId,
  });
  assert.equal(created.status, 201);
  const address = addressOf(created);
  addressAId = address.id;
  assert.equal(address.addressLine, "123 Main Street, Sector 10");
  assert.equal(address.city, "Delhi");
  assert.equal(address.pincode, "110001");
  assert.equal(address.latitude, 28.6139);
  assert.equal(address.longitude, 77.209);

  const stored = await prisma.address.findUnique({ where: { id: addressAId } });
  assert.equal(stored?.userId, customerAId);

  const listed = await authJson(customerAToken, "GET", "/api/addresses");
  assert.equal(listed.status, 200);
  const list = addressesOf(listed);
  assert.equal(list.length, 1);
  assert.equal(list[0]?.id, addressAId);

  const otherList = await authJson(customerBToken, "GET", "/api/addresses");
  assert.equal(otherList.status, 200);
  assert.deepEqual(addressesOf(otherList), []);

  const updated = await authJson(customerAToken, "PATCH", `/api/addresses/${addressAId}`, {
    addressLine: "Updated Main Street",
    city: "Noida",
    pincode: "110002",
  });
  assert.equal(updated.status, 200);
  const afterUpdate = addressOf(updated);
  assert.equal(afterUpdate.addressLine, "Updated Main Street");
  assert.equal(afterUpdate.city, "Noida");
  assert.equal(afterUpdate.pincode, "110002");
  assert.equal(afterUpdate.latitude, 28.6139);

  const listedAgain = await authJson(customerAToken, "GET", "/api/addresses");
  assert.equal(addressesOf(listedAgain)[0]?.city, "Noida");

  const removed = await authJson(customerAToken, "DELETE", `/api/addresses/${addressAId}`);
  assert.equal(removed.status, 200);
  assert.equal(addressOf(removed).id, addressAId);

  const empty = await authJson(customerAToken, "GET", "/api/addresses");
  assert.equal(empty.status, 200);
  assert.deepEqual(addressesOf(empty), []);
});

test("cannot update or delete another user's address", async () => {
  const created = await authJson(customerBToken, "POST", "/api/addresses", {
    addressLine: "88 Park Avenue",
    city: "Mumbai",
    pincode: "400001",
  });
  assert.equal(created.status, 201);
  addressBId = addressOf(created).id;

  const patchOther = await authJson(customerAToken, "PATCH", `/api/addresses/${addressBId}`, {
    city: "Pune",
  });
  assert.equal(patchOther.status, 404);

  const deleteOther = await authJson(customerAToken, "DELETE", `/api/addresses/${addressBId}`);
  assert.equal(deleteOther.status, 404);

  const stillThere = await authJson(customerBToken, "GET", "/api/addresses");
  assert.equal(addressesOf(stillThere).length, 1);
  assert.equal(addressesOf(stillThere)[0]?.city, "Mumbai");

  const missingPatch = await authJson(customerAToken, "PATCH", `/api/addresses/${MISSING_ID}`, {
    city: "Delhi",
  });
  assert.equal(missingPatch.status, 404);

  const missingDelete = await authJson(customerAToken, "DELETE", `/api/addresses/${MISSING_ID}`);
  assert.equal(missingDelete.status, 404);

  const invalidPatch = await authJson(customerBToken, "PATCH", `/api/addresses/${addressBId}`, {
    pincode: "ABC123",
  });
  assert.equal(invalidPatch.status, 400);
});
