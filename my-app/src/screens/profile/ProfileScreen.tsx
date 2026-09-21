import { StyleSheet, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/theme";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";
import { APP_TAGLINE } from "@/utils/constants";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Profile">,
  NativeStackScreenProps<MainStackParamList>
>;

export function ProfileScreen({ navigation }: Props) {
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
      <Button title="My Orders" onPress={() => navigation.navigate("Orders")} />
      <Button title="Delivery addresses" onPress={() => navigation.navigate("AddressList")} />
      <Button title="Sign out" onPress={() => void logout()} variant="ghost" />
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
