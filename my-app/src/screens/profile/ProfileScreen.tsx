import { StyleSheet, Text } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/theme";

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
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
