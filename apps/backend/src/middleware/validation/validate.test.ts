import { Hono } from "hono";
import { z } from "zod";

import { errorMiddleware, onError } from "../error/error-middleware";
import { ValidationErrorCode } from "../error/validation-error/types";
import { validate } from "./validate";

describe("validate middleware", () => {
  function createApp() {
    const app = new Hono();
    app.use("*", errorMiddleware);
    app.onError((err, c) => {
      const error = onError(err);
      return c.json<ReturnType<typeof onError>>(error, error.statusCode);
    });
    return app;
  }

  describe("json validation", () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().int().positive(),
    });

    it("passes valid JSON body through to the handler", async () => {
      // Arrange
      const app = createApp();
      app.post("/users", validate("json", schema), (c) => {
        const body = c.req.valid("json");
        return c.json<{ received: z.infer<typeof schema> }>({ received: body });
      });

      // Act
      const res = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Alice", age: 30 }),
      });

      // Assert
      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expect(body.received).toEqual({ name: "Alice", age: 30 });
    });

    it("returns 400 for invalid JSON body", async () => {
      // Arrange
      const app = createApp();
      app.post("/users", validate("json", schema), (c) => {
        return c.json<{ received: z.infer<typeof schema> }>({ received: c.req.valid("json") });
      });

      // Act
      const res = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", age: -5 }),
      });

      // Assert
      expect(res.status).toBe(400);
      const body = (await res.json()) as Record<string, unknown>;
      expect(body.code).toBe(ValidationErrorCode.VALIDATION_ERROR);
    });
  });

  describe("query validation", () => {
    const schema = z.object({
      page: z.coerce.number().int().positive(),
    });

    it("passes valid query params", async () => {
      // Arrange
      const app = createApp();
      app.get("/items", validate("query", schema), (c) => {
        const query = c.req.valid("query");
        return c.json<{ page: number }>({ page: query.page });
      });

      // Act
      const res = await app.request("/items?page=2");

      // Assert
      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expect(body.page).toBe(2);
    });

    it("returns 400 for invalid query params", async () => {
      // Arrange
      const app = createApp();
      app.get("/items", validate("query", schema), (c) => {
        return c.json<z.infer<typeof schema>>(c.req.valid("query"));
      });

      // Act
      const res = await app.request("/items?page=abc");

      // Assert
      expect(res.status).toBe(400);
    });
  });

  describe("param validation", () => {
    const schema = z.object({
      id: z.string().uuid(),
    });

    it("passes valid params", async () => {
      // Arrange
      const app = createApp();
      app.get("/items/:id", validate("param", schema), (c) => {
        const params = c.req.valid("param");
        return c.json<{ id: string }>({ id: params.id });
      });
      const uuid = "550e8400-e29b-41d4-a716-446655440000";

      // Act
      const res = await app.request(`/items/${uuid}`);

      // Assert
      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expect(body.id).toBe(uuid);
    });

    it("returns 400 for invalid params", async () => {
      // Arrange
      const app = createApp();
      app.get("/items/:id", validate("param", schema), (c) => {
        return c.json<z.infer<typeof schema>>(c.req.valid("param"));
      });

      // Act
      const res = await app.request("/items/not-a-uuid");

      // Assert
      expect(res.status).toBe(400);
    });
  });

  describe("strips extra fields via schema", () => {
    const strictSchema = z
      .object({
        allowed: z.string(),
      })
      .strict();

    it("rejects extra fields with strict schema", async () => {
      // Arrange
      const app = createApp();
      app.post("/strict", validate("json", strictSchema), (c) => {
        return c.json<z.infer<typeof strictSchema>>(c.req.valid("json"));
      });

      // Act
      const res = await app.request("/strict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowed: "ok", extra: "nope" }),
      });

      // Assert
      expect(res.status).toBe(400);
    });
  });
});
