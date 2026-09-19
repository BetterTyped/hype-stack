import { captureException } from "@sentry/node";
import type { Transaction } from "kysely";
import { fromKysely, PgBoss, type ConstructorOptions, type JobWithMetadata } from "pg-boss";
import type { z } from "zod";

import type { DB } from "../../db/postgres/types/types";
import { logger } from "../logger/logger";

/**
 * Task queue on Postgres (pg-boss).
 *
 * The scheduler answers "when", this module answers "how much at once". A cron job is a clock
 * tick that should return fast; anything slow or heavy (parsing an upload, calling a model,
 * sending a batch) belongs here as a task:
 *
 * - Tasks live in Postgres, in their own `pgboss` schema, so there is nothing extra to deploy. The
 *   schema and its connection pool only appear once a queue is registered; until then this module
 *   does nothing at all.
 *   `enqueue` accepts the caller's transaction: the task commits or rolls back together with the
 *   row it is about, so a row can never sit "queued" with no task behind it.
 * - Tasks run inside the backend process, with a per-queue concurrency cap. Every instance works
 *   them, so adding a replica adds capacity.
 * - A failed run is retried with backoff up to `retryLimit`, then `onExhausted` fires once so the
 *   feature can mark its own row as failed. A handler that hits an error no retry can fix (bad
 *   file, unsupported format) should record that itself and return normally.
 * - Handlers must be safe to run twice. A crash mid-run means the task runs again, so checkpoint
 *   progress in your own tables and resume from it.
 *
 * Workers poll; LISTEN/NOTIFY is left off on purpose so pooled connections (pgbouncer in
 * transaction mode) keep working.
 */
export type Task<T> = {
  id: string;
  data: T;
  /** 1 on the first run, 2 on the first retry, and so on. */
  attempt: number;
  /** Aborted when the task expires or the process is shutting down. Pass it to slow calls. */
  signal: AbortSignal;
};

export type QueueDefinition<T = unknown> = {
  /** Unique, stable identifier. Renaming it orphans the tasks already queued under the old name. */
  name: string;
  /** Validates the payload on the way in and again before the handler runs. */
  schema: z.ZodType<T>;
  /** Tasks this queue runs at once per instance. Defaults to 1. */
  concurrency?: number;
  /** Retries after the first failed run. Defaults to 3. */
  retryLimit?: number;
  /** Seconds before the first retry; doubles per retry while `retryBackoff` is on. Defaults to 15. */
  retryDelay?: number;
  /** Defaults to true. */
  retryBackoff?: boolean;
  /** A run longer than this is failed and retried. Defaults to 15 minutes. */
  expireInSeconds?: number;
  /**
   * With `true`, at most one task per `key` can be waiting or running; enqueueing a duplicate is a
   * no-op. Use it when the task is "process row X" and a double click must not process it twice.
   */
  exclusive?: boolean;
  run: (task: Task<T>) => Promise<void>;
  /** Called once, after the last retry failed. The error is reported to Sentry either way. */
  onExhausted?: (task: Task<T>, error: unknown) => Promise<void>;
};

/**
 * A queue of any payload type, for the registry array and the boot functions. `unknown` cannot
 * stand in here: a handler typed for one payload is not a handler for every payload.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyQueueDefinition = QueueDefinition<any>;

export type EnqueueOptions = {
  /** Enqueue inside this transaction, so the task exists only if the transaction commits. */
  trx?: Transaction<DB>;
  /** Deduplication key for an `exclusive` queue. */
  key?: string;
  /** Do not start before this time (Date) or this many seconds from now (number). */
  startAfter?: Date | number;
};

export type StartQueuesOptions = {
  /** Overrides the test-environment default. Specs turn workers on to exercise retries. */
  workers?: boolean;
  /** Seconds between polls of an idle queue. Defaults to 2. */
  pollingIntervalSeconds?: number;
  /** Passed through to pg-boss, after the defaults below. */
  boss?: ConstructorOptions;
};

const SCHEMA = "pgboss";

let boss: PgBoss | null = null;
let registered = new Set<string>();

/** Typed identity function; it exists so `run` and `onExhausted` infer `T` from `schema`. */
export const defineQueue = <T>(definition: QueueDefinition<T>): QueueDefinition<T> => definition;

/** Boot-time validation: a duplicate or empty name should fail loudly, not split tasks oddly. */
export const assertValidQueues = (queues: AnyQueueDefinition[]): void => {
  const seen = new Set<string>();
  for (const queue of queues) {
    if (!queue.name.trim()) throw new Error("Queue: a queue has an empty name");
    if (seen.has(queue.name)) throw new Error(`Queue: duplicate queue name "${queue.name}"`);
    if (queue.concurrency !== undefined && (!Number.isInteger(queue.concurrency) || queue.concurrency < 1)) {
      throw new Error(`Queue: "${queue.name}" needs a concurrency of 1 or more`);
    }
    seen.add(queue.name);
  }
};

