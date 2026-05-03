import { HTTPException } from "hono/http-exception";

import { handleApplicationError, isApplicationError } from "./application-error";
import { ApplicationError, ApplicationErrorCode } from "./types";

describe("isApplicationError", () => {
  it("returns true for ApplicationError instances", () => {
    // Arrange
    const error = new ApplicationError({
      code: ApplicationErrorCode.NOT_FOUND,
      message: "Not found",
      statusCode: 404,
    });

    // Act & Assert
    expect(isApplicationError(error)).toBe(true);
  });

  it("returns false for plain Error", () => {
    // Act & Assert
    expect(isApplicationError(new Error("nope"))).toBe(false);
  });

  it("returns false for non-error values", () => {
    // Act & Assert
    expect(isApplicationError(null)).toBe(false);
    expect(isApplicationError("string")).toBe(false);
    expect(isApplicationError(42)).toBe(false);
  });
});

describe("handleApplicationError", () => {
  const details = { timestamp: "2026-01-01T00:00:00.000Z" };

  it("maps HTTPException 400 to BAD_REQUEST", () => {
    // Arrange
    const error = new HTTPException(400, { message: "Bad input" });

    // Act
    const result = handleApplicationError(error, details);

    // Assert
    expect(result).toBeInstanceOf(ApplicationError);
    expect(result.code).toBe(ApplicationErrorCode.BAD_REQUEST);
    expect(result.statusCode).toBe(400);
    expect(result.message).toBe("Bad input");
  });

  it("maps HTTPException 404 to NOT_FOUND", () => {
    // Arrange
    const error = new HTTPException(404, { message: "Missing" });

    // Act
    const result = handleApplicationError(error, details);

    // Assert
    expect(result.code).toBe(ApplicationErrorCode.NOT_FOUND);
    expect(result.statusCode).toBe(404);
  });

  it("maps HTTPException 429 to RATE_LIMIT_EXCEEDED", () => {
    // Arrange
    const error = new HTTPException(429);

    // Act
    const result = handleApplicationError(error, details);

    // Assert
    expect(result.code).toBe(ApplicationErrorCode.RATE_LIMIT_EXCEEDED);
    expect(result.statusCode).toBe(429);
  });

  it("maps HTTPException 503 to SERVICE_UNAVAILABLE", () => {
    // Arrange
    const error = new HTTPException(503);

    // Act
    const result = handleApplicationError(error, details);

    // Assert
    expect(result.code).toBe(ApplicationErrorCode.SERVICE_UNAVAILABLE);
    expect(result.statusCode).toBe(503);
  });

  it("maps unknown HTTPException status to INTERNAL_SERVER_ERROR", () => {
    // Arrange
    const error = new HTTPException(502, { message: "Bad gateway" });

    // Act
    const result = handleApplicationError(error, details);

    // Assert
    expect(result.code).toBe(ApplicationErrorCode.INTERNAL_SERVER_ERROR);
    expect(result.statusCode).toBe(502);
    expect(result.message).toBe("Bad gateway");
  });

  it("maps generic Error to 500 INTERNAL_SERVER_ERROR", () => {
    // Arrange
    const error = new Error("Something broke");

    // Act
    const result = handleApplicationError(error, details);

    // Assert
    expect(result.code).toBe(ApplicationErrorCode.INTERNAL_SERVER_ERROR);
    expect(result.statusCode).toBe(500);
    expect(result.message).toBe("Internal server error");
  });

  it("preserves the provided details", () => {
    // Arrange
    const error = new Error("fail");

    // Act
    const result = handleApplicationError(error, details);

    // Assert
    expect(result.details).toEqual(details);
  });

  it("uses default messages when HTTPException has none", () => {
    // Arrange
    const error = new HTTPException(400);

    // Act
    const result = handleApplicationError(error, details);

    // Assert
    expect(result.message).toBeTruthy();
  });
});
