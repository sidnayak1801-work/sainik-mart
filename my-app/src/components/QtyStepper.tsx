import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type QtyStepperProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
  busy?: boolean;
  compact?: boolean;
};

export function QtyStepper({
  quantity,
  onDecrease,
  onIncrease,
  decreaseDisabled = false,
  increaseDisabled = false,
  busy = false,
  compact = false,
}: QtyStepperProps) {
  return (
    <View style={[styles.stepper, compact && styles.stepperCompact]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        onPress={onDecrease}
        disabled={decreaseDisabled || busy}
        style={[styles.stepButton, compact && styles.stepButtonCompact, (decreaseDisabled || busy) && styles.disabled]}
      >
        <Text style={[styles.stepLabel, compact && styles.stepLabelCompact]}>−</Text>
      </Pressable>
      <View style={[styles.qtyWrap, compact && styles.qtyWrapCompact]}>
        {busy ? (
          <ActivityIndicator color={theme.colors.primaryText} size="small" />
        ) : (
          <Text style={[styles.qty, compact && styles.qtyCompact]}>{quantity}</Text>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        onPress={onIncrease}
        disabled={increaseDisabled || busy}
        style={[styles.stepButton, compact && styles.stepButtonCompact, (increaseDisabled || busy) && styles.disabled]}
      >
        <Text style={[styles.stepLabel, compact && styles.stepLabelCompact]}>+</Text>
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
  stepperCompact: {
    minHeight: 32,
    minWidth: 92,
    paddingHorizontal: 2,
  },
  stepButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonCompact: {
    minWidth: 28,
    minHeight: 32,
  },
  stepLabel: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.h5,
    fontWeight: theme.weight.bold,
  },
  stepLabelCompact: {
    fontSize: theme.typography.body,
  },
  qtyWrap: {
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyWrapCompact: {
    minWidth: 22,
  },
  qty: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.h5,
    fontWeight: theme.weight.bold,
  },
  qtyCompact: {
    fontSize: theme.typography.caption,
  },
  disabled: {
    opacity: 0.65,
  },
});
