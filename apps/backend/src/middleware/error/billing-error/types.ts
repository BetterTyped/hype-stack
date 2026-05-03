import { ContentfulStatusCode } from "hono/utils/http-status";

import { ErrorDetails } from "../types";

export enum BillingErrorCode {
  LIMIT_EXCEEDED = "LIMIT_EXCEEDED",
  INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS",
  PLAN_NOT_FOUND = "PLAN_NOT_FOUND",
  SUBSCRIPTION_NOT_FOUND = "SUBSCRIPTION_NOT_FOUND",
}

export class BillingError extends Error {
  public readonly code: BillingErrorCode;
  public readonly statusCode: ContentfulStatusCode;
  public readonly details: ErrorDetails;

  constructor({
    code,
    message,
    statusCode = 400,
    details = {
      timestamp: new Date().toISOString(),
    },
  }: {
    code: BillingErrorCode;
    message: string;
    statusCode?: ContentfulStatusCode;
    details?: ErrorDetails;
  }) {
    super(message);
    this.name = "BillingError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BillingError);
    }
  }
}
