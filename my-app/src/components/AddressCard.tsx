import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";
import type { Address } from "@/types/models";

type AddressCardProps = {
  address: Address;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function AddressCard({
  address,
  selected,
  disabled = false,
  onSelect,
  onEdit,
  onDelete,
}: AddressCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      onPress={onSelect}
      disabled={disabled}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={[styles.radio, selected ? styles.radioSelected : null]}>
          {selected ? <View style={styles.radioDot} /> : null}
        </View>
        <View style={styles.body}>
          <Text style={styles.line}>{address.addressLine}</Text>
          <Text style={styles.meta}>
            {address.city} - {address.pincode}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onEdit}
          disabled={disabled}
          hitSlop={8}
          style={styles.action}
        >
          <Text style={styles.edit}>Edit</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onDelete}
          disabled={disabled}
          hitSlop={8}
          style={styles.action}
        >
          <Text style={styles.delete}>Delete</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    shadowColor: theme.colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.92,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioSelected: {
    borderColor: theme.colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  body: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  line: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.lg,
  },
  action: {
    minHeight: 44,
    justifyContent: "center",
  },
  edit: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  delete: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
});
