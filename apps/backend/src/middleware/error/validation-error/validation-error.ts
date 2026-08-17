import { m } from "@backend/paraglide/messages.js";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { $ZodIssue } from "zod/v4/core";

import { ErrorDetails } from "../types";
import { ValidationError, ValidationErrorCode } from "./types";

/**
 * Handles validation errors from Zod or Hono validator
 */
export function handleValidationError(error: ZodError | HTTPException, details: ErrorDetails): ValidationError {
  const message = m.error_validation();
  let issues: $ZodIssue[] = [];

  if (error instanceof ZodError) {
    // Use Zod-provided issues directly
    issues = error.issues as unknown as $ZodIssue[];
  } else if (error instanceof HTTPException && error.status === 400) {
    // Parse Hono validator error payload
    try {
      const parsed = JSON.parse(error.message);
      const rawIssues = parsed?.issues ?? parsed?.error?.issues ?? parsed?.errors ?? [];

      if (Array.isArray(rawIssues) && rawIssues.length > 0) {
        issues = rawIssues as unknown as $ZodIssue[];
      } else {
        issues = [
          {
            code: "custom",
            path: [],
            message: typeof parsed?.message === "string" ? parsed.message : m.error_invalid_input(),
            params: {},
          } as unknown as $ZodIssue,
        ];
      }
    } catch {
      issues = [
        {
          code: "custom",
          path: [],
          message: (error as Error).message || m.error_invalid_input(),
          params: {},
        } as unknown as $ZodIssue,
      ];
    }
  } else {
    // Fallback for other validation-like errors
    issues = [
      {
        code: "custom",
        path: [],
        message: m.error_invalid_input(),
        params: {},
      } as unknown as $ZodIssue,
    ];
  }

  const validationError = new ValidationError({
    code: ValidationErrorCode.VALIDATION_ERROR,
    message,
    statusCode: 400,
    details,
    issues,
  });

  return validationError;
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return (
    ((error as ZodError)?.issues && Array.isArray((error as ZodError).issues)) ||
    (error instanceof HTTPException && error.status === 400) ||
    error instanceof ValidationError
  );
}
