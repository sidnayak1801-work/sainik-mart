import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen } from "@/components/Screen";
import { LEGAL_PAGES } from "@/content/legal";
import { theme } from "@/theme";
import type { MainStackParamList } from "@/types/navigation";

type InfoRoute = "About" | "Terms" | "Privacy";

type Props = NativeStackScreenProps<MainStackParamList, InfoRoute>;

export function InfoScreen({ route }: Props) {
  const page = LEGAL_PAGES[route.name];

  return (
    <Screen>
      <Text style={styles.title}>{page.title}</Text>
      <Text style={styles.body}>{page.intro}</Text>
      {page.sections.map((section) => (
        <View key={section.heading ?? section.body} style={styles.section}>
          {section.heading ? <Text style={styles.heading}>{section.heading}</Text> : null}
          <Text style={styles.body}>{section.body}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.heading,
    fontWeight: "700",
    color: theme.colors.text,
  },
  heading: {
    fontSize: theme.typography.subheading,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  body: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
  },
  section: {
    gap: theme.spacing.xs,
  },
});
