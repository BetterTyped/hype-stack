import { useCallback, useEffect, useState } from "react";

import { defaultTheme, STORAGE_KEY, type Theme } from "@/lib/theme";

export type { Theme };
export { APP_NAME, defaultTheme, THEME_STORAGE_KEY } from "@/lib/theme";

export function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable (private mode, etc.) - fall back to defaultTheme.
  }
  return null;
}

export function setStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Persistence best-effort.
  }
}

/** Resolve the theme that should be active right now: saved preference or the configured default. */
export function resolveTheme(): Theme {
  return getStoredTheme() ?? defaultTheme;
}

/** Apply a theme to the document root. Idempotent - safe to call repeatedly. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/**
 * Centralized theme controller. Mount once at the app root so the theme is
 * applied, persisted, and kept in sync across tabs.
 *
 * The pre-paint inline script from `@/lib/theme` sets the initial class to
 * avoid a flash; this hook picks up from there and owns the runtime state.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(resolveTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Cross-tab sync: another tab writing to localStorage updates this one.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = event.newValue === "light" || event.newValue === "dark" ? event.newValue : defaultTheme;
      setThemeState(next as Theme);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setStoredTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      setStoredTheme(next);
      return next;
    });
  }, []);

  return { theme, setTheme, toggleTheme };
}
