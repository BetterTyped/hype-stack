import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from "expo-router/react-navigation";

export type Theme = "light" | "dark";

/** Per-app namespace so the theme preference doesn't collide with other stored values. */
export const APP_NAME = "hype-stack";
export const THEME_STORAGE_KEY = "theme";
export const STORAGE_KEY = `${APP_NAME}:${THEME_STORAGE_KEY}`;

/**
 * Theme applied when the user hasn't made an explicit choice yet.
 * Matches the web frontend so both clients look the same out of the box.
 */
export const defaultTheme: Theme = "dark";

/**
 * Resolved color values of the tokens in `src/global.css`. React Navigation and
 * anything else that needs a plain color string (status bar, splash) reads from
 * here, since it cannot resolve Tailwind classes.
 */
export const THEME: Record<Theme, Record<string, string>> = {
  light: {
    pageBackground: "hsl(37.1 46.3% 95.4%)",
    contentBackground: "hsl(37 74.8% 99.1%)",
    background: "hsl(37 74.8% 99.1%)",
    solidBackground: "hsl(37 15.5% 98.6%)",
    foreground: "hsl(34.1 29.6% 4.8%)",
    card: "hsl(37 74.8% 99.1%)",
    cardForeground: "hsl(34.1 29.6% 4.8%)",
    popover: "hsl(37 74.8% 99.1%)",
    popoverForeground: "hsl(34.6 33.2% 9.5%)",
    primary: "hsl(21.1 100% 47.3%)",
    primaryForeground: "hsl(180 0% 98%)",
    secondary: "hsl(34 20% 94.5%)",
    secondaryForeground: "hsl(34.2 8.4% 32.7%)",
    muted: "hsl(34.1 31% 94.3%)",
    mutedForeground: "hsl(34.1 6.6% 43.7%)",
    accent: "hsl(34.1 31% 94.3%)",
    accentForeground: "hsl(34.2 15.4% 10%)",
    destructive: "hsl(357.2 100% 45.3%)",
    border: "hsl(34.1 16.1% 89.1%)",
    input: "hsl(34.1 16.1% 89.1%)",
    ring: "hsl(34.1 12.4% 82.6%)",
    radius: "0.625rem",
  },
  dark: {
    pageBackground: "hsl(34.2 17.9% 6.6%)",
    contentBackground: "hsl(34.1 9.1% 10.2%)",
    background: "hsl(34.1 9.1% 10.2%)",
    solidBackground: "hsl(34.1 6.5% 6.8%)",
    foreground: "hsl(180 0% 98%)",
    card: "hsl(34.1 7% 11.1%)",
    cardForeground: "hsl(180 0% 98%)",
    popover: "hsl(34.1 9.1% 10.2%)",
    popoverForeground: "hsl(180 0% 98%)",
    primary: "hsl(31 100% 48.4%)",
    primaryForeground: "hsl(180 0% 98%)",
    secondary: "hsl(203.3 64.1% 15%)",
    secondaryForeground: "hsl(203.9 85% 66.1%)",
    muted: "hsl(34.1 7.5% 17.6%)",
    mutedForeground: "hsl(34.1 4.6% 64.1%)",
    accent: "hsl(34.1 7.5% 17.6%)",
    accentForeground: "hsl(180 0% 98%)",
    destructive: "hsl(358.8 69.3% 30.1%)",
    border: "hsl(34.1 7.5% 17.6%)",
    input: "hsl(34.1 7.5% 17.6%)",
    ring: "hsl(34.2 9.2% 29.4%)",
    radius: "0.625rem",
  },
};

export const NAV_THEME: Record<Theme, NavigationTheme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.pageBackground,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.pageBackground,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
