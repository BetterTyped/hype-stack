import { logger } from "@backend/libs/logger/logger";
import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";

import { ErrorDetails } from "../types";
import { AuthError, AuthErrorCode } from "./types";

/**
 * Handles authentication errors
 */
export function handleAuthError(error: Error | HTTPException, details: ErrorDetails): AuthError {
  let code: AuthErrorCode;
  let message: string;
  let statusCode: ContentfulStatusCode = 401;
  const extraDetails: Record<string, unknown> = {};

  if (error instanceof HTTPException) {
    // Handle HTTP exceptions from auth middleware
    switch (error.status) {
      case 401:
        code = AuthErrorCode.AUTH_UNAUTHORIZED;
        message = "Authentication required";
        statusCode = 401;
        break;
      case 403:
        code = AuthErrorCode.AUTH_FORBIDDEN;
        message = "Access forbidden";
        statusCode = 403;
        break;
      default:
        code = AuthErrorCode.AUTH_UNAUTHORIZED;
        message = error.message || "Authentication failed";
        statusCode = error.status as ContentfulStatusCode;
    }
  } else {
    const errorMessage = error.message.toLowerCase();

    if (error instanceof AuthError) {
      code = error.code;
      message = error.message;
      statusCode = error.statusCode;
    } else if (
      errorMessage.includes("token") &&
      (errorMessage.includes("expired") || errorMessage.includes("expire"))
    ) {
      code = AuthErrorCode.AUTH_TOKEN_EXPIRED;
      message = "Authentication token has expired";
      statusCode = 401;
    } else if (
      errorMessage.includes("token") &&
      (errorMessage.includes("invalid") || errorMessage.includes("malformed"))
    ) {
      code = AuthErrorCode.AUTH_TOKEN_INVALID;
      message = "Invalid authentication token";
      statusCode = 401;
    } else if (errorMessage.includes("user") && errorMessage.includes("not found")) {
      code = AuthErrorCode.AUTH_USER_NOT_FOUND;
      message = "User not found";
      statusCode = 404;
    } else if (errorMessage.includes("unauthorized") || errorMessage.includes("authentication")) {
      code = AuthErrorCode.AUTH_UNAUTHORIZED;
      message = "Authentication required";
      statusCode = 401;
    } else if (errorMessage.includes("forbidden") || errorMessage.includes("permission")) {
      code = AuthErrorCode.AUTH_FORBIDDEN;
      message = "Insufficient permissions";
      statusCode = 403;

      // Try to extract required permission from error message
      const permissionMatch = error.message.match(/permission[:\s]+([^\s,]+)/i);
      if (permissionMatch) {
        extraDetails.requiredPermission = permissionMatch[1];
      }
    } else {
      code = AuthErrorCode.AUTH_UNAUTHORIZED;
      message = "Authentication failed";
      statusCode = 401;
    }
  }

  // In development, include more details
  if (process.env.NODE_ENV === "development" && !(error instanceof HTTPException)) {
    extraDetails.originalError = error.message;
    logger.error({ message: "Auth error details:", error });
  }

  const authError = new AuthError({
    code,
    message,
    statusCode,
    details,
  });

  return authError;
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AuthError) return true;

  if (error instanceof HTTPException) {
    return error.status === 401 || error.status === 403;
  }

  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || "";

  // Check for common auth error patterns
  const authErrorPatterns = [
    "unauthorized",
    "forbidden",
    "authentication",
    "token",
    "permission",
    "access denied",
    "invalid credentials",
    "user not found",
  ];

  return authErrorPatterns.some((pattern) => message.includes(pattern) || stack.includes(pattern));
}
