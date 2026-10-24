import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";

import { theme } from "@/theme";

type PromoCard = {
  key: string;
  title: string;
  subtitle: string;
  cta: string;
  backgroundColor: string;
  onPress: () => void;
};

type HomePromoCarouselProps = {
  cards: PromoCard[];
};

const CARD_WIDTH = 280;

export function HomePromoCarousel({ cards }: HomePromoCarouselProps) {
  const [index, setIndex] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + theme.spacing.sm));
    if (next !== index) {
      setIndex(next);
    }
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + theme.spacing.sm}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.track}
      >
        {cards.map((card) => (
          <View key={card.key} style={[styles.card, { backgroundColor: card.backgroundColor }, theme.shadow.lift]}>
            <Text style={styles.title} numberOfLines={2}>
              {card.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {card.subtitle}
            </Text>
            <Pressable accessibilityRole="button" onPress={card.onPress} style={styles.cta}>
              <Text style={styles.ctaLabel}>{card.cta}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {cards.map((card, cardIndex) => (
          <View key={card.key} style={[styles.dot, cardIndex === index ? styles.dotActive : styles.dotIdle]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.sm,
  },
  track: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: theme.radius.promo,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.h5,
    fontWeight: theme.weight.semibold,
  },
  subtitle: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.caption,
    fontWeight: theme.weight.regular,
  },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    minHeight: 36,
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  ctaLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: theme.weight.semibold,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
  dotIdle: {
    backgroundColor: theme.colors.border,
  },
});
