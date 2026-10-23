export const homeTheme = {
  colors: {
    canvas: "#f2f4f5",
    white: "#ffffff",
    blue: "#0068ff",
    blue25: "#f2f7ff",
    blue50: "#e6f0ff",
    blue100: "#cce1ff",
    blue600: "#0053cc",
    dark: "#001f3e",
    gray25: "#f2f4f5",
    gray50: "#e6e9ec",
    gray100: "#ccd2d8",
    gray300: "#66798b",
    red: "#e31748",
    red600: "#b61230",
    orange: "#faa828",
    orange600: "#c88620",
    green: "#03ca77",
  },
  radius: {
    sm: 4,
    promo: 10,
    pill: 100,
  },
  shadow: {
    sm: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.075,
      shadowRadius: 4,
      elevation: 1,
    },
    lift: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
  },
} as const;

export type HomeTheme = typeof homeTheme;
