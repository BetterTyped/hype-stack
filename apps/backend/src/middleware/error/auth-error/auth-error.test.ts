import { HTTPException } from "hono/http-exception";

import { handleAuthError, isAuthError } from "./auth-error";
import { AuthError, AuthErrorCode } from "./types";

describe("isAuthError", () => {
  it("returns true for AuthError instances", () => {
    // Arrange
    const error = new AuthError({
      code: AuthErrorCode.AUTH_UNAUTHORIZED,
      message: "Unauthorized",
      statusCode: 401,
    });

    // Act & Assert
    expect(isAuthError(error)).toBe(true);
  });

  it("returns true for HTTPException 401", () => {
    // Act & Assert
    expect(isAuthError(new HTTPException(401))).toBe(true);
  });

  it("returns true for HTTPException 403", () => {
    // Act & Assert
    expect(isAuthError(new HTTPException(403))).toBe(true);
  });

  it("returns false for HTTPException with other status", () => {
    // Act & Assert
    expect(isAuthError(new HTTPException(500))).toBe(false);
  });

  it("returns true for errors with auth-related messages", () => {
    // Act & Assert
    expect(isAuthError(new Error("unauthorized access"))).toBe(true);
    expect(isAuthError(new Error("invalid token"))).toBe(true);
    expect(isAuthError(new Error("authentication failed"))).toBe(true);
    expect(isAuthError(new Error("permission denied"))).toBe(true);
    expect(isAuthError(new Error("access denied"))).toBe(true);
    expect(isAuthError(new Error("user not found"))).toBe(true);
    expect(isAuthError(new Error("invalid credentials"))).toBe(true);
    expect(isAuthError(new Error("forbidden resource"))).toBe(true);
  });

  it("returns false for non-auth errors", () => {
    // Act & Assert
    expect(isAuthError(new Error("database connection failed"))).toBe(false);
    expect(isAuthError(new Error("file not found"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    // Act & Assert
    expect(isAuthError(null)).toBe(false);
    expect(isAuthError("string")).toBe(false);
    expect(isAuthError(42)).toBe(false);
  });
});

describe("handleAuthError", () => {
  const details = { timestamp: "2026-01-01T00:00:00.000Z" };

  it("returns the AuthError fields when given an AuthError", () => {
    // Arrange
    const original = new AuthError({
      code: AuthErrorCode.AUTH_COOKIE_NOT_FOUND,
      message: "Cookie missing",
      statusCode: 401,
    });

    // Act
    const result = handleAuthError(original as unknown as Error, details);

    // Assert
    expect(result).toBeInstanceOf(AuthError);
    expect(result.code).toBe(AuthErrorCode.AUTH_COOKIE_NOT_FOUND);
    expect(result.message).toBe("Cookie missing");
    expect(result.statusCode).toBe(401);
  });

  it("maps HTTPException 401 to AUTH_UNAUTHORIZED", () => {
    // Act
    const result = handleAuthError(new HTTPException(401), details);

    // Assert
    expect(result.code).toBe(AuthErrorCode.AUTH_UNAUTHORIZED);
    expect(result.statusCode).toBe(401);
  });

  it("maps HTTPException 403 to AUTH_FORBIDDEN", () => {
    // Act
    const result = handleAuthError(new HTTPException(403), details);

    // Assert
    expect(result.code).toBe(AuthErrorCode.AUTH_FORBIDDEN);
    expect(result.statusCode).toBe(403);
  });

  it("maps token-expired messages to AUTH_TOKEN_EXPIRED", () => {
    // Act
    const result = handleAuthError(new Error("token has expired"), details);

    // Assert
    expect(result.code).toBe(AuthErrorCode.AUTH_TOKEN_EXPIRED);
    expect(result.statusCode).toBe(401);
  });

  it("maps token-invalid messages to AUTH_TOKEN_INVALID", () => {
    // Act
    const result = handleAuthError(new Error("token is invalid or malformed"), details);

    // Assert
    expect(result.code).toBe(AuthErrorCode.AUTH_TOKEN_INVALID);
    expect(result.statusCode).toBe(401);
  });

  it("maps user-not-found messages to AUTH_USER_NOT_FOUND", () => {
    // Act
    const result = handleAuthError(new Error("user not found"), details);

    // Assert
    expect(result.code).toBe(AuthErrorCode.AUTH_USER_NOT_FOUND);
    expect(result.statusCode).toBe(404);
  });

  it("maps unauthorized messages to AUTH_UNAUTHORIZED", () => {
    // Act
    const result = handleAuthError(new Error("unauthorized request"), details);

    // Assert
    expect(result.code).toBe(AuthErrorCode.AUTH_UNAUTHORIZED);
    expect(result.statusCode).toBe(401);
  });

  it("maps forbidden/permission messages to AUTH_FORBIDDEN", () => {
    // Act
    const result = handleAuthError(new Error("forbidden action, missing permission"), details);

    // Assert
    expect(result.code).toBe(AuthErrorCode.AUTH_FORBIDDEN);
    expect(result.statusCode).toBe(403);
  });

  it("falls back to AUTH_UNAUTHORIZED for unrecognized errors", () => {
    // Act
    const result = handleAuthError(new Error("something weird"), details);

    // Assert
    expect(result.code).toBe(AuthErrorCode.AUTH_UNAUTHORIZED);
    expect(result.statusCode).toBe(401);
  });

  it("preserves details", () => {
    // Act
    const result = handleAuthError(new Error("unauthorized"), details);

    // Assert
    expect(result.details).toEqual(details);
  });
});
