import { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { listAddresses } from "@/api/addresses";
import { BrandLogo } from "@/components/BrandLogo";
import { MenuRow } from "@/components/MenuRow";
import { useAuth } from "@/context/AuthContext";
import { requireAuth } from "@/navigation/authRedirect";
import { getSelectedAddressId, setSelectedAddressId } from "@/storage/addressStorage";
import { theme } from "@/theme";
import type { Address } from "@/types/models";
import type { MainStackParamList } from "@/types/navigation";

type Navigation = NativeStackNavigationProp<MainStackParamList>;

export function StoreHeader() {
  const navigation = useNavigation<Navigation>();
  const { logout, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [address, setAddress] = useState<Address | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadLocation = useCallback(async () => {
    if (!isAuthenticated) {
      setAddress(null);
      return;
    }
    try {
      const [storedId, addresses] = await Promise.all([getSelectedAddressId(), listAddresses()]);
      const match = addresses.find((item) => item.id === storedId) ?? addresses[0] ?? null;
      setAddress(match);
      if (match && match.id !== storedId) {
        await setSelectedAddressId(match.id);
      }
    } catch {
      setAddress(null);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      void loadLocation();
    }, [loadLocation]),
  );

  const onSearch = () => {
    const query = search.trim();
    if (!query) return;
    navigation.navigate("ProductList", { search: query, title: query });
  };

  const closeMenu = () => setMenuOpen(false);

  const locationLabel = address ? `${address.city} - ${address.pincode}` : "Select location";
  const locationHint = address
    ? address.addressLine
    : isAuthenticated
      ? "Add a delivery address"
      : "Sign in to set delivery";

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Menu" onPress={() => setMenuOpen(true)} hitSlop={8}>
          <Ionicons name="menu-outline" size={26} color={theme.colors.text} />
        </Pressable>
        <BrandLogo size="xs" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Current location"
          onPress={() => {
            if (!requireAuth(navigation, isAuthenticated, "AddressList")) return;
            navigation.navigate("AddressList", {
              selectForLocation: true,
              selectedAddressId: address?.id,
            });
          }}
          style={styles.location}
        >
          <Text style={styles.locationTitle} numberOfLines={1}>
            Current Location
          </Text>
          <Text style={styles.locationMeta} numberOfLines={1}>
            {locationLabel}
          </Text>
          <Text style={styles.locationHint} numberOfLines={1}>
            {locationHint}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={() => navigation.navigate("MainTabs", { screen: "Profile" })}
          hitSlop={8}
        >
          <Ionicons name="person-circle-outline" size={28} color={theme.colors.text} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Search" onPress={onSearch} hitSlop={8}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
        </Pressable>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
          placeholderTextColor={theme.colors.textSecondary}
          returnKeyType="search"
          onSubmitEditing={onSearch}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchInput}
        />
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>Menu</Text>
            {isAuthenticated ? (
              <>
                <MenuRow
                  label="My Orders"
                  onPress={() => {
                    closeMenu();
                    navigation.navigate("MainTabs", { screen: "Orders" });
                  }}
                />
                <MenuRow
                  label="Delivery addresses"
                  onPress={() => {
                    closeMenu();
                    navigation.navigate("AddressList");
                  }}
                />
                <MenuRow
                  label="Profile"
                  onPress={() => {
                    closeMenu();
                    navigation.navigate("MainTabs", { screen: "Profile" });
                  }}
                />
                <MenuRow
                  label="Sign out"
                  danger
                  onPress={() => {
                    closeMenu();
                    void logout();
                  }}
                />
              </>
            ) : (
              <>
                <MenuRow
                  label="Sign in"
                  onPress={() => {
                    closeMenu();
                    navigation.navigate("Login", { redirect: "Profile" });
                  }}
                />
                <MenuRow
                  label="Create account"
                  onPress={() => {
                    closeMenu();
                    navigation.navigate("Register", { redirect: "Profile" });
                  }}
                />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  location: {
    flex: 1,
    gap: 1,
  },
  locationTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  locationMeta: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
  locationHint: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.background,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    minHeight: 44,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(26, 36, 28, 0.35)",
    justifyContent: "flex-start",
    paddingTop: 72,
    paddingHorizontal: theme.spacing.md,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  sheetTitle: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
