export type Theme = "light" | "dark";

/** Per-app namespace so theme preference doesn't collide with other apps on the same origin. */
export const APP_NAME = "hype-stack-admin";
export const THEME_STORAGE_KEY = "theme";
export const STORAGE_KEY = `${APP_NAME}:${THEME_STORAGE_KEY}`;

/**
 * Theme applied when the user hasn't made an explicit choice yet.
 * Change this to switch the out-of-the-box appearance; the user's pick
 * is then persisted and wins from then on.
 */
export const defaultTheme: Theme = "dark";

/**
 * Serialized into a blocking inline script, so it cannot reference anything
 * outside its own arguments - every value it needs is passed in.
 */
function bootstrapTheme(storageKey: string, fallback: Theme) {
  try {
    const stored = localStorage.getItem(storageKey);
    const theme = stored === "light" || stored === "dark" ? stored : fallback;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  } catch {
    // localStorage unavailable (private mode, etc.) - leave the document as-is.
  }
}

/**
 * Source for the pre-paint theme script, shared by every environment: the Vite
 * plugin inlines it into index.html for the CSR build, and the root route
 * inlines it into the SSR document head. It has to run before first paint,
 * which rules out shipping it inside a bundle.
 */
export const themeBootstrapScript = `(${bootstrapTheme.toString()})(${JSON.stringify(STORAGE_KEY)},${JSON.stringify(defaultTheme)})`;
