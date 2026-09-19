import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { deleteAddress, listAddresses } from "@/api/addresses";
import { ApiError } from "@/api/client";
import { AddressCard } from "@/components/AddressCard";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { Address } from "@/types/models";
import type { MainStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "AddressList">;

export function AddressListScreen({ navigation }: Props) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const next = await listAddresses();
      setAddresses(next);
      setSelectedAddressId((current) => {
        if (current && next.some((address) => address.id === current)) {
          return current;
        }
        return next[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load addresses.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const run = async () => {
        setError(null);
        try {
          const next = await listAddresses();
          if (cancelled) return;
          setAddresses(next);
          setSelectedAddressId((current) => {
            if (current && next.some((address) => address.id === current)) {
              return current;
            }
            return next[0]?.id ?? null;
          });
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof ApiError ? err.message : "Unable to load addresses.");
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      void run();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const confirmDelete = (address: Address) => {
    Alert.alert("Delete address?", "Are you sure you want to remove this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void onDelete(address.id);
        },
      },
    ]);
  };

  const onDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteAddress(id);
      const next = addresses.filter((address) => address.id !== id);
      setAddresses(next);
      setSelectedAddressId((current) => {
        if (current !== id) return current;
        return next[0]?.id ?? null;
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("This address cannot be deleted because it is used by an order.");
      } else {
        setError(err instanceof ApiError ? err.message : "Unable to delete address. Please try again.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const isEmpty = !loading && !error && addresses.length === 0;

  return (
    <Screen scroll={false}>
      <Text style={styles.section}>Saved Addresses</Text>
      {loading ? <Loading /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => void load()} /> : null}
      {isEmpty ? (
        <View style={styles.empty}>
          <EmptyState
            centered
            title="No saved addresses"
            description="Add your delivery address to continue with your order."
          />
          <Button title="+ Add Address" onPress={() => navigation.navigate("AddAddress")} />
        </View>
      ) : null}
      {!loading && addresses.length > 0 ? (
        <FlatList
          style={styles.listFlex}
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AddressCard
              address={item}
              selected={selectedAddressId === item.id}
              disabled={deletingId === item.id}
              onSelect={() => setSelectedAddressId(item.id)}
              onEdit={() => navigation.navigate("EditAddress", { addressId: item.id, address: item })}
              onDelete={() => confirmDelete(item)}
            />
          )}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            <Button title="+ Add Address" onPress={() => navigation.navigate("AddAddress")} />
          }
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: theme.typography.heading,
    fontWeight: "700",
    color: theme.colors.text,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  listFlex: {
    flex: 1,
  },
  list: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
});
