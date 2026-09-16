import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { toAuthErrorMessage, useAuth } from "@/context/AuthContext";
import { theme } from "@/theme";
import type { AuthStackParamList } from "@/types/navigation";
import { APP_NAME } from "@/utils/constants";

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
    else if (!PHONE_PATTERN.test(phone.trim())) next.phone = "Enter a valid phone number.";
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
        phone: phone.trim(),
        password,
      });
    } catch (error) {
      setFormError(toAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.brand}>{APP_NAME}</Text>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>Create an account with your name, email, and phone.</Text>
      <Input
        label="Name"
        placeholder="your name"
        value={name}
        onChangeText={setName}
        error={fieldErrors.name}
        autoCapitalize="words"
      />
      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
        keyboardType="email-address"
      />
      <Input
        label="Phone"
        placeholder="+91XXXXXXXXXX"
        value={phone}
        onChangeText={setPhone}
        error={fieldErrors.phone}
        keyboardType="phone-pad"
      />
      <Input
        label="Password"
        placeholder="at least 8 characters"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        secureTextEntry
      />
      <Input
        label="Confirm password"
        placeholder="re-enter password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={fieldErrors.confirmPassword}
        secureTextEntry
      />
      {formError ? <ErrorMessage message={formError} /> : null}
      <Button title="Register" onPress={() => void onSubmit()} loading={submitting} disabled={submitting} />
      <Button title="Already have an account? Login" onPress={() => navigation.navigate("Login")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    fontSize: theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.primary,
    letterSpacing: 0.4,
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
