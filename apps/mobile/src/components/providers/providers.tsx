import { PortalHost } from "@rn-primitives/portal";
import { ThemeProvider } from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";

import { DevServerBanner } from "@/components/dev/dev-server-banner";
import { useTheme } from "@/hooks/use-theme";
import { NAV_THEME } from "@/lib/theme";

// Held until the persisted theme is known, so the app never paints in the wrong theme.
void SplashScreen.preventAutoHideAsync();

/**
 * App-wide wrappers, mounted once by the root layout - mirrors the frontend's
 * Providers component. Owns the theme lifecycle (restore, splash screen, status
 * bar), the dev-only backend banner, and the portal host that overlay
 * components (dialogs, tooltips, menus) render into.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const { theme, isThemeReady } = useTheme();

  useEffect(() => {
    if (isThemeReady) void SplashScreen.hideAsync();
  }, [isThemeReady]);

  if (!isThemeReady) return null;

  return (
    <ThemeProvider value={NAV_THEME[theme]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View className="flex-1">
        <DevServerBanner />
        {children}
      </View>
      <PortalHost />
    </ThemeProvider>
  );
}
