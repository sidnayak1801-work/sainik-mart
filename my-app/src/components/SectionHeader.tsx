import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type SectionHeaderProps = {
  title: string;
  onSeeAll?: () => void;
};

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll ? (
        <Pressable accessibilityRole="button" onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all &gt;</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: theme.weight.medium,
  },
  seeAll: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: theme.weight.semibold,
  },
});
