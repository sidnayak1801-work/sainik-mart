import { Alert, StyleSheet, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppInfoLinks } from "@/components/AppInfoLinks";
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
  const { user, logout, deleteAccount, isAuthenticated } = useAuth();

  const onDeleteAccount = () => {
    Alert.alert(
      "Delete account?",
      "This removes your login, cart, and unused addresses. Past orders are kept in anonymised form.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteAccount().catch(() => {
              Alert.alert("Could not delete account", "Please try again or email hello@sainikmart.in.");
            });
          },
        },
      ],
    );
  };

  return (
    <Screen padded={false}>
      <View style={styles.hero}>
        <BrandLogo size="sm" />
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
        {user ? (
          <>
            <Text style={styles.name}>{user.name || "Sainik Mart customer"}</Text>
            {user.email ? <Text style={styles.meta}>{user.email}</Text> : null}
            <Text style={styles.meta}>{user.phone}</Text>
          </>
        ) : (
          <Text style={styles.meta}>Browse now. Sign in when you check out.</Text>
        )}
      </View>
      <View style={styles.menu}>
        {isAuthenticated ? (
          <>
            <MenuRow icon="receipt-outline" label="My Orders" onPress={() => navigation.navigate("Orders")} />
            <MenuRow
              icon="location-outline"
              label="Delivery addresses"
              onPress={() => navigation.navigate("AddressList")}
            />
          </>
        ) : (
          <>
            <MenuRow
              icon="log-in-outline"
              label="Continue with mobile number"
              onPress={() => navigation.navigate("Login", { redirect: "Profile" })}
            />
          </>
        )}
      </View>
      <View style={styles.menu}>
        <AppInfoLinks onOpen={(screen) => navigation.navigate(screen)} />
      </View>
      {isAuthenticated ? (
        <View style={styles.menu}>
          <MenuRow icon="log-out-outline" label="Sign out" danger onPress={() => void logout()} />
          <MenuRow icon="trash-outline" label="Delete account" danger onPress={onDeleteAccount} />
        </View>
      ) : null}
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
    color: theme.colors.primary,
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
