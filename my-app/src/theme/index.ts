export const theme = {
  colors: {
    background: "#F6F7F9",
    surface: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280",
    primary: "#0F766E",
    primaryText: "#FFFFFF",
    border: "#E5E7EB",
    danger: "#B91C1C",
    muted: "#F3F4F6",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    title: 28,
    heading: 22,
    body: 16,
    caption: 13,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
} as const;

export type Theme = typeof theme;
