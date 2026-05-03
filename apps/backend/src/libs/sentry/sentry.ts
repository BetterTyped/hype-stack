import * as Sentry from "@sentry/node";

export const initSentry = () => {
  // Ensure to call this before requiring any other modules!
  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });
};
