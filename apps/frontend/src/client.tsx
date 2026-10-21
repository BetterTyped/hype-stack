import * as Sentry from "@sentry/react";
import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import { initWebSentry } from "./lib/sentry";

/**
 * Client entry for the SSR build (`build:ssr`, what the Dockerfile ships). TanStack
 * Start picks this file up by name. Without it Start falls back to its own default
 * entry, which never calls initWebSentry, so production reported nothing.
 * The CSR and Electron builds still start from index.html -> entry.ts -> index.tsx.
 */

// https://stackoverflow.com/questions/69300341 - a stale chunk after a deploy
// throws on dynamic import; a reload pulls the fresh manifest.
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

initWebSentry();

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
  {
    onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
      console.warn("Uncaught error", error, errorInfo.componentStack);
    }),
    onCaughtError: Sentry.reactErrorHandler(),
    onRecoverableError: Sentry.reactErrorHandler(),
  },
);
