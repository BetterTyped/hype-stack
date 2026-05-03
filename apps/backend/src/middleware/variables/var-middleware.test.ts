import { Hono } from "hono";

import { addContextVariables } from "./var-middleware";

describe("addContextVariables", () => {
  it("sets all provided variables on the context", async () => {
    // Arrange
    const app = new Hono<{ Variables: { foo: string; num: number; flag: boolean } }>();
    app.use(
      "*",
      addContextVariables({
        variables: { foo: "bar", num: 42, flag: true },
      }),
    );
    app.get("/test", (c) => {
      return c.json<{ foo: string; num: number; flag: boolean }>({
        foo: c.get("foo"),
        num: c.get("num"),
        flag: c.get("flag"),
      });
    });

    // Act
    const res = await app.request("/test");

    // Assert
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ foo: "bar", num: 42, flag: true });
  });

  it("does not block downstream middleware or handlers", async () => {
    // Arrange
    const app = new Hono<{ Variables: { key: string } }>();
    const order: string[] = [];
    app.use("*", addContextVariables({ variables: { key: "value" } }));
    app.use("*", async (c, next) => {
      order.push("second-middleware");
      await next();
    });
    app.get("/test", (c) => {
      order.push("handler");
      return c.json<{ key: string }>({ key: c.get("key") });
    });

    // Act
    const res = await app.request("/test");

    // Assert
    expect(res.status).toBe(200);
    expect(order).toEqual(["second-middleware", "handler"]);
  });

  it("works with an empty variables object", async () => {
    // Arrange
    const app = new Hono();
    app.use("*", addContextVariables({ variables: {} }));
    app.get("/test", (c) => c.json<{ ok: boolean }>({ ok: true }));

    // Act
    const res = await app.request("/test");

    // Assert
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("allows multiple variable middleware in sequence", async () => {
    // Arrange
    const app = new Hono<{ Variables: { a: number; b: number } }>();
    app.use("*", addContextVariables({ variables: { a: 1 } }));
    app.use("*", addContextVariables({ variables: { b: 2 } }));
    app.get("/test", (c) => {
      return c.json<{ a: number; b: number }>({ a: c.get("a"), b: c.get("b") });
    });

    // Act
    const res = await app.request("/test");

    // Assert
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ a: 1, b: 2 });
  });
});
