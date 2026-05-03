import { HTTPException } from "hono/http-exception";
import { ErrorDetails } from "../types";
import { ApplicationError } from "./types";
/**
 * Handles general application errors
 */
export declare function handleApplicationError(error: Error | HTTPException, details: ErrorDetails): ApplicationError;
/**
 * Check if an error is an application error
 */
export declare function isApplicationError(error: unknown): boolean;
//# sourceMappingURL=application-error.d.ts.map