import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/theme";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  footer?: ReactNode;
  backgroundColor?: string;
  safeBottom?: boolean;
};

export function Screen({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  padded = true,
  footer,
  backgroundColor,
  safeBottom = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = safeBottom && !footer ? Math.max(insets.bottom, theme.spacing.sm) : undefined;
  const contentStyle = [
    styles.content,
    !padded && styles.contentFlush,
    bottomPad !== undefined ? { paddingBottom: (padded ? theme.spacing.md : 0) + bottomPad } : null,
  ];
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={contentStyle}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, backgroundColor ? { backgroundColor } : null]} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {content}
        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  contentFlush: {
    padding: 0,
    gap: 0,
  },
});
