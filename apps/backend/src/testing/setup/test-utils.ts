import type { ValkeyClient } from "@backend/cache/valkey/initialize-valkey";
import { initializeValkeyClient } from "@backend/cache/valkey/initialize-valkey";
import { validateEnv } from "@backend/config/env/env.config";
import * as context from "@backend/context";
import { setupContext } from "@backend/context";
import { initializePostgresDb } from "@backend/db/postgres/initialize";
import { logger } from "@backend/libs/logger/logger";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";

type PostgresClient = Awaited<ReturnType<typeof initializePostgresDb>>;
type DbType = PostgresClient["qb"];
export type TestDb = DbType;

export class TestEnv {
  public db: DbType;
  public postgres: PostgresClient;
  public valkey: ValkeyClient;

  constructor(postgres: PostgresClient, valkey: ValkeyClient) {
    this.postgres = postgres;
    this.db = postgres.qb;
    this.valkey = valkey;
  }

  async resetDatabase(): Promise<void> {
    const tables = Prisma.dmmf.datamodel.models.map((model) => model.dbName).filter((table) => table);

    await this.postgres.$transaction([
      // oxlint-disable-next-line unicorn/no-useless-spread
      ...tables.map((table) => this.postgres.$executeRawUnsafe(`TRUNCATE ${table} CASCADE;`)),
    ]);
  }

  async flushValkey(): Promise<void> {
    try {
      await this.valkey.flushdb();
    } catch (error) {
      logger.error({ error }, "Error flushing Valkey:");
      throw error;
    }
  }

  async flushAll(): Promise<void> {
    await Promise.all([this.resetDatabase(), this.flushValkey()]);
  }

  async close(): Promise<void> {
    await Promise.all([this.db.destroy(), this.postgres.$disconnect(), this.valkey.quit()]);
  }
}

let sharedTestEnv: TestEnv | undefined;
let testHonoApp: Hono | undefined;

/**
 * Call this in a `beforeAll` block inside integration test files that need
 * real database, cache, and context connections.
 *
 * Unit tests that only mock external services should NOT call this.
 *
 * @example
 * ```ts
 * const env = setupIntegrationTest();
 *
 * beforeEach(async () => {
 *   await env.flushAll();
 * });
 * ```
 */
export function setupIntegrationTest(): TestEnv {
  beforeAll(async () => {
    if (!sharedTestEnv) {
      validateEnv();

      testHonoApp = new Hono();
      await setupContext(testHonoApp);

      sharedTestEnv = new TestEnv(context.postgres, context.valkey);
    }
  });

  return new Proxy({} as TestEnv, {
    get(_target, prop) {
      if (!sharedTestEnv) {
        throw new Error(
          `Test environment not initialized when accessing '${String(prop)}'. ` +
            "Call setupIntegrationTest() at the top of your test file and ensure beforeAll has completed.",
        );
      }
      const value = sharedTestEnv[prop as keyof TestEnv];
      return typeof value === "function" ? value.bind(sharedTestEnv) : value;
    },
  });
}

/**
 * Get the shared Hono app instance (only available after setupIntegrationTest).
 */
export function getTestApp(): Hono {
  if (!testHonoApp) {
    throw new Error("Test app not initialized. Call setupIntegrationTest() first.");
  }
  return testHonoApp;
}

/**
 * @deprecated Use `setupIntegrationTest()` instead. This is kept for backward compat.
 */
export function getTestEnv(): TestEnv {
  return new Proxy({} as TestEnv, {
    get(_target, prop) {
      if (!sharedTestEnv) {
        throw new Error(
          `Global test cleanup not initialized when accessing '${String(prop)}'. ` +
            "Call setupIntegrationTest() in your test file's beforeAll.",
        );
      }
      const value = sharedTestEnv[prop as keyof TestEnv];
      return typeof value === "function" ? value.bind(sharedTestEnv) : value;
    },
  });
}

export function createTestEnvFromContext(postgres: PostgresClient, valkey: ValkeyClient): TestEnv {
  return new TestEnv(postgres, valkey);
}

export async function waitForServices(): Promise<void> {
  const maxRetries = 30;
  const retryDelay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const postgres = await initializePostgresDb();
      await postgres.qb.destroy();
      await postgres.$disconnect();
      break;
    } catch {
      if (i === maxRetries - 1) throw new Error("PostgreSQL not ready");
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  for (let i = 0; i < maxRetries; i++) {
    try {
      const valkey = await initializeValkeyClient();
      await valkey.ping();
      await valkey.quit();
      break;
    } catch {
      if (i === maxRetries - 1) throw new Error("Valkey not ready");
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}
