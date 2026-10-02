import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export type RazorpayOrderResult = {
  id: string;
  amount: number;
  currency: string;
};

export type RazorpayOrdersClient = {
  create: (options: {
    amount: number;
    currency: string;
    receipt: string;
  }) => Promise<RazorpayOrderResult>;
};

let ordersClientOverride: RazorpayOrdersClient | null = null;

export const setRazorpayOrdersClient = (client: RazorpayOrdersClient | null): void => {
  ordersClientOverride = client;
};

const isTestRuntime = (): boolean => Boolean(process.env.NODE_TEST_CONTEXT);

const requireKeyId = (): string => {
  if (env.RAZORPAY_KEY_ID) {
    return env.RAZORPAY_KEY_ID;
  }
  if (ordersClientOverride || isTestRuntime()) {
    return "rzp_test_stub";
  }
  throw new AppError("Razorpay is not configured", 500);
};

const requireKeySecret = (): string => {
  if (env.RAZORPAY_KEY_SECRET) {
    return env.RAZORPAY_KEY_SECRET;
  }
  throw new AppError("Razorpay is not configured", 500);
};

export const getRazorpayKeyId = (): string => requireKeyId();

const stubOrdersClient: RazorpayOrdersClient = {
  create: async ({ amount, currency, receipt }) => ({
    id: `order_test_${receipt.replace(/-/g, "").slice(0, 14)}`,
    amount,
    currency,
  }),
};

const getOrdersClient = (): RazorpayOrdersClient => {
  if (ordersClientOverride) {
    return ordersClientOverride;
  }

  if (isTestRuntime()) {
    return stubOrdersClient;
  }

  const instance = new Razorpay({
    key_id: requireKeyId(),
    key_secret: requireKeySecret(),
  });

  return {
    create: async ({ amount, currency, receipt }) => {
      const created = await instance.orders.create({ amount, currency, receipt });
      return {
        id: String(created.id),
        amount: Number(created.amount),
        currency: String(created.currency ?? "INR"),
      };
    },
  };
};

export const createRazorpayOrder = async (input: {
  amountPaise: number;
  receipt: string;
}): Promise<RazorpayOrderResult> => {
  if (!Number.isInteger(input.amountPaise) || input.amountPaise <= 0) {
    throw new AppError("Invalid payment amount", 400);
  }

  try {
    return await getOrdersClient().create({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt,
    });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    logger.error("Razorpay order create failed", err);
    throw new AppError("Unable to start payment", 502);
  }
};

export const verifyPaymentSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean => {
  const expected = createHmac("sha256", requireKeySecret())
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  try {
    const left = Buffer.from(expected, "utf8");
    const right = Buffer.from(razorpaySignature, "utf8");
    if (left.length !== right.length) {
      return false;
    }
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
};
