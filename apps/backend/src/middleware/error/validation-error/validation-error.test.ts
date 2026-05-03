import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { handleValidationError, isValidationError } from "./validation-error";
import { ValidationError, ValidationErrorCode } from "./types";

describe("isValidationError", () => {
  it("returns true for ValidationError instances", () => {
    // Arrange
    const error = new ValidationError({
      code: ValidationErrorCode.VALIDATION_ERROR,
      message: "Invalid",
      statusCode: 400,
      issues: [],
    });

    // Act & Assert
    expect(isValidationError(error)).toBe(true);
  });

  it("returns true for ZodError", () => {
    // Arrange
    const schema = z.object({ name: z.string() });
    let zodError: z.ZodError | undefined;
    try {
      schema.parse({ name: 123 });
    } catch (e) {
      zodError = e as z.ZodError;
    }

    // Act & Assert
    expect(isValidationError(zodError)).toBe(true);
  });

  it("returns true for HTTPException with status 400", () => {
    // Act & Assert
    expect(isValidationError(new HTTPException(400))).toBe(true);
  });

  it("returns false for HTTPException with non-400 status", () => {
    // Act & Assert
    expect(isValidationError(new HTTPException(500))).toBe(false);
  });

  it("returns false for plain Error", () => {
    // Act & Assert
    expect(isValidationError(new Error("bad input"))).toBe(false);
  });

  it("returns false for non-error values", () => {
    // Act & Assert
    expect(isValidationError(null)).toBe(false);
    expect(isValidationError("string")).toBe(false);
  });
});

describe("handleValidationError", () => {
  const details = { timestamp: "2026-01-01T00:00:00.000Z" };

  it("extracts issues from ZodError", () => {
    // Arrange
    const schema = z.object({ email: z.string().email() });
    let zodError: z.ZodError | undefined;
    try {
      schema.parse({ email: "not-an-email" });
    } catch (e) {
      zodError = e as z.ZodError;
    }

    // Act
    const result = handleValidationError(zodError!, details);

    // Assert
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.code).toBe(ValidationErrorCode.VALIDATION_ERROR);
    expect(result.statusCode).toBe(400);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("parses issues from HTTPException 400 with JSON message", () => {
    // Arrange
    const issuesPayload = JSON.stringify({
      issues: [{ code: "custom", path: ["field"], message: "Required", params: {} }],
    });
    const error = new HTTPException(400, { message: issuesPayload });

    // Act
    const result = handleValidationError(error, details);

    // Assert
    expect(result.statusCode).toBe(400);
    expect(result.issues.length).toBe(1);
  });

  it("handles HTTPException 400 with non-JSON message", () => {
    // Arrange
    const error = new HTTPException(400, { message: "plain text error" });

    // Act
    const result = handleValidationError(error, details);

    // Assert
    expect(result.statusCode).toBe(400);
    expect(result.issues.length).toBe(1);
    expect(result.issues[0]).toMatchObject({ message: "plain text error" });
  });

  it("handles HTTPException 400 with nested error.issues in JSON", () => {
    // Arrange
    const payload = JSON.stringify({
      error: { issues: [{ code: "custom", path: [], message: "Nested issue", params: {} }] },
    });
    const error = new HTTPException(400, { message: payload });

    // Act
    const result = handleValidationError(error, details);

    // Assert
    expect(result.issues.length).toBe(1);
  });

  it("creates a fallback issue for JSON with message field", () => {
    // Arrange
    const payload = JSON.stringify({ message: "Something is wrong" });
    const error = new HTTPException(400, { message: payload });

    // Act
    const result = handleValidationError(error, details);

    // Assert
    expect(result.issues.length).toBe(1);
    expect(result.issues[0]).toMatchObject({ message: "Something is wrong" });
  });

  it("preserves details", () => {
    // Arrange
    const schema = z.object({ x: z.number() });
    let zodError: z.ZodError | undefined;
    try {
      schema.parse({ x: "not a number" });
    } catch (e) {
      zodError = e as z.ZodError;
    }

    // Act
    const result = handleValidationError(zodError!, details);

    // Assert
    expect(result.details).toEqual(details);
  });
});
