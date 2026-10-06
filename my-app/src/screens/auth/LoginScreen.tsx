import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { requestOtp } from "@/api/auth";
import { Button } from "@/components/Button";
import { AuthScreenChrome, AuthTextLink } from "@/components/AuthScreenChrome";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/Input";
import { toAuthErrorMessage, useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { continueAfterAuth } from "@/navigation/authRedirect";
import { theme } from "@/theme";
import type { MainStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "Login">;

export function LoginScreen({ navigation, route }: Props) {
  const { login } = useAuth();
  const { syncAfterAuth } = useCart();
  const redirect = route.params?.redirect;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [requestingCode, setRequestingCode] = useState(false);

  const validatePasswordLogin = (): boolean => {
    const next: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) next.identifier = "Email or phone is required.";
    if (!password) next.password = "Password is required.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (submitting || requestingCode) return;
    setFormError(null);
    if (!validatePasswordLogin()) return;

    setSubmitting(true);
    try {
      await login({ identifier: identifier.trim(), password });
      await syncAfterAuth();
      continueAfterAuth(navigation, redirect);
    } catch (error) {
      setFormError(toAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const onUseCode = async () => {
    if (submitting || requestingCode) return;
    setFormError(null);
    if (!identifier.trim()) {
      setFieldErrors({ identifier: "Email or phone is required." });
      return;
    }
    setFieldErrors({});

    setRequestingCode(true);
    try {
      const result = await requestOtp(identifier.trim());
      navigation.navigate("VerifyCode", {
        identifier: identifier.trim(),
        redirect,
        expiresInSec: result.expiresInSec,
        devCode: result.devCode,
      });
    } catch (error) {
      setFormError(toAuthErrorMessage(error));
    } finally {
      setRequestingCode(false);
    }
  };

  return (
    <AuthScreenChrome
      title="Login"
      subtitle="Sign in with your email or phone."
      logo
      onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      footer={
        <View style={styles.links}>
          <AuthTextLink
            prompt="Don't have an account?"
            action="Register"
            onPress={() => navigation.navigate("Register", redirect ? { redirect } : undefined)}
            disabled={submitting || requestingCode}
          />
          <AuthTextLink
            prompt=""
            action="Use 6-digit code"
            onPress={() => void onUseCode()}
            disabled={submitting || requestingCode}
          />
        </View>
      }
    >
      <Input
        label="Email or phone"
        placeholder="email or phone"
        value={identifier}
        onChangeText={setIdentifier}
        error={fieldErrors.identifier}
        autoCapitalize="none"
        keyboardType="email-address"
        englishOnly
        textContentType="username"
      />
      <Input
        label="Password"
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        secureTextEntry
        englishOnly
        textContentType="password"
      />
      {formError ? <ErrorMessage message={formError} /> : null}
      <Button
        title="Login"
        onPress={() => void onSubmit()}
        loading={submitting}
        disabled={submitting || requestingCode}
      />
    </AuthScreenChrome>
  );
}

const styles = StyleSheet.create({
  links: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
});
