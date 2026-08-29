import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { createAppSwapper, createBootApp } from "./boot-app";

describe("createBootApp", () => {
  it("serves boot state on /health and 503 with the same state everywhere else", async () => {
    // Arrange
    const app = createBootApp();

    // Act
    const health = await app.request("/health");
    const other = await app.request("/users/me");

    // Assert
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ status: "ok" });
    expect(other.status).toBe(503);
    expect(await other.json()).toEqual({ status: "ok" });
  });
});

describe("createAppSwapper", () => {
  it("survives requests during initialization and swaps in the full app afterwards", async () => {
    // Arrange - the regression: a health probe or open tab hits the server
    // in the window between listen and finished initialization.
    const apps = createAppSwapper(createBootApp());
    const during = await apps.fetch(new Request("http://localhost/users/me"));

    // Act - initialization builds the complete app on the side (this must not
    // throw even though the boot app has already dispatched) and swaps it in.
    const initialized = new Hono();
    initialized.get("/users/me", (c) => c.json<{ ok: boolean }>({ ok: true }));
    apps.set(initialized);
    const after = await apps.fetch(new Request("http://localhost/users/me"));

    // Assert
    expect(during.status).toBe(503);
    expect(after.status).toBe(200);
    expect(await after.json()).toEqual({ ok: true });
  });

  it("documents why the swap exists: Hono refuses new routes once a request was dispatched", async () => {
    // Arrange - the failure mode the swapper prevents. If this stops throwing,
    // Hono lifted the restriction and the swap indirection can be revisited.
    const app = new Hono();
    app.get("/health", (c) => c.text("ok"));

    // Act
    await app.request("/health");

    // Assert
    expect(() => app.get("/late", (c) => c.text("late"))).toThrowError(/matcher is already built/i);
  });
});
