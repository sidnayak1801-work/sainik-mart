import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { theme } from "@/theme";
import type { RazorpayCheckoutPayload } from "@/types/models";
import { API_URL } from "@/utils/constants";

WebBrowser.maybeCompleteAuthSession();

const RETURN_URL = "sainikmart://razorpay";

type SuccessPayload = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type RazorpayPrefill = {
  name?: string;
  email?: string;
  contact?: string;
};

type Props = {
  visible: boolean;
  checkout: RazorpayCheckoutPayload | null;
  prefill?: RazorpayPrefill;
  onSuccess: (result: SuccessPayload) => void;
  onCancel: () => void;
  onFailed: (message: string) => void;
};

const queryValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

const buildCheckoutUrl = (checkout: RazorpayCheckoutPayload, prefill?: RazorpayPrefill): string => {
  const params = new URLSearchParams({
    keyId: checkout.keyId,
    orderId: checkout.orderId,
    amount: String(checkout.amount),
    currency: checkout.currency,
    name: checkout.name,
    returnUrl: RETURN_URL,
  });
  if (prefill?.name) params.set("prefillName", prefill.name);
  if (prefill?.email) params.set("prefillEmail", prefill.email);
  if (prefill?.contact) params.set("prefillContact", prefill.contact);
  return `${API_URL.replace(/\/$/, "")}/api/payments/checkout?${params.toString()}`;
};

export function RazorpayCheckoutModal({
  visible,
  checkout,
  prefill,
  onSuccess,
  onCancel,
  onFailed,
}: Props) {
  const settledRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onCancelRef = useRef(onCancel);
  const onFailedRef = useRef(onFailed);
  onSuccessRef.current = onSuccess;
  onCancelRef.current = onCancel;
  onFailedRef.current = onFailed;

  useEffect(() => {
    if (visible) {
      settledRef.current = false;
    }
  }, [visible]);

  const settle = (action: () => void) => {
    if (settledRef.current) return;
    settledRef.current = true;
    action();
  };

  useEffect(() => {
    if (!visible || !checkout) {
      return;
    }

    if (!API_URL || API_URL.includes("YOUR_LAN_IP")) {
      settle(() => onFailedRef.current("API URL is not configured. Cannot open payment."));
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const result = await WebBrowser.openAuthSessionAsync(
          buildCheckoutUrl(checkout, prefill),
          RETURN_URL,
        );

        if (cancelled) return;

        if (result.type !== "success" || !result.url) {
          settle(() => onCancelRef.current());
          return;
        }

        const params = Linking.parse(result.url).queryParams ?? {};
        if (queryValue(params.cancelled) === "1") {
          settle(() => onCancelRef.current());
          return;
        }

        const error = queryValue(params.error);
        if (error) {
          settle(() => onFailedRef.current(error));
          return;
        }

        const razorpayOrderId = queryValue(params.razorpay_order_id);
        const razorpayPaymentId = queryValue(params.razorpay_payment_id);
        const razorpaySignature = queryValue(params.razorpay_signature);
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
          settle(() => onFailedRef.current("Payment could not be confirmed. Please try again."));
          return;
        }

        settle(() =>
          onSuccessRef.current({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
        );
      } catch {
        if (!cancelled) {
          settle(() => onFailedRef.current("Unable to open payment. Please try again."));
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [visible, checkout, prefill?.name, prefill?.email, prefill?.contact]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.copy}>Opening payment…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    elevation: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  copy: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
});
