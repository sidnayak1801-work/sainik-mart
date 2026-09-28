import { StyleSheet, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BrandLogo } from "@/components/BrandLogo";
import { MenuRow } from "@/components/MenuRow";
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
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <Screen padded={false}>
      <View style={styles.hero}>
        <BrandLogo size="sm" />
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
        {user ? (
          <>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.meta}>{user.email}</Text>
            <Text style={styles.meta}>{user.phone}</Text>
          </>
        ) : (
          <Text style={styles.meta}>Browse now. Sign in when you check out.</Text>
        )}
      </View>
      <View style={styles.menu}>
        {isAuthenticated ? (
          <>
            <MenuRow label="My Orders" onPress={() => navigation.navigate("Orders")} />
            <MenuRow label="Delivery addresses" onPress={() => navigation.navigate("AddressList")} />
            <MenuRow label="Sign out" danger onPress={() => void logout()} />
          </>
        ) : (
          <>
            <MenuRow label="Sign in" onPress={() => navigation.navigate("Login", { redirect: "Profile" })} />
            <MenuRow label="Create account" onPress={() => navigation.navigate("Register", { redirect: "Profile" })} />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tagline: {
    color: theme.colors.gold,
    fontSize: theme.typography.caption,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.heading,
    fontWeight: "700",
    color: theme.colors.text,
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    textAlign: "center",
    paddingHorizontal: theme.spacing.md,
  },
  menu: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
});
