import * as Sentry from "@sentry/react";
import * as React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app";
import { initWebSentry } from "./lib/sentry";

// https://stackoverflow.com/questions/69300341/typeerror-failed-to-fetch-dynamically-imported-module-on-vue-vite-vanilla-set
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

initWebSentry();

// Force dark mode across the app to align with the desired styling
// try {
//   const rootElement = document.documentElement;
//   rootElement.classList.add("dark");
//   rootElement.classList.remove("light");
//   // Prefer dark color scheme for native UI where supported
//   rootElement.style.colorScheme = "dark";
// } catch {}

createRoot(document.getElementById("root") as HTMLElement, {
  // Callback called when an error is thrown and not caught by an ErrorBoundary.
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn("Uncaught error", error, errorInfo.componentStack);
  }),
  // Callback called when React catches an error in an ErrorBoundary.
  onCaughtError: Sentry.reactErrorHandler(),
  // Callback called when React automatically recovers from errors.
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
