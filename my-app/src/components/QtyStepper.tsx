import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type QtyStepperProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
  busy?: boolean;
};

export function QtyStepper({
  quantity,
  onDecrease,
  onIncrease,
  decreaseDisabled = false,
  increaseDisabled = false,
  busy = false,
}: QtyStepperProps) {
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        onPress={onDecrease}
        disabled={decreaseDisabled || busy}
        style={[styles.stepButton, (decreaseDisabled || busy) && styles.disabled]}
      >
        <Text style={styles.stepLabel}>−</Text>
      </Pressable>
      <View style={styles.qtyWrap}>
        {busy ? (
          <ActivityIndicator color={theme.colors.primaryText} />
        ) : (
          <Text style={styles.qty}>{quantity}</Text>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        onPress={onIncrease}
        disabled={increaseDisabled || busy}
        style={[styles.stepButton, (increaseDisabled || busy) && styles.disabled]}
      >
        <Text style={styles.stepLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.button,
    minHeight: 48,
    paddingHorizontal: theme.spacing.sm,
  },
  stepButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.h5,
    fontWeight: theme.weight.bold,
  },
  qtyWrap: {
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.h5,
    fontWeight: theme.weight.bold,
  },
  disabled: {
    opacity: 0.65,
  },
});
