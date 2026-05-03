import { HTTPException } from "hono/http-exception";

import { handleAuthorizationError, isAuthorizationError } from "./authorization-error";
import { AuthorizationError, AuthorizationErrorCode } from "./types";

describe("isAuthorizationError", () => {
  it("returns true for AuthorizationError instances", () => {
    // Arrange
    const error = new AuthorizationError({
      code: AuthorizationErrorCode.AUTHORIZATION_FORBIDDEN,
      message: "Forbidden",
    });

    // Act & Assert
    expect(isAuthorizationError(error)).toBe(true);
  });

  it("returns false for plain Error even with permission-like message", () => {
    // Act & Assert
    expect(isAuthorizationError(new Error("forbidden"))).toBe(false);
  });

  it("returns false for non-error values", () => {
    // Act & Assert
    expect(isAuthorizationError(null)).toBe(false);
    expect(isAuthorizationError("string")).toBe(false);
  });
});

describe("handleAuthorizationError", () => {
  const details = { timestamp: "2026-01-01T00:00:00.000Z" };

  it("preserves code and message from AuthorizationError", () => {
    // Arrange
    const original = new AuthorizationError({
      code: AuthorizationErrorCode.AUTHORIZATION_MISSING_PERMISSION,
      message: "No perm",
      statusCode: 403,
    });

    // Act
    const result = handleAuthorizationError(original as unknown as Error, details);

    // Assert
    expect(result).toBeInstanceOf(AuthorizationError);
    expect(result.code).toBe(AuthorizationErrorCode.AUTHORIZATION_MISSING_PERMISSION);
    expect(result.message).toBe("No perm");
    expect(result.statusCode).toBe(403);
  });

  it("maps HTTPException 403 to AUTHORIZATION_FORBIDDEN", () => {
    // Act
    const result = handleAuthorizationError(new HTTPException(403, { message: "Nope" }), details);

    // Assert
    expect(result.code).toBe(AuthorizationErrorCode.AUTHORIZATION_FORBIDDEN);
    expect(result.statusCode).toBe(403);
    expect(result.message).toBe("Nope");
  });

  it("uses fallback message for HTTPException 403 without message", () => {
    // Arrange
    const error = new HTTPException(403);

    // Act
    const result = handleAuthorizationError(error, details);

    // Assert
    expect(result.message).toBeTruthy();
  });

  it("maps non-403 HTTPException with original status", () => {
    // Act
    const result = handleAuthorizationError(new HTTPException(500, { message: "Server error" }), details);

    // Assert
    expect(result.statusCode).toBe(500);
  });

  it("maps generic permission error messages to AUTHORIZATION_FORBIDDEN", () => {
    // Act
    const result = handleAuthorizationError(new Error("you do not have permission"), details);

    // Assert
    expect(result.code).toBe(AuthorizationErrorCode.AUTHORIZATION_FORBIDDEN);
    expect(result.message).toBe("Insufficient permissions");
  });

  it("maps forbidden messages to AUTHORIZATION_FORBIDDEN", () => {
    // Act
    const result = handleAuthorizationError(new Error("action forbidden"), details);

    // Assert
    expect(result.code).toBe(AuthorizationErrorCode.AUTHORIZATION_FORBIDDEN);
  });

  it("maps not-allowed messages to AUTHORIZATION_FORBIDDEN", () => {
    // Act
    const result = handleAuthorizationError(new Error("operation not allowed"), details);

    // Assert
    expect(result.code).toBe(AuthorizationErrorCode.AUTHORIZATION_FORBIDDEN);
  });

  it("falls back to AUTHORIZATION_FORBIDDEN for unrecognized errors", () => {
    // Act
    const result = handleAuthorizationError(new Error("unknown issue"), details);

    // Assert
    expect(result.code).toBe(AuthorizationErrorCode.AUTHORIZATION_FORBIDDEN);
    expect(result.statusCode).toBe(403);
  });

  it("preserves details in result", () => {
    // Act
    const result = handleAuthorizationError(new Error("forbidden"), details);

    // Assert
    expect(result.details).toMatchObject(details);
  });
});
