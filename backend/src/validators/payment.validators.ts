import { z } from "zod";

export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

const optionalText = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.string().min(1).optional(),
);

const isAllowedReturnUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "sainikmart:" || parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export const checkoutPageQuerySchema = z.object({
  keyId: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.coerce.number().int().positive(),
  currency: z.string().length(3).default("INR"),
  name: z.string().min(1).max(120),
  returnUrl: z.string().min(1).refine(isAllowedReturnUrl, "Invalid returnUrl"),
  prefillName: optionalText,
  prefillEmail: optionalText,
  prefillContact: optionalText,
});

export type CheckoutPageQuery = z.infer<typeof checkoutPageQuerySchema>;
