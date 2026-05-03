import { HTTPException } from "hono/http-exception";
import { ErrorDetails } from "../types";
import { AuthError } from "./types";
/**
 * Handles authentication errors
 */
export declare function handleAuthError(error: Error | HTTPException, details: ErrorDetails): AuthError;
/**
 * Check if an error is an authentication error
 */
export declare function isAuthError(error: unknown): boolean;
//# sourceMappingURL=auth-error.d.ts.map