import { createNavigationContainerRef } from "@react-navigation/native";

import type { MainStackParamList } from "@/types/navigation";

export const navigationRef = createNavigationContainerRef<MainStackParamList>();

let pendingOrderId: string | null = null;

export const navigateToOrderDetails = (orderId: string): void => {
  if (navigationRef.isReady()) {
    navigationRef.navigate("OrderDetails", { orderId });
    pendingOrderId = null;
    return;
  }
  pendingOrderId = orderId;
};

export const flushPendingNotificationNavigation = (): void => {
  if (!pendingOrderId || !navigationRef.isReady()) {
    return;
  }
  const orderId = pendingOrderId;
  pendingOrderId = null;
  navigationRef.navigate("OrderDetails", { orderId });
};
