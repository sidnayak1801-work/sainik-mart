import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { requestOtp } from "@/api/auth";
import { AuthScreenChrome, AuthTextLink } from "@/components/AuthScreenChrome";
import { ErrorMessage } from "@/components/ErrorMessage";
import { OtpInput } from "@/components/OtpInput";
import { toAuthErrorMessage, useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { continueAfterAuth } from "@/navigation/authRedirect";
import { theme } from "@/theme";
import type { MainStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "VerifyCode">;

const RESEND_SECONDS = 60;

const maskIdentifier = (value: string): string => {
  if (value.includes("@")) {
    const [local, domain] = value.split("@");
    const visible = local.slice(0, 1) || "*";
    return `${visible}***@${domain}`;
  }

  const digits = value.replace(/\D/g, "");
  const last = digits.slice(-4) || "****";
  return `******${last}`;
};

const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export function VerifyCodeScreen({ navigation, route }: Props) {
  const { identifier, redirect, devCode: initialDevCode } = route.params;
  const { loginWithOtp } = useAuth();
  const { syncAfterAuth } = useCart();
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState(initialDevCode);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const submittedCode = useRef<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const onVerify = async (nextCode: string) => {
    if (submitting || nextCode.length !== 6) return;
    if (submittedCode.current === nextCode) return;
    submittedCode.current = nextCode;
    setFormError(null);
    setSubmitting(true);
    try {
      await loginWithOtp({ identifier, code: nextCode });
      await syncAfterAuth();
      continueAfterAuth(navigation, redirect);
    } catch (error) {
      submittedCode.current = null;
      setFormError(toAuthErrorMessage(error));
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const onChangeCode = (digits: string) => {
    setCode(digits);
    if (digits.length === 6) {
      void onVerify(digits);
    }
  };

  const onResend = async () => {
    if (resending || secondsLeft > 0) return;
    setFormError(null);
    setResending(true);
    try {
      const result = await requestOtp(identifier);
      setDevCode(result.devCode);
      setCode("");
      submittedCode.current = null;
      setSecondsLeft(RESEND_SECONDS);
    } catch (error) {
      setFormError(toAuthErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthScreenChrome
      title="6-digit code"
      subtitle={`Code sent to ${maskIdentifier(identifier)} unless you already have an account`}
      onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      footer={
        <View style={styles.footer}>
          {secondsLeft > 0 ? (
            <Text style={styles.resendWait}>Resend code in {formatCountdown(secondsLeft)}</Text>
          ) : (
            <AuthTextLink
              prompt=""
              action={resending ? "Sending code…" : "Resend code"}
              onPress={() => void onResend()}
              disabled={resending}
            />
          )}
          <AuthTextLink
            prompt=""
            action="Use password instead"
            onPress={() => navigation.navigate("Login", redirect ? { redirect } : undefined)}
            disabled={submitting}
          />
        </View>
      }
    >
      <OtpInput value={code} onChange={onChangeCode} error={Boolean(formError)} disabled={submitting} />
      {devCode ? <Text style={styles.devCode}>Dev code: {devCode}</Text> : null}
      {formError ? <ErrorMessage message={formError} /> : null}
    </AuthScreenChrome>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  resendWait: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
  },
  devCode: {
    fontSize: theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: theme.weight.medium,
  },
});
