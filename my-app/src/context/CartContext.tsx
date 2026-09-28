import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import { getCart, mergeGuestCart } from "@/services/cartService";
import type { Cart } from "@/types/models";

type CartContextValue = {
  cart: Cart | null;
  itemCount: number;
  quantityFor: (productId: string) => number;
  refreshCart: () => Promise<void>;
  applyCart: (cart: Cart | null) => void;
  syncAfterAuth: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const countItems = (cart: Cart | null): number => {
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);

  const applyCart = useCallback((next: Cart | null) => {
    setCart(next);
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      applyCart(await getCart());
    } catch {
      if (!isAuthenticated) {
        applyCart({ id: "guest", items: [], subtotal: 0 });
      }
    }
  }, [applyCart, isAuthenticated]);

  const syncAfterAuth = useCallback(async () => {
    try {
      applyCart(await mergeGuestCart());
    } catch {
      await refreshCart();
    }
  }, [applyCart, refreshCart]);

  useEffect(() => {
    if (isAuthenticated) {
      void syncAfterAuth();
      return;
    }
    void refreshCart();
  }, [isAuthenticated, refreshCart, syncAfterAuth]);

  const quantityFor = useCallback(
    (productId: string): number => {
      return cart?.items.find((item) => item.product.id === productId)?.quantity ?? 0;
    },
    [cart],
  );

  const itemCount = countItems(cart);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount,
      quantityFor,
      refreshCart,
      applyCart,
      syncAfterAuth,
    }),
    [cart, itemCount, quantityFor, refreshCart, applyCart, syncAfterAuth],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = (): CartContextValue => {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used within CartProvider");
  }
  return value;
};
