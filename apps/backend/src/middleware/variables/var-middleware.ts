import { createMiddleware } from "hono/factory";

export const addContextVariables = <T extends Record<string, unknown>>({ variables }: { variables: T }) =>
  createMiddleware((c, next) => {
    Object.entries(variables).forEach(([key, value]) => {
      c.set(key, value);
    });
    return next();
  });