const toTask = <T>(queue: QueueDefinition<T>, job: JobWithMetadata<unknown>): Task<T> => ({
  id: job.id,
  data: queue.schema.parse(job.data),
  attempt: job.retryCount + 1,
  signal: job.signal,
});

/**
 * One guarded run of a task. Tasks run outside any request, so there is no error middleware above
 * them: a failure is rethrown for pg-boss to schedule the retry, and only the last one is reported,
 * after the feature had its chance to mark the row failed.
 */
export const executeTask = async <T>(queue: QueueDefinition<T>, job: JobWithMetadata<unknown>): Promise<void> => {
  const task = toTask(queue, job);
  try {
    await queue.run(task);
  } catch (error) {
    const exhausted = job.retryCount >= job.retryLimit;
    logger.warn({ err: error, queue: queue.name, task: task.id, attempt: task.attempt, exhausted }, "Task failed");
    if (exhausted) {
      captureException(error);
      if (queue.onExhausted) await queue.onExhausted(task, error);
    }
    throw error;
  }
};

const registerQueue = async (instance: PgBoss, queue: AnyQueueDefinition): Promise<void> => {
  const settings = {
    retryLimit: queue.retryLimit ?? 3,
    retryDelay: queue.retryDelay ?? 15,
    retryBackoff: queue.retryBackoff ?? true,
    expireInSeconds: queue.expireInSeconds ?? 900,
  };
  const existing = await instance.getQueue(queue.name);
  if (!existing) {
    await instance.createQueue(queue.name, { ...settings, policy: queue.exclusive ? "exclusive" : "standard" });
    return;
  }
  // The policy of an existing queue cannot change; the retry settings can, so a deploy that tunes
  // them takes effect without anyone touching the database.
  await instance.updateQueue(queue.name, settings);
};

/**
 * Connect, install or migrate the `pgboss` schema, register every queue, and (unless under test)
 * start working them. Safe to call once per process; call `stopQueues` on shutdown.
 */
export const startQueues = async (queues: AnyQueueDefinition[], options: StartQueuesOptions = {}): Promise<void> => {
  if (boss) return;
  // Free until used: a project with no queue gets no connection pool and no `pgboss` schema. The
  // registry ships empty, and the first pack that adds a queue turns this on.
  if (queues.length === 0) return;
  assertValidQueues(queues);

  const instance = new PgBoss({
    connectionString: process.env.DATABASE_URL,
    schema: SCHEMA,
    // Small on purpose: this pool sits next to the Prisma and Kysely pools on the same database.
    max: 4,
    // Cron stays with the scheduler module; one clock is enough.
    schedule: false,
    ...options.boss,
  });
  instance.on("error", (error) => {
    captureException(error);
    logger.error({ err: error }, "Task queue error");
  });
  await instance.start();

  await Promise.all(queues.map((queue) => registerQueue(instance, queue)));

  boss = instance;
  registered = new Set(queues.map((queue) => queue.name));

  const working = options.workers ?? process.env.NODE_ENV !== "test";
  if (working) {
    await Promise.all(
      queues.map((queue) =>
        instance.work(
          queue.name,
          {
            includeMetadata: true,
            batchSize: 1,
            localConcurrency: queue.concurrency ?? 1,
            pollingIntervalSeconds: options.pollingIntervalSeconds ?? 2,
          },
          // batchSize is 1, so this is always a single task.
          async (jobs: JobWithMetadata<unknown>[]) => {
            await Promise.all(jobs.map((job) => executeTask(queue, job)));
          },
        ),
      ),
    );
  }

  logger.info(`Task queue started with ${queues.length} queue(s), workers ${working ? "on" : "off"}`);
};

/**
 * Add a task. Returns the task id, or null when an `exclusive` queue already holds a task for the
 * same key. Throws when the payload does not match the queue's schema or the queue was never
 * registered in src/queues/index.ts.
 */
export const enqueue = async <T>(
  queue: QueueDefinition<T>,
  data: T,
  options: EnqueueOptions = {},
): Promise<string | null> => {
  if (!boss) {
    throw new Error(
      `Queue: cannot enqueue "${queue.name}", the task queue is not running. ` +
        "Register the queue in src/queues/index.ts (it only starts when at least one is registered).",
    );
  }
  if (!registered.has(queue.name)) {
    throw new Error(`Queue: "${queue.name}" is not registered in src/queues/index.ts`);
  }
  if (queue.exclusive && !options.key) throw new Error(`Queue: "${queue.name}" is exclusive and needs a key`);

  const payload = queue.schema.parse(data);
  return boss.send(queue.name, payload as object, {
    singletonKey: options.key,
    startAfter: options.startAfter,
    ...(options.trx ? { db: fromKysely(options.trx) } : {}),
  });
};

/** Lets in-flight tasks finish (up to 30s), then closes the pool. */
export const stopQueues = async (): Promise<void> => {
  if (!boss) return;
  const instance = boss;
  boss = null;
  registered = new Set();
  await instance.stop({ graceful: true, timeout: 30_000 });
};
