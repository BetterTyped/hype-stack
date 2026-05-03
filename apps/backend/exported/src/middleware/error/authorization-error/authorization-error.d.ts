import { HTTPException } from "hono/http-exception";
import { ErrorDetails } from "../types";
import { AuthorizationError } from "./types";
/**
 * Handles authorization errors (permission checks)
 */
export declare function handleAuthorizationError(error: Error | HTTPException, details: ErrorDetails): AuthorizationError;
export declare function isAuthorizationError(error: unknown): boolean;
//# sourceMappingURL=authorization-error.d.ts.map