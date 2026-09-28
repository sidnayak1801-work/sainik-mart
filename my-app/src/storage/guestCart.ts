import { secureStore } from "@/utils/secureStore";

const GUEST_CART_KEY = "sainik-mart.guestCart";

export type GuestCartLine = {
  productId: string;
  quantity: number;
};

export const getGuestLines = async (): Promise<GuestCartLine[]> => {
  try {
    const raw = await secureStore.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((line): line is GuestCartLine => {
      return (
        typeof line === "object" &&
        line !== null &&
        typeof (line as GuestCartLine).productId === "string" &&
        typeof (line as GuestCartLine).quantity === "number" &&
        (line as GuestCartLine).quantity > 0
      );
    });
  } catch {
    return [];
  }
};

export const setGuestLines = async (lines: GuestCartLine[]): Promise<void> => {
  try {
    await secureStore.setItem(GUEST_CART_KEY, JSON.stringify(lines));
  } catch {
    // Guest cart can still live in memory for the current session.
  }
};

export const clearGuestLines = async (): Promise<void> => {
  try {
    await secureStore.deleteItem(GUEST_CART_KEY);
  } catch {
    // Ignore storage failures on clear.
  }
};
