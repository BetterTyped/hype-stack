import * as Sentry from "@sentry/react";

export const initWebSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DNS,
    environment: import.meta.env.VITE_ENVIRONMENT,
    integrations: [Sentry.browserTracingIntegration()],
  });
};
