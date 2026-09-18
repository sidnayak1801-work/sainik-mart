import { StyleSheet, Text, View } from "react-native";

import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/theme";
import { APP_TAGLINE } from "@/utils/constants";

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <View style={styles.brand}>
        <BrandLogo size="sm" />
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
      </View>
      <Text style={styles.title}>Profile</Text>
      {user ? (
        <>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>{user.email}</Text>
          <Text style={styles.meta}>{user.phone}</Text>
        </>
      ) : (
        <Text style={styles.subtitle}>You are signed in.</Text>
      )}
      <Button title="Sign out" onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    color: theme.colors.gold,
    fontSize: theme.typography.caption,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.heading,
    fontWeight: "600",
    color: theme.colors.text,
  },
  meta: {
    color: theme.colors.textSecondary,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
});
