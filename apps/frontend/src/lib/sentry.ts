import * as Sentry from "@sentry/react";

import { isElectronApp } from "./electron";

export const initWebSentry = () => {
  if (!isElectronApp) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DNS,
      environment: import.meta.env.VITE_ENVIRONMENT,
      integrations: [Sentry.browserTracingIntegration()],
    });
  }
};
