import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#241B18",
    background: "#F6EFE6",
    backgroundElement: "#FFF8F0",
    backgroundSelected: "#F1E2D2",
    textSecondary: "#75675D",
  },
  dark: {
    text: "#FFF8F0",
    background: "#201816",
    backgroundElement: "#2C2220",
    backgroundSelected: "#3B2E2B",
    textSecondary: "#D8C7B9",
  },
} as const;

export const AppTheme = {
  colors: {
    background: "#F6EFE6",
    backgroundSoft: "#FBF6EF",
    backgroundAccent: "#F0E1D2",
    surface: "#FFF9F2",
    surfaceMuted: "#F7EBDD",
    surfaceStrong: "#EAD8C3",
    text: "#241B18",
    textMuted: "#75675D",
    textSoft: "#9A8A7E",
    border: "#E7D8C6",
    borderStrong: "#D8BEA5",
    accent: "#D66A4A",
    accentDeep: "#A84734",
    accentSoft: "#F6E1D8",
    accentContrast: "#FFF6F2",
    gold: "#B8873C",
    ink: "#2D2421",
    inkSoft: "#4A3A34",
    success: "#2D7355",
    successSoft: "#DCEDE4",
    warning: "#F4E2BF",
    warningText: "#895E23",
    danger: "#BE5A42",
    dangerSoft: "#F8E2DB",
    white: "#FFFFFF",
    shadow: "#2B201B",
  },
  radii: {
    xs: 10,
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 44,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "Avenir Next",
    serif: "Georgia",
    rounded: "Arial Rounded MT Bold",
    mono: "Menlo",
    display: "Georgia",
  },
  android: {
    sans: "sans-serif",
    serif: "serif",
    rounded: "sans-serif-medium",
    mono: "monospace",
    display: "serif",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
    display: "var(--font-serif)",
  },
  default: {
    sans: "sans-serif",
    serif: "serif",
    rounded: "sans-serif",
    mono: "monospace",
    display: "serif",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Shadows = {
  card: {
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  soft: {
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  floating: {
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
  },
} as const;

export function getStatusPalette(status: string) {
  switch (status) {
    case "Pending":
      return {
        backgroundColor: AppTheme.colors.warning,
        color: AppTheme.colors.warningText,
      };
    case "Approved":
      return {
        backgroundColor: AppTheme.colors.successSoft,
        color: AppTheme.colors.success,
      };
    case "Rejected":
      return {
        backgroundColor: AppTheme.colors.dangerSoft,
        color: AppTheme.colors.danger,
      };
    case "Cancelled":
      return {
        backgroundColor: AppTheme.colors.surfaceStrong,
        color: AppTheme.colors.inkSoft,
      };
    case "Completed":
      return {
        backgroundColor: AppTheme.colors.accentSoft,
        color: AppTheme.colors.accentDeep,
      };
    default:
      return {
        backgroundColor: AppTheme.colors.surfaceMuted,
        color: AppTheme.colors.textMuted,
      };
  }
}
