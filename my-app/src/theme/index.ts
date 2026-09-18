export const theme = {
  colors: {
    background: "#F6F4EF",
    surface: "#FFFFFF",
    text: "#1A241C",
    textSecondary: "#6B6560",
    primary: "#145C38",
    primaryDark: "#0C3F24",
    primaryLight: "#1F6B45",
    primaryText: "#FFFFFF",
    accent: "#E85A20",
    gold: "#C6A34E",
    border: "#E4DDD2",
    danger: "#B91C1C",
    muted: "#EFEAE3",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    title: 32,
    heading: 24,
    subheading: 18,
    body: 14,
    caption: 12,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    button: 24,
  },
} as const;

export type Theme = typeof theme;
