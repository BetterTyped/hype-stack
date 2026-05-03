import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { ErrorDetails } from "../types";
import { ValidationError } from "./types";
/**
 * Handles validation errors from Zod or Hono validator
 */
export declare function handleValidationError(error: ZodError | HTTPException, details: ErrorDetails): ValidationError;
/**
 * Check if an error is a validation error
 */
export declare function isValidationError(error: unknown): boolean;
//# sourceMappingURL=validation-error.d.ts.map