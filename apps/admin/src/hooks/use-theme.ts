import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export const defaultTheme = "system";
export const THEME_STORAGE_KEY = "theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) || defaultTheme;
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable (private mode, etc.) - fall back to system.
  }
  return null;
}

/** Resolve the theme that should be active right now: saved preference or system default. */
export function resolveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

/** Apply a theme to the document root. Idempotent - safe to call repeatedly. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/**
 * Centralized theme controller. Mount once at the app root so the theme is
 * applied, persisted, and kept in sync across tabs and OS preference changes.
 *
 * The pre-paint inline script in `index.html` sets the initial class to avoid
 * a flash; this hook picks up from there and owns the runtime state.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(resolveTheme);

  // Apply whenever the resolved theme changes.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Cross-tab sync: another tab writing to localStorage updates this one.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = event.newValue === "light" || event.newValue === "dark" ? event.newValue : getSystemTheme();
      setThemeState(next as Theme);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Follow the OS preference until the user makes an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getStoredTheme() === null) setThemeState(getSystemTheme());
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Persistence best-effort; still apply in-memory below.
    }
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { theme, setTheme, toggleTheme };
}
