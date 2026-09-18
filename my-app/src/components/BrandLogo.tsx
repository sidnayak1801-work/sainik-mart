import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

const SIZES = {
  sm: 56,
  md: 88,
  lg: 128,
} as const;

type BrandLogoProps = {
  size?: keyof typeof SIZES;
};

export function BrandLogo({ size = "md" }: BrandLogoProps) {
  const dim = SIZES[size];

  return (
    <View style={[styles.wrap, { width: dim, height: dim, borderRadius: dim / 2 }]}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={{ width: dim, height: dim, borderRadius: dim / 2 }}
        contentFit="cover"
        accessibilityLabel="Sainik Mart"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
});
