import { ContentfulStatusCode } from "hono/utils/http-status";

import { ErrorDetails } from "../types";

export enum ApplicationErrorCode {
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  FORBIDDEN = "FORBIDDEN",
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

export class ApplicationError {
  public readonly code: ApplicationErrorCode;
  public readonly message: string;
  public readonly statusCode: ContentfulStatusCode;
  public readonly details: ErrorDetails;

  constructor({
    code,
    message,
    statusCode,
    details = {
      timestamp: new Date().toISOString(),
    },
  }: {
    code: ApplicationErrorCode;
    message: string;
    statusCode: ContentfulStatusCode;
    details?: ErrorDetails;
  }) {
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;
  }
}
