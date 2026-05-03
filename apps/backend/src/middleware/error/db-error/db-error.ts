import { logger } from "@backend/libs/logger/logger";

import { ErrorDetails } from "../types";
import { DatabaseError, DatabaseErrorCode } from "./types";

/**
 * Handles Kysely database errors
 */
export function handleDatabaseError(error: Error, details: ErrorDetails): DatabaseError {
  let code: DatabaseErrorCode;
  let message: string;
  const extraDetails: Record<string, unknown> = {};

  // Check for specific Kysely/database error types
  if (error.message.includes("connection")) {
    code = DatabaseErrorCode.DATABASE_CONNECTION_ERROR;
    message = "Database connection failed";
  } else if (error.message.includes("timeout")) {
    code = DatabaseErrorCode.DATABASE_TIMEOUT_ERROR;
    message = "Database operation timed out";
  } else if (
    error.message.includes("constraint") ||
    error.message.includes("UNIQUE") ||
    error.message.includes("foreign key") ||
    error.message.includes("check constraint")
  ) {
    code = DatabaseErrorCode.DATABASE_CONSTRAINT_ERROR;
    message = "Database constraint violation";

    // Try to extract constraint name
    const constraintMatch = error.message.match(/constraint "([^"]+)"/i);
    if (constraintMatch) {
      extraDetails.constraint = constraintMatch[1];
    }
  } else if (
    error.message.includes("syntax error") ||
    error.message.includes("invalid query") ||
    error.message.includes("relation") ||
    error.message.includes("column")
  ) {
    code = DatabaseErrorCode.DATABASE_QUERY_ERROR;
    message = "Database query error";
  } else {
    code = DatabaseErrorCode.DATABASE_UNKNOWN_ERROR;
    message = "An unknown database error occurred";
  }

  // Try to extract table name from error message
  const tableMatch = error.message.match(/table "([^"]+)"/i) || error.message.match(/relation "([^"]+)"/i);
  if (tableMatch) {
    extraDetails.table = tableMatch[1];
  }

  // In development, include more details
  if (process.env.NODE_ENV === "development") {
    extraDetails.originalError = error.message;
    logger.error({ message: "Database error details:", error });
  }

  const dbError = new DatabaseError({
    code,
    message,
    statusCode: 500,
    details,
  });

  return dbError;
}

/**
 * Check if an error is a database error
 */
export function isDatabaseError(error: unknown): boolean {
  if (error instanceof DatabaseError) return true;
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || "";

  const dbErrorPatterns = [
    "kysely",
    "database",
    "connection",
    "constraint",
    "foreign key",
    "unique",
    "syntax error",
    "relation",
    "column",
    "table",
    "query",
    "pg_",
    "sqlite",
    "mysql",
  ];

  return dbErrorPatterns.some((pattern) => message.includes(pattern) || stack.includes(pattern));
}
