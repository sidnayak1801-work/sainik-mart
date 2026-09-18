import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ApiError } from "@/api/client";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { toAuthErrorMessage, useAuth } from "@/context/AuthContext";
import { theme } from "@/theme";
import type { AuthStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{7,19}$/;
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

const normalizePhone = (value: string): string => {
  const trimmed = value.trim().replace(/[\s-]/g, "");
  if (INDIAN_MOBILE.test(trimmed)) {
    return `+91${trimmed}`;
  }
  return trimmed;
};

const fieldErrorsFromApi = (error: unknown): FieldErrors | null => {
  if (!(error instanceof ApiError) || error.status !== 400) {
    return null;
  }
  if (typeof error.data !== "object" || error.data === null || !("details" in error.data)) {
    return null;
  }
  const details = (error.data as { details?: { fieldErrors?: Record<string, string[] | undefined> } }).details;
  const fieldErrors = details?.fieldErrors;
  if (!fieldErrors) {
    return null;
  }

  const next: FieldErrors = {};
  const first = (key: keyof FieldErrors) => {
    const messages = fieldErrors[key];
    if (messages?.[0]) {
      next[key] = messages[0];
    }
  };
  first("name");
  first("email");
  first("phone");
  first("password");
  return Object.keys(next).length > 0 ? next : null;
};

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid email address.";
    if (!phone.trim()) next.phone = "Phone is required.";
    else if (!PHONE_PATTERN.test(normalizePhone(phone))) next.phone = "Enter a valid phone number.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (submitting) return;
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: normalizePhone(phone),
        password,
      });
    } catch (error) {
      const apiFields = fieldErrorsFromApi(error);
      if (apiFields) {
        setFieldErrors(apiFields);
      } else {
        setFormError(toAuthErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.brand}>
        <BrandLogo size="lg" />
      </View>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>Create an account with your name, email, and phone.</Text>
      <Input
        label="Name"
        placeholder="your name"
        value={name}
        onChangeText={setName}
        error={fieldErrors.name}
        autoCapitalize="words"
        englishOnly
        textContentType="name"
      />
      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
        keyboardType="email-address"
        englishOnly
        textContentType="emailAddress"
        autoComplete="email"
      />
      <Input
        label="Phone"
        placeholder="10-digit mobile or +91..."
        value={phone}
        onChangeText={setPhone}
        error={fieldErrors.phone}
        keyboardType="phone-pad"
        englishOnly
        textContentType="telephoneNumber"
        autoComplete="tel"
      />
      <Input
        label="Password"
        placeholder="at least 8 characters"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        secureTextEntry
        englishOnly
        textContentType="newPassword"
      />
      <Input
        label="Confirm password"
        placeholder="re-enter password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={fieldErrors.confirmPassword}
        secureTextEntry
        englishOnly
        textContentType="newPassword"
      />
      {formError ? <ErrorMessage message={formError} /> : null}
      <Button title="Register" onPress={() => void onSubmit()} loading={submitting} disabled={submitting} />
      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate("Login")}
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
