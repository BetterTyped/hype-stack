// oxlint-disable-next-line import/no-unassigned-import
import "@/global.css";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { useTheme } from "@/hooks/use-theme";
import { NAV_THEME } from "@/lib/theme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Held until the persisted theme is known, so the app never paints in the wrong theme.
void SplashScreen.preventAutoHideAsync();

const STACK_OPTIONS = { headerShadowVisible: false };

export default function RootLayout() {
  const { theme, isThemeReady } = useTheme();

  useEffect(() => {
    if (isThemeReady) void SplashScreen.hideAsync();
  }, [isThemeReady]);

  if (!isThemeReady) return null;

  return (
    <ThemeProvider value={NAV_THEME[theme]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={STACK_OPTIONS} />
      <PortalHost />
    </ThemeProvider>
  );
}
