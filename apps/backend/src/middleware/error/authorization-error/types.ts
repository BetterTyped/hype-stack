import { ContentfulStatusCode } from "hono/utils/http-status";

import { ErrorDetails } from "../types";

export enum AuthorizationErrorCode {
  AUTHORIZATION_FORBIDDEN = "AUTHORIZATION_FORBIDDEN",
  AUTHORIZATION_MISSING_PERMISSION = "AUTHORIZATION_MISSING_PERMISSION",
}

export class AuthorizationError {
  public readonly code: AuthorizationErrorCode;
  public readonly message: string;
  public readonly statusCode: ContentfulStatusCode;
  public readonly details: ErrorDetails;

  constructor({
    code,
    message,
    statusCode = 403,
    details = {
      timestamp: new Date().toISOString(),
    },
  }: {
    code: AuthorizationErrorCode;
    message: string;
    statusCode?: ContentfulStatusCode;
    details?: AuthorizationError["details"];
  }) {
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;
  }
}
