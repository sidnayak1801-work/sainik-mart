import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";
import type { Category } from "@/types/models";
import { cloudinaryImage } from "@/utils/image";

type CategoryTileProps = {
  category: Category;
  onPress: () => void;
};

export function CategoryTile({ category, onPress }: CategoryTileProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.tile}>
      {category.imageUrl ? (
        <Image
          source={{ uri: cloudinaryImage(category.imageUrl, "category") }}
          style={styles.image}
          contentFit="contain"
        />
      ) : (
        <View style={styles.image} />
      )}
      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: "25%",
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.muted,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "600",
    textAlign: "center",
    minHeight: 32,
  },
});
