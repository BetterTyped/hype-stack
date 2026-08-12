import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";

import { defaultTheme, STORAGE_KEY, type Theme } from "@/lib/theme";

export type { Theme };
export { APP_NAME, defaultTheme, THEME_STORAGE_KEY } from "@/lib/theme";

const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

export async function getStoredTheme(): Promise<Theme | null> {
  // Storage is best-effort: a read failure just means we fall back to the default.
  const stored = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
  return isTheme(stored) ? stored : null;
}

export async function setStoredTheme(theme: Theme): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, theme).catch(() => undefined);
}

/**
 * Centralized theme controller. Mount once at the app root so the persisted
 * preference is restored, applied to Nativewind, and saved on every change.
 *
 * `isThemeReady` stays false until the stored value has been read, which lets
 * the root layout hold the splash screen and avoid a flash of the wrong theme.
 */
export function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restoreTheme = async () => {
      const stored = await getStoredTheme();
      if (cancelled) return;
      setColorScheme(stored ?? defaultTheme);
      setIsThemeReady(true);
    };

    void restoreTheme();

    return () => {
      cancelled = true;
    };
  }, [setColorScheme]);

  const setTheme = useCallback(
    (next: Theme) => {
      setColorScheme(next);
      void setStoredTheme(next);
    },
    [setColorScheme],
  );

  const theme: Theme = isTheme(colorScheme) ? colorScheme : defaultTheme;

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return { theme, setTheme, toggleTheme, isThemeReady };
}
