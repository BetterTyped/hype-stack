import { setupIntegrationTest } from "@backend/testing/setup/test-utils";
import { sql } from "kysely";
import { z } from "zod";

import { assertValidQueues, defineQueue, enqueue, startQueues, stopQueues, type Task } from "./queue";

const SCHEMA = "pgboss_spec";
const payload = z.object({ value: z.string() });
type Payload = z.infer<typeof payload>;

const until = (check: () => boolean, timeoutMs = 20_000): Promise<void> =>
  vi.waitFor(
    () => {
      if (!check()) throw new Error("Timed out waiting for the queue");
    },
    { timeout: timeoutMs, interval: 100 },
  );

describe("assertValidQueues", () => {
  const queue = (name: string, concurrency?: number) => defineQueue({ name, schema: payload, concurrency, run: async () => undefined });

  it("rejects duplicate names", () => {
    expect(() => assertValidQueues([queue("same"), queue("same")])).toThrow(/duplicate queue name/);
  });

  it("rejects empty names", () => {
    expect(() => assertValidQueues([queue(" ")])).toThrow(/empty name/);
  });

  it("rejects a concurrency below 1", () => {
    expect(() => assertValidQueues([queue("zero", 0)])).toThrow(/concurrency/);
  });
});

describe("task queue", () => {
  const env = setupIntegrationTest();

  const seen: Task<Payload>[] = [];
  const exhausted: Task<Payload>[] = [];
  let running = 0;
  let peak = 0;

  const plain = defineQueue({
    name: "spec-plain",
    schema: payload,
    run: async (task) => {
      seen.push(task);
    },
  });

  const failing = defineQueue({
    name: "spec-failing",
    schema: payload,
    retryLimit: 2,
    retryDelay: 0,
    retryBackoff: false,
    run: async (task) => {
      seen.push(task);
      throw new Error("always fails");
    },
    onExhausted: async (task) => {
      exhausted.push(task);
    },
  });

  const capped = defineQueue({
    name: "spec-capped",
    schema: payload,
    concurrency: 2,
    run: async (task) => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 300));
      running -= 1;
      seen.push(task);
    },
  });

  const exclusive = defineQueue({ name: "spec-exclusive", schema: payload, exclusive: true, run: async () => undefined });

  const unregistered = defineQueue({ name: "spec-unregistered", schema: payload, run: async () => undefined });

  // The shared test environment already started the app's own (empty) registry, and startQueues
  // is a no-op while an instance is up, so swap it for this spec's queues in a throwaway schema.
  const start = async (workers: boolean) => {
    await stopQueues();
    await startQueues([plain, failing, capped, exclusive], {
      workers,
      pollingIntervalSeconds: 0.5,
      boss: { schema: SCHEMA },
    });
  };

  beforeEach(() => {
    seen.length = 0;
    exhausted.length = 0;
    running = 0;
    peak = 0;
  });

  afterEach(async () => {
    await stopQueues();
    await sql`drop schema if exists ${sql.id(SCHEMA)} cascade`.execute(env.db);
  });

  it("costs nothing until a queue is registered: no schema, no pool, and a clear error on enqueue", async () => {
    await stopQueues();

    await startQueues([], { boss: { schema: SCHEMA } });

    const schemas = await sql<{ count: string }>`
      select count(*) as count from information_schema.schemata where schema_name = ${SCHEMA}
    `.execute(env.db);
    expect(Number(schemas.rows[0]?.count)).toBe(0);
    await expect(enqueue(plain, { value: "nowhere to go" })).rejects.toThrow(/task queue is not running/);
  });

  it("runs an enqueued task with its payload and attempt number", async () => {
    await start(true);
    await enqueue(plain, { value: "hello" });

    await until(() => seen.length === 1);
    expect(seen[0]?.data).toEqual({ value: "hello" });
    expect(seen[0]?.attempt).toBe(1);
  });

  it("drops the task when the enqueueing transaction rolls back", async () => {
    await start(true);

    await env.db
      .transaction()
      .execute(async (trx) => {
        await enqueue(plain, { value: "rolled back" }, { trx });
        throw new Error("rollback");
      })
      .catch(() => undefined);
    await env.db.transaction().execute(async (trx) => {
      await enqueue(plain, { value: "committed" }, { trx });
    });

    await until(() => seen.length === 1);
    // Give a wrongly surviving task two more polls to show up.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    expect(seen.map((task) => task.data.value)).toEqual(["committed"]);
  });

  it("retries a failing task up to the limit, then reports it exhausted once", async () => {
    await start(true);
    await enqueue(failing, { value: "doomed" });

    await until(() => exhausted.length === 1);
    expect(seen.map((task) => task.attempt)).toEqual([1, 2, 3]);
    expect(exhausted[0]?.attempt).toBe(3);
  });

  it("never runs more tasks at once than the queue's concurrency", async () => {
    await start(true);
    await Promise.all(["a", "b", "c", "d", "e"].map((value) => enqueue(capped, { value })));

    await until(() => seen.length === 5);
    expect(peak).toBe(2);
  });

  it("keeps one task per key on an exclusive queue", async () => {
    await start(false);

    const first = await enqueue(exclusive, { value: "one" }, { key: "row-1" });
    const duplicate = await enqueue(exclusive, { value: "two" }, { key: "row-1" });
    const other = await enqueue(exclusive, { value: "three" }, { key: "row-2" });

    expect(first).toEqual(expect.any(String));
    expect(duplicate).toBeNull();
    expect(other).toEqual(expect.any(String));
    await expect(enqueue(exclusive, { value: "no key" })).rejects.toThrow(/needs a key/);
  });

  it("accepts tasks but runs none when workers are off", async () => {
    await start(false);
    await enqueue(plain, { value: "parked" });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    expect(seen).toHaveLength(0);
  });

  it("rejects a bad payload and an unregistered queue", async () => {
    await start(false);

    await expect(enqueue(plain, { value: 1 } as unknown as Payload)).rejects.toThrow(/expected string/i);
    await expect(enqueue(unregistered, { value: "x" })).rejects.toThrow(/not registered/);
  });
});
