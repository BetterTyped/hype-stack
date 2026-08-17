import { m } from "@backend/paraglide/messages.js";
import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";

import { ErrorDetails } from "../types";
import { ApplicationError, ApplicationErrorCode } from "./types";

/**
 * Handles general application errors
 */
export function handleApplicationError(error: Error | HTTPException, details: ErrorDetails): ApplicationError {
  let code: ApplicationErrorCode;
  let message: string;
  let statusCode: ContentfulStatusCode;
  const extraDetails: Record<string, unknown> = {};

  if (error instanceof HTTPException) {
    // Handle HTTP exceptions
    switch (error.status) {
      case 400:
        code = ApplicationErrorCode.BAD_REQUEST;
        message = error.message || m.error_bad_request();
        statusCode = 400;
        break;
      case 404:
        code = ApplicationErrorCode.NOT_FOUND;
        message = error.message || m.error_not_found();
        statusCode = 404;
        break;
      case 429:
        code = ApplicationErrorCode.RATE_LIMIT_EXCEEDED;
        message = error.message || m.error_rate_limit_exceeded();
        statusCode = 429;
        break;
      case 503:
        code = ApplicationErrorCode.SERVICE_UNAVAILABLE;
        message = error.message || m.error_service_unavailable();
        statusCode = 503;
        break;
      default:
        code = ApplicationErrorCode.INTERNAL_SERVER_ERROR;
        message = error.message || m.error_internal_server();
        statusCode = (error.status as ContentfulStatusCode) || 500;
    }
  } else {
    // Handle generic errors
    code = ApplicationErrorCode.INTERNAL_SERVER_ERROR;
    message = m.error_internal_server();
    statusCode = 500;

    // In development, include more details
    if (process.env.NODE_ENV === "development") {
      extraDetails.originalError = error.message;
      extraDetails.stack = error.stack;
    }
  }

  const appError = new ApplicationError({
    code,
    message,
    statusCode,
    details,
  });

  return appError;
}

/**
 * Check if an error is an application error
 */
export function isApplicationError(error: unknown): boolean {
  return error instanceof ApplicationError;
}
