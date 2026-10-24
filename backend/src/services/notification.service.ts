import type { OrderStatus } from "@prisma/client";

import { getMessaging } from "../config/firebase";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { prisma } from "../utils/prisma";

export type NotificationPayload = {
  title: string;
  body: string;
  data: Record<string, string>;
};

export type NotificationSendResult = {
  invalidTokens: string[];
};

export type NotificationSender = (
  tokens: string[],
  payload: NotificationPayload,
) => Promise<NotificationSendResult>;

const STATUS_BODY: Record<OrderStatus, string | null> = {
  PENDING: null,
  CONFIRMED: "Your order has been confirmed.",
  PACKING: "Your order is being packed.",
  OUT_FOR_DELIVERY: "Your order is out for delivery.",
  DELIVERED: "Your order has been delivered.",
  CANCELLED: "Your order has been cancelled.",
};

const INVALID_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

let senderOverride: NotificationSender | null = null;

export const setNotificationSender = (sender: NotificationSender | null): void => {
  senderOverride = sender;
};

const isInvalidTokenError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  return INVALID_TOKEN_CODES.has(code);
};

const firebaseSender: NotificationSender = async (tokens, payload) => {
  const messaging = getMessaging();
  if (!messaging) {
    return { invalidTokens: [] };
  }

  const response = await messaging.sendEach(
    tokens.map((token) => ({
      token,
      notification: { title: payload.title, body: payload.body },
      data: payload.data,
      android: { notification: { channelId: "orders" } },
    })),
  );

  const invalidTokens: string[] = [];
  response.responses.forEach((result: { success: boolean; error?: unknown }, index: number) => {
    if (result.success) {
      return;
    }
    if (isInvalidTokenError(result.error)) {
      invalidTokens.push(tokens[index] ?? "");
      return;
    }
    if (result.error) {
      logger.error("FCM send failed for a device token", result.error);
    }
  });

  return { invalidTokens: invalidTokens.filter(Boolean) };
};

const resolveSender = (): NotificationSender => senderOverride ?? firebaseSender;

export const sendToTokens = async (
  tokens: string[],
  payload: NotificationPayload,
): Promise<void> => {
  const unique = [...new Set(tokens.map((token) => token.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return;
  }

  try {
    const { invalidTokens } = await resolveSender()(unique, payload);
    if (invalidTokens.length > 0) {
      await prisma.deviceToken.deleteMany({ where: { token: { in: invalidTokens } } });
    }
  } catch (error) {
    logger.error("Failed to send push notification", error);
  }
};

export const sendToUser = async (userId: string, payload: NotificationPayload): Promise<void> => {
  const rows = await prisma.deviceToken.findMany({
    where: { userId },
    select: { token: true },
  });
  await sendToTokens(
    rows.map((row) => row.token),
    payload,
  );
};

export const sendAdminNewOrderNotification = async (
  orderId: string,
  totalAmount: number,
  paymentMethod: "RAZORPAY" | "COD" = "RAZORPAY",
): Promise<void> => {
  const rows = await prisma.deviceToken.findMany({
    where: { user: { role: "ADMIN" } },
    select: { token: true },
  });
  const shortId = orderId.replace(/-/g, "").slice(0, 8);
  const amount = Number.isInteger(totalAmount) ? String(totalAmount) : totalAmount.toFixed(2);
  const payload: NotificationPayload =
    paymentMethod === "COD"
      ? {
          title: "New COD Order Received",
          body: `Order ${shortId} has been placed. Amount: ₹${amount}.`,
          data: {
            type: "ADMIN_ORDER_COD",
            orderId,
            paymentMethod: "COD",
          },
        }
      : {
          title: "New paid order",
          body: `Order ${shortId} — ₹${amount}`,
          data: {
            type: "ADMIN_ORDER_PAID",
            orderId,
          },
        };
  await sendToTokens(
    rows.map((row) => row.token),
    payload,
  );
};

export const sendOrderCreatedNotification = async (userId: string, orderId: string): Promise<void> => {
  await sendToUser(userId, {
    title: "Order Placed",
    body: "Your Sainik Mart order has been placed successfully.",
    data: {
      type: "ORDER_CREATED",
      orderId,
    },
  });
};

export const sendOrderStatusNotification = async (
  userId: string,
  orderId: string,
  status: OrderStatus,
): Promise<void> => {
  const body = STATUS_BODY[status];
  if (!body) {
    return;
  }

  await sendToUser(userId, {
    title: "Order Update",
    body,
    data: {
      type: "ORDER_STATUS_UPDATED",
      orderId,
      status,
    },
  });
};

export const registerDeviceToken = async (
  userId: string,
  token: string,
  platform: "ANDROID" | "IOS" | "WEB",
): Promise<{ registered: true }> => {
  await prisma.deviceToken.upsert({
    where: { token },
    create: { userId, token, platform },
    update: { userId, platform },
  });
  return { registered: true };
};

export const removeDeviceToken = async (userId: string, token: string): Promise<{ removed: true }> => {
  const existing = await prisma.deviceToken.findUnique({
    where: { token },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) {
    throw new AppError("Device token not found", 404);
  }

  await prisma.deviceToken.delete({ where: { token } });
  return { removed: true };
};
