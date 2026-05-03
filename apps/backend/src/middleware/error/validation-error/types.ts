import { ContentfulStatusCode } from "hono/utils/http-status";
import { $ZodIssue } from "zod/v4/core";

import { ErrorDetails } from "../types";

export enum ValidationErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

export class ValidationError {
  public readonly code: ValidationErrorCode;
  public readonly message: string;
  public readonly statusCode: ContentfulStatusCode;
  public readonly details?: ErrorDetails;
  public readonly issues: $ZodIssue[];

  constructor({
    issues,
    code,
    message,
    statusCode,
    details = {
      timestamp: new Date().toISOString(),
    },
  }: {
    issues: $ZodIssue[];
    code: ValidationErrorCode;
    message: string;
    statusCode: ContentfulStatusCode;
    details?: ErrorDetails;
  }) {
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;
    this.issues = issues;
  }
}
