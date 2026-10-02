import { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { listAddresses } from "@/api/addresses";
import { AppInfoLinks } from "@/components/AppInfoLinks";
import { BrandLogo } from "@/components/BrandLogo";
import { MenuRow } from "@/components/MenuRow";
import { useAuth } from "@/context/AuthContext";
import { requireAuth } from "@/navigation/authRedirect";
import { getSelectedAddressId, setSelectedAddressId } from "@/storage/addressStorage";
import { theme } from "@/theme";
import type { Address } from "@/types/models";
import type { MainStackParamList } from "@/types/navigation";

type Navigation = NativeStackNavigationProp<MainStackParamList>;
type InfoScreenName = "About" | "Terms" | "Privacy" | "Contact";

export function StoreHeader() {
  const navigation = useNavigation<Navigation>();
  const { user, logout, isAuthenticated } = useAuth();
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

  const openScreen = (screen: InfoScreenName) => {
    closeMenu();
    navigation.navigate(screen);
  };

  const locationLabel = address ? `${address.city} - ${address.pincode}` : "Select location";

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
          <View style={styles.locationTitleRow}>
            <Text style={styles.locationTitle} numberOfLines={1}>
              Current Location
            </Text>
            <Ionicons name="chevron-down" size={14} color={theme.colors.text} />
          </View>
          <Text style={styles.locationMeta} numberOfLines={1}>
            {locationLabel}
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

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu} statusBarTranslucent>
        <View style={styles.drawerRoot}>
          <SafeAreaView style={styles.drawer} edges={["top", "left", "bottom"]}>
            <View style={styles.drawerHeader}>
              <Ionicons name="person-circle-outline" size={40} color={theme.colors.textSecondary} />
              <View style={styles.drawerHello}>
                <Text style={styles.helloTitle}>{user ? `Hello ${user.name}` : "Hello Guest"}</Text>
                <Text style={styles.helloSubtitle}>{user ? user.email : "Login to proceed"}</Text>
              </View>
            </View>

            {!isAuthenticated ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Login here"
                onPress={() => {
                  closeMenu();
                  navigation.navigate("Login", { redirect: "Profile" });
                }}
                style={styles.loginHere}
              >
                <Text style={styles.loginHereLabel}>Login Here</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </Pressable>
            ) : null}

            <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerList}>
              {isAuthenticated ? (
                <>
                  <MenuRow
                    icon="receipt-outline"
                    label="My Orders"
                    onPress={() => {
                      closeMenu();
                      navigation.navigate("MainTabs", { screen: "Orders" });
                    }}
                  />
                  <MenuRow
                    icon="location-outline"
                    label="Delivery addresses"
                    onPress={() => {
                      closeMenu();
                      navigation.navigate("AddressList");
                    }}
                  />
                </>
              ) : null}
              <AppInfoLinks onOpen={openScreen} />
              {isAuthenticated ? (
                <MenuRow
                  icon="log-out-outline"
                  label="Sign out"
                  danger
                  onPress={() => {
                    closeMenu();
                    void logout();
                  }}
                />
              ) : null}
            </ScrollView>
          </SafeAreaView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            onPress={closeMenu}
            style={styles.drawerScrim}
          />
        </View>
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
    minHeight: 64,
  },
  location: {
    flex: 1,
    gap: 1,
  },
  locationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  locationTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  locationMeta: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: "700",
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
  drawerRoot: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: theme.colors.scrim,
  },
  drawer: {
    width: "82%",
    backgroundColor: theme.colors.surface,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  drawerHello: {
    flex: 1,
    gap: 2,
  },
  helloTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "700",
  },
  helloSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
  loginHere: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    minHeight: 44,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  loginHereLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  drawerScroll: {
    flex: 1,
  },
  drawerList: {
    paddingBottom: theme.spacing.lg,
  },
  drawerScrim: {
    flex: 1,
  },
});
