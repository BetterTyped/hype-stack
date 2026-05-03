import { ContentfulStatusCode } from "hono/utils/http-status";

import { ErrorDetails } from "../types";

export enum DatabaseErrorCode {
  DATABASE_CONNECTION_ERROR = "DATABASE_CONNECTION_ERROR",
  DATABASE_QUERY_ERROR = "DATABASE_QUERY_ERROR",
  DATABASE_CONSTRAINT_ERROR = "DATABASE_CONSTRAINT_ERROR",
  DATABASE_TIMEOUT_ERROR = "DATABASE_TIMEOUT_ERROR",
  DATABASE_UNKNOWN_ERROR = "DATABASE_UNKNOWN_ERROR",
}

export class DatabaseError {
  public readonly code: DatabaseErrorCode;
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
    code: DatabaseErrorCode;
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
