import * as Sentry from "@sentry/node";

/**
 * Called once from main.ts before the server starts. Without this call every
 * captureException in the error middleware is a no-op, which is how the backend
 * went silent in Sentry.
 */
export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.APP_ENV ?? process.env.NODE_ENV,

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });
};
