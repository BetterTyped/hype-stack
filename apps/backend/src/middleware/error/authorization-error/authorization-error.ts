import { logger } from "@backend/libs/logger/logger";
import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";

import { ErrorDetails } from "../types";
import { AuthorizationError, AuthorizationErrorCode } from "./types";

/**
 * Handles authorization errors (permission checks)
 */
export function handleAuthorizationError(error: Error | HTTPException, details: ErrorDetails): AuthorizationError {
  let code: AuthorizationErrorCode = AuthorizationErrorCode.AUTHORIZATION_FORBIDDEN;
  let message = "Forbidden";
  let statusCode: ContentfulStatusCode = 403;
  const extraDetails: Record<string, unknown> = {};

  if (error instanceof HTTPException) {
    if (error.status === 403) {
      code = AuthorizationErrorCode.AUTHORIZATION_FORBIDDEN;
      message = error.message || "Forbidden";
      statusCode = 403;
    } else {
      statusCode = (error.status as ContentfulStatusCode) || 403;
      message = error.message || "Forbidden";
    }
  } else if (error instanceof AuthorizationError) {
    code = error.code;
    message = error.message;
    statusCode = error.statusCode;
  } else {
    const msg = error.message.toLowerCase();
    if (msg.includes("permission") || msg.includes("forbidden") || msg.includes("not allowed")) {
      code = AuthorizationErrorCode.AUTHORIZATION_FORBIDDEN;
      message = "Insufficient permissions";
    }

    const requiredMatch = error.message.match(/required permissions?:\s*([^\n]+)/i);
    if (requiredMatch) extraDetails.requiredPermissions = requiredMatch[1].split(/[,\s]+/).filter(Boolean);
  }

  if (process.env.NODE_ENV === "development" && !(error instanceof HTTPException)) {
    extraDetails.originalError = error.message;
    logger.error({ message: "Authorization error details:", error });
  }

  const authorizationError = new AuthorizationError({
    code,
    message,
    statusCode,
    details: { ...details, ...(extraDetails as object) },
  });

  return authorizationError;
}

export function isAuthorizationError(error: unknown): boolean {
  return error instanceof AuthorizationError;
}
