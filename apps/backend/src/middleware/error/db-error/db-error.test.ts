import { handleDatabaseError, isDatabaseError } from "./db-error";
import { DatabaseError, DatabaseErrorCode } from "./types";

describe("isDatabaseError", () => {
  it("returns true for DatabaseError instances", () => {
    // Arrange
    const error = new DatabaseError({
      code: DatabaseErrorCode.DATABASE_CONNECTION_ERROR,
      message: "Connection lost",
      statusCode: 500,
    });

    // Act & Assert
    expect(isDatabaseError(error)).toBe(true);
  });

  it("returns true for errors with database-related messages", () => {
    // Act & Assert
    expect(isDatabaseError(new Error("database connection refused"))).toBe(true);
    expect(isDatabaseError(new Error("UNIQUE constraint violation"))).toBe(true);
    expect(isDatabaseError(new Error("foreign key violation"))).toBe(true);
    expect(isDatabaseError(new Error("syntax error at or near"))).toBe(true);
    expect(isDatabaseError(new Error("relation does not exist"))).toBe(true);
    expect(isDatabaseError(new Error("column not found"))).toBe(true);
    expect(isDatabaseError(new Error("table does not exist"))).toBe(true);
    expect(isDatabaseError(new Error("query failed"))).toBe(true);
    expect(isDatabaseError(new Error("kysely internal error"))).toBe(true);
    expect(isDatabaseError(new Error("pg_stat_activity"))).toBe(true);
  });

  it("returns false for non-database errors", () => {
    // Act & Assert
    expect(isDatabaseError(new Error("unauthorized"))).toBe(false);
    expect(isDatabaseError(new Error("file not found"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    // Act & Assert
    expect(isDatabaseError(null)).toBe(false);
    expect(isDatabaseError("string")).toBe(false);
    expect(isDatabaseError(42)).toBe(false);
  });
});

describe("handleDatabaseError", () => {
  const details = { timestamp: "2026-01-01T00:00:00.000Z" };

  it("maps connection errors to DATABASE_CONNECTION_ERROR", () => {
    // Act
    const result = handleDatabaseError(new Error("connection refused"), details);

    // Assert
    expect(result).toBeInstanceOf(DatabaseError);
    expect(result.code).toBe(DatabaseErrorCode.DATABASE_CONNECTION_ERROR);
    expect(result.statusCode).toBe(500);
  });

  it("maps timeout errors to DATABASE_TIMEOUT_ERROR", () => {
    // Act
    const result = handleDatabaseError(new Error("query timeout exceeded"), details);

    // Assert
    expect(result.code).toBe(DatabaseErrorCode.DATABASE_TIMEOUT_ERROR);
  });

  it("maps constraint violation to DATABASE_CONSTRAINT_ERROR", () => {
    // Act
    const result = handleDatabaseError(new Error('UNIQUE constraint "users_email_key" violated'), details);

    // Assert
    expect(result.code).toBe(DatabaseErrorCode.DATABASE_CONSTRAINT_ERROR);
  });

  it("maps foreign key errors to DATABASE_CONSTRAINT_ERROR", () => {
    // Act
    const result = handleDatabaseError(new Error("foreign key violation"), details);

    // Assert
    expect(result.code).toBe(DatabaseErrorCode.DATABASE_CONSTRAINT_ERROR);
  });

  it("maps check constraint errors to DATABASE_CONSTRAINT_ERROR", () => {
    // Act
    const result = handleDatabaseError(new Error("check constraint failed"), details);

    // Assert
    expect(result.code).toBe(DatabaseErrorCode.DATABASE_CONSTRAINT_ERROR);
  });

  it("maps syntax errors to DATABASE_QUERY_ERROR", () => {
    // Act
    const result = handleDatabaseError(new Error("syntax error at position 42"), details);

    // Assert
    expect(result.code).toBe(DatabaseErrorCode.DATABASE_QUERY_ERROR);
  });

  it("maps relation errors to DATABASE_QUERY_ERROR", () => {
    // Act
    const result = handleDatabaseError(new Error('relation "users" does not exist'), details);

    // Assert
    expect(result.code).toBe(DatabaseErrorCode.DATABASE_QUERY_ERROR);
  });

  it("maps column errors to DATABASE_QUERY_ERROR", () => {
    // Act
    const result = handleDatabaseError(new Error('column "foo" does not exist'), details);

    // Assert
    expect(result.code).toBe(DatabaseErrorCode.DATABASE_QUERY_ERROR);
  });

  it("falls back to DATABASE_UNKNOWN_ERROR for unrecognized messages", () => {
    // Act
    const result = handleDatabaseError(new Error("something else went wrong"), details);

    // Assert
    expect(result.code).toBe(DatabaseErrorCode.DATABASE_UNKNOWN_ERROR);
  });

  it("preserves details", () => {
    // Act
    const result = handleDatabaseError(new Error("connection lost"), details);

    // Assert
    expect(result.details).toEqual(details);
  });

  it("always returns status 500", () => {
    // Act
    const result = handleDatabaseError(new Error("timeout"), details);

    // Assert
    expect(result.statusCode).toBe(500);
  });
});
