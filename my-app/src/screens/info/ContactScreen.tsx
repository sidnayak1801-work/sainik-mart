import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { MainStackParamList } from "@/types/navigation";
import { APP_NAME, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/utils/constants";

type Props = NativeStackScreenProps<MainStackParamList, "Contact">;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const openLink = async (url: string, fallback: string, setError: (message: string) => void) => {
  try {
    await Linking.openURL(url);
  } catch {
    setError(fallback);
  }
};

export function ContactScreen(_props: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const validate = (): boolean => {
    const next: { name?: string; email?: string; message?: string } = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!emailPattern.test(email.trim())) next.email = "Enter a valid email.";
    if (!message.trim()) next.message = "Message is required.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSend = async () => {
    if (sending) return;
    setFormError(null);
    if (!validate()) return;

    setSending(true);
    const subject = encodeURIComponent(`${APP_NAME} support`);
    const body = encodeURIComponent(`Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`);
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(url);
    } catch {
      setFormError("Unable to open Mail. You can write to us at " + SUPPORT_EMAIL + ".");
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.intro}>
        Questions about an order, delivery, or the catalogue? Reach the Sainik Mart desk or send a message below.
      </Text>

      <Card style={styles.contactCard}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Email ${SUPPORT_EMAIL}`}
          onPress={() =>
            void openLink(`mailto:${SUPPORT_EMAIL}`, `Unable to open Mail. Write to ${SUPPORT_EMAIL}.`, setFormError)
          }
        >
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.cardValue}>{SUPPORT_EMAIL}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Call ${SUPPORT_PHONE}`}
          onPress={() =>
            void openLink(`tel:${SUPPORT_PHONE}`, `Unable to start a call. Dial ${SUPPORT_PHONE}.`, setFormError)
          }
        >
          <Text style={styles.cardLabel}>Phone</Text>
          <Text style={styles.cardValue}>{SUPPORT_PHONE}</Text>
        </Pressable>
      </Card>

      <Input
        label="Your name"
        placeholder="name"
        value={name}
        onChangeText={setName}
        error={fieldErrors.name}
        autoCapitalize="words"
        englishOnly
        textContentType="name"
      />
      <Input
        label="Your email"
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
        autoCapitalize="none"
        keyboardType="email-address"
        englishOnly
        textContentType="emailAddress"
      />
      <View style={styles.messageWrap}>
        <Text style={styles.messageLabel}>Message</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="How can we help?"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          textAlignVertical="top"
          autoCapitalize="sentences"
          autoCorrect={false}
          style={[styles.messageInput, fieldErrors.message ? styles.messageError : null]}
        />
        {fieldErrors.message ? <Text style={styles.fieldError}>{fieldErrors.message}</Text> : null}
      </View>

      {formError ? <ErrorMessage message={formError} /> : null}
      <Button title="Send message" onPress={() => void onSend()} loading={sending} disabled={sending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.heading,
    fontWeight: "700",
    color: theme.colors.text,
  },
  intro: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  contactCard: {
    gap: theme.spacing.md,
  },
  cardLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: "600",
  },
  cardValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: "700",
    marginTop: 2,
  },
  messageWrap: {
    gap: theme.spacing.xs,
  },
  messageLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "600",
  },
  messageInput: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.xs,
    minHeight: 120,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
  messageError: {
    borderColor: theme.colors.danger,
  },
  fieldError: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
  },
});
