import { ErrorDetails } from "../types";
import { DatabaseError } from "./types";
/**
 * Handles Kysely database errors
 */
export declare function handleDatabaseError(error: Error, details: ErrorDetails): DatabaseError;
/**
 * Check if an error is a database error
 */
export declare function isDatabaseError(error: unknown): boolean;
//# sourceMappingURL=db-error.d.ts.map