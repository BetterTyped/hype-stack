import { captureException } from "@sentry/node";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

import { logger } from "../../libs/logger/logger";
import { handleApplicationError, isApplicationError } from "./application-error/application-error";
import { ApplicationError } from "./application-error/types";
import { handleAuthError, isAuthError } from "./auth-error/auth-error";
import { handleAuthorizationError, isAuthorizationError } from "./authorization-error/authorization-error";
import { handleDatabaseError, isDatabaseError } from "./db-error/db-error";
import { ErrorDetails } from "./types";
import { handleValidationError, isValidationError } from "./validation-error/validation-error";

export const onError = (error: Error) => {
  const details: ErrorDetails = {
    timestamp: new Date().toISOString(),
  };

  // Generate a request ID for error tracking
  logger.error(error);

  // Handle explicitly thrown ApplicationErrors - return directly with their statusCode
  if (isApplicationError(error)) {
    const appError = error as unknown as ApplicationError;
    return appError;
  }

  // Handle validation errors (Zod, Hono validator)
  if (isValidationError(error)) {
    return handleValidationError(error as ZodError | HTTPException, details);
  }

  // Handle authentication errors (auth middleware)
  if (isAuthError(error)) {
    return handleAuthError(error as Error | HTTPException, details);
  }

  // Capture errors for the Database / Application errors
  captureException(error);

  // Handle authorization errors
  if (isAuthorizationError(error)) {
    return handleAuthorizationError(error as Error | HTTPException, details);
  }

  // Handle database errors (Kysely)
  if (isDatabaseError(error)) {
    return handleDatabaseError(error as Error, details);
  }

  // Handle all other errors as application errors
  return handleApplicationError(error as Error | HTTPException, details);
};

/**
 * Global error middleware for Hono that handles all types of errors
 * with strongly typed responses
 */
export const errorMiddleware = createMiddleware(async (c, next) => {
  try {
    const result = await next();

    return result;
  } catch (error) {
    // Generate a request ID for error tracking
    logger.error(error);

    const errorObject = onError(error as Error);
    return c.json<{ message: string; statusCode: number }>(errorObject, errorObject.statusCode);
  }
});
