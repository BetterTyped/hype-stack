import { ContentfulStatusCode } from "hono/utils/http-status";

import { ErrorDetails } from "../types";

export enum AuthErrorCode {
  AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED",
  AUTH_FORBIDDEN = "AUTH_FORBIDDEN",
  AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  AUTH_TOKEN_INVALID = "AUTH_TOKEN_INVALID",
  AUTH_USER_NOT_FOUND = "AUTH_USER_NOT_FOUND",
  AUTH_COOKIE_NOT_FOUND = "AUTH_COOKIE_NOT_FOUND",
  AUTH_NO_SESSION = "AUTH_NO_SESSION",
  AUTH_MISSING_REFRESH_TOKEN = "AUTH_MISSING_REFRESH_TOKEN",
  AUTH_ORGANIZATION_INVITE_ACCEPT = "AUTH_ORGANIZATION_INVITE_ACCEPT",
  AUTH_NO_ORGANIZATION = "AUTH_NO_ORGANIZATION",
}

export class AuthError {
  public readonly code: AuthErrorCode;
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
    code: AuthErrorCode;
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
