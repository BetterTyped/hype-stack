import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { ApplicationError, ApplicationErrorCode } from "./application-error/types";
import { AuthError, AuthErrorCode } from "./auth-error/types";
import { AuthorizationError, AuthorizationErrorCode } from "./authorization-error/types";
import { DatabaseError } from "./db-error/types";
import { errorMiddleware, onError } from "./error-middleware";
import { ValidationError, ValidationErrorCode } from "./validation-error/types";

describe("onError", () => {
  it("returns ApplicationError as-is without wrapping", () => {
    // Arrange
    const error = new ApplicationError({
      code: ApplicationErrorCode.NOT_FOUND,
      message: "Not found",
      statusCode: 404,
    });

    // Act
    const result = onError(error as unknown as Error);

    // Assert
    expect(result).toBe(error);
  });

  it("handles ZodError and returns ValidationError", () => {
    // Arrange
    const schema = z.object({ name: z.string() });
    let zodError: z.ZodError | undefined;
    try {
      schema.parse({ name: 123 });
    } catch (e) {
      zodError = e as z.ZodError;
    }

    // Act
    const result = onError(zodError as unknown as Error);

    // Assert
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.statusCode).toBe(400);
  });

  it("handles AuthError and returns AuthError", () => {
    // Arrange
    const error = new AuthError({
      code: AuthErrorCode.AUTH_COOKIE_NOT_FOUND,
      message: "No cookie",
      statusCode: 401,
    });

    // Act
    const result = onError(error as unknown as Error);

    // Assert
    expect(result).toBeInstanceOf(AuthError);
    expect(result.statusCode).toBe(401);
  });

  it("handles HTTPException 401 as auth error", () => {
    // Act
    const result = onError(new HTTPException(401) as unknown as Error);

    // Assert
    expect(result).toBeInstanceOf(AuthError);
    expect(result.statusCode).toBe(401);
  });

  it("handles AuthorizationError", () => {
    // Arrange
    const error = new AuthorizationError({
      code: AuthorizationErrorCode.AUTHORIZATION_FORBIDDEN,
      message: "Forbidden",
    });

    // Act
    const result = onError(error as unknown as Error);

    // Assert
    expect(result).toBeInstanceOf(AuthorizationError);
    expect(result.statusCode).toBe(403);
  });

  it("handles database-related errors", () => {
    // Act
    const result = onError(new Error("database connection refused"));

    // Assert
    expect(result).toBeInstanceOf(DatabaseError);
    expect(result.statusCode).toBe(500);
  });

  it("falls back to ApplicationError for unknown errors", () => {
    // Act
    const result = onError(new Error("totally unexpected"));

    // Assert
    expect(result).toBeInstanceOf(ApplicationError);
    expect(result.statusCode).toBe(500);
  });
});

describe("errorMiddleware", () => {
  function createApp() {
    const app = new Hono();
    app.use("*", errorMiddleware);
    app.onError((err, c) => {
      const error = onError(err);
      return c.json<ReturnType<typeof onError>>(error, error.statusCode);
    });
    return app;
  }

  it("passes through successful responses", async () => {
    // Arrange
    const app = createApp();
    app.get("/ok", (c) => c.json<{ status: string }>({ status: "ok" }));

    // Act
    const res = await app.request("/ok");

    // Assert
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("catches thrown ApplicationError and returns JSON with correct status", async () => {
    // Arrange
    const app = createApp();
    app.get("/error", () => {
      throw new ApplicationError({
        code: ApplicationErrorCode.NOT_FOUND,
        message: "Resource missing",
        statusCode: 404,
      });
    });

    // Act
    const res = await app.request("/error");

    // Assert
    expect(res.status).toBe(404);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.code).toBe(ApplicationErrorCode.NOT_FOUND);
    expect(body.message).toBe("Resource missing");
  });

  it("catches thrown AuthError and returns 401", async () => {
    // Arrange
    const app = createApp();
    app.get("/auth-error", () => {
      throw new AuthError({
        code: AuthErrorCode.AUTH_UNAUTHORIZED,
        message: "Not logged in",
        statusCode: 401,
      });
    });

    // Act
    const res = await app.request("/auth-error");

    // Assert
    expect(res.status).toBe(401);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.code).toBe(AuthErrorCode.AUTH_UNAUTHORIZED);
  });

  it("catches ZodError and returns 400 with validation info", async () => {
    // Arrange
    const app = createApp();
    app.get("/validate", () => {
      z.object({ id: z.number() }).parse({ id: "not-a-number" });
      return new Response("unreachable");
    });

    // Act
    const res = await app.request("/validate");

    // Assert
    expect(res.status).toBe(400);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.code).toBe(ValidationErrorCode.VALIDATION_ERROR);
  });

  it("catches generic Error and returns 500", async () => {
    // Arrange
    const app = createApp();
    app.get("/crash", () => {
      throw new Error("unexpected failure");
    });

    // Act
    const res = await app.request("/crash");

    // Assert
    expect(res.status).toBe(500);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.statusCode).toBe(500);
  });

  it("catches HTTPException and returns appropriate status", async () => {
    // Arrange
    const app = createApp();
    app.get("/rate-limit", () => {
      throw new HTTPException(429, { message: "Too many requests" });
    });

    // Act
    const res = await app.request("/rate-limit");

    // Assert
    expect(res.status).toBe(429);
  });
});
