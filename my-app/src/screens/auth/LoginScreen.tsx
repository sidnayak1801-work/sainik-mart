import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/Button";
import { BrandLogo } from "@/components/BrandLogo";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { toAuthErrorMessage, useAuth } from "@/context/AuthContext";
import { theme } from "@/theme";
import type { AuthStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) next.identifier = "Email or phone is required.";
    if (!password) next.password = "Password is required.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (submitting) return;
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({ identifier: identifier.trim(), password });
    } catch (error) {
      setFormError(toAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.brand}>
        <BrandLogo size="lg" />
      </View>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Sign in with your email or phone.</Text>
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
      <Button title="Login" onPress={() => void onSubmit()} loading={submitting} disabled={submitting} />
      <Button
        title="Don't have an account? Register"
        onPress={() => navigation.navigate("Register")}
        variant="ghost"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
});
