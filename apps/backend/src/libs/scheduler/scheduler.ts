import { captureException } from "@sentry/node";
import { Cron } from "croner";
import { sql } from "kysely";

import { postgres } from "../../context";
import { logger } from "../logger/logger";

/**
 * In-process cron scheduler.
 *
 * The backend is a long-lived Node server, so it owns its own clock; what this module adds is the
 * machinery that makes in-process cron safe to rely on:
 *
 * - Postgres advisory locks make every fire exactly-once across instances: all replicas tick, one
 *   executes, the rest skip. Rolling deploys (old and new instance up at once) are covered by the
 *   same mechanism.
 * - A `job_run` row per job records the last executed fire time. It deduplicates near-simultaneous
 *   fires from skewed clocks, and powers `catchUp`: a job that opts in runs once on boot when its
 *   scheduled time fell inside a deploy or an outage.
 * - Real business schedules ("send X at 9:00") should NEVER live in this layer. Keep them as rows
 *   in your own tables and make the job a stateless sweeper that claims due work; then a restart
 *   can never lose anything, because there was never state here to lose.
 *
 * Keep `run` fast: claim work, kick off long work detached, return. The advisory lock and its
 * transaction stay open for the duration of `run`, which is the point for a mutex and a liability
 * for a half-hour task.
 */
export type JobDefinition = {
  /** Unique, stable identifier. Also the advisory-lock key and the `job_run` primary key. */
  name: string;
  /** Cron pattern (croner syntax: five fields, or six with leading seconds). */
  cron: string;
  /** IANA timezone for the pattern; defaults to the server's local time. */
  timezone?: string;
  /**
   * Run once on boot when the last scheduled fire was missed (the process was down when it came).
   * Off by default: a sweeper-style job does the same work on its next tick anyway, so catch-up
   * only matters for jobs where the fire time itself is the event (a nightly digest, a report).
   */
  catchUp?: boolean;
  run: () => Promise<void> | void;
};

/** Advisory-lock class id for scheduler locks, so they can never collide with other lock users. */
const LOCK_CLASS_ID = 0x4a_4f_42_53; // "JOBS"

let active: Cron[] = [];

/**
 * The most recent time the pattern fired at or before `now`, computed from the pattern itself.
 * Croner only tracks runs it performed in this process, so the walk starts from a lookback window
 * and steps forward; the windows widen until one contains a fire (jobs rarer than the widest
 * window simply get no catch-up, which is documented behavior).
 */
export const lastScheduledFire = (pattern: string, timezone: string | undefined, now: Date): Date | null => {
  const probe = new Cron(pattern, { timezone, paused: true });
  const lookbacks = [90_000, 25 * 3_600_000, 8 * 24 * 3_600_000];

  for (const lookbackMs of lookbacks) {
    let cursor = new Date(now.getTime() - lookbackMs);
    let last: Date | null = null;

    for (;;) {
      const next = probe.nextRun(cursor);
      if (!next || next.getTime() > now.getTime()) break;
      // Guard against a nextRun implementation that treats `from` inclusively.
      if (next.getTime() <= cursor.getTime()) break;
      last = next;
      cursor = next;
    }

    if (last) {
      probe.stop();
      return last;
    }
  }

  probe.stop();
  return null;
};

/** Boot-time validation: duplicate names or invalid patterns should fail loudly, not tick oddly. */
export const assertValidJobs = (jobs: JobDefinition[]): void => {
  const seen = new Set<string>();
  for (const job of jobs) {
    if (!job.name.trim()) throw new Error("Scheduler: a job has an empty name");
    if (seen.has(job.name)) throw new Error(`Scheduler: duplicate job name "${job.name}"`);
    seen.add(job.name);
    // The Cron constructor throws on an invalid pattern; surfacing it at boot beats a silent no-op.
    new Cron(job.cron, { timezone: job.timezone, paused: true }).stop();
  }
};

/**
 * One guarded execution of a job for one scheduled fire time. The transaction exists to scope the
 * advisory lock: it auto-releases on commit, rollback, crash, or dropped connection, so a dead
 * instance can never wedge a job forever. Inside the lock the `job_run` row is the second guard:
 * if another instance already executed this fire (or a later one), this run is a no-op.
 */
const executeJob = async (job: JobDefinition, fireTime: Date): Promise<void> => {
  try {
    await postgres.qb.transaction().execute(async (trx) => {
      const lock = await sql<{ locked: boolean }>`
        select pg_try_advisory_xact_lock(${LOCK_CLASS_ID}, hashtext(${job.name})) as locked
      `.execute(trx);
      if (!lock.rows[0]?.locked) return;

      const record = await trx
        .selectFrom("jobRun")
        .select("lastRunAt")
        .where("name", "=", job.name)
        .executeTakeFirst();
      if (record && record.lastRunAt.getTime() >= fireTime.getTime()) return;

      await job.run();

      await trx
        .insertInto("jobRun")
        .values({ name: job.name, lastRunAt: fireTime, updatedAt: new Date() })
        .onConflict((oc) => oc.column("name").doUpdateSet({ lastRunAt: fireTime, updatedAt: new Date() }))
        .execute();
    });
  } catch (error) {
    // The scheduler runs outside any request, so there is no error middleware above it: report to
    // Sentry and the log here, and keep the schedule alive. One bad run must not stop the clock.
    captureException(error);
    logger.error({ err: error, job: job.name }, "Scheduled job failed");
  }
};

/**
 * Start ticking every registered job. No-op in tests and when SCHEDULER_DISABLED=1, and safe to
 * call once per process; call `stopScheduler` on shutdown.
 */
export const startScheduler = (jobs: JobDefinition[]): void => {
  if (process.env.NODE_ENV === "test" || process.env.SCHEDULER_DISABLED === "1") {
    logger.info("Scheduler disabled (test environment or SCHEDULER_DISABLED)");
    return;
  }
  if (active.length > 0) return;
  if (jobs.length === 0) return;

  assertValidJobs(jobs);

  for (const job of jobs) {
    if (job.catchUp) {
      const missed = lastScheduledFire(job.cron, job.timezone, new Date());
      // executeJob's job_run guard turns this into a no-op when the fire already ran elsewhere.
      if (missed) void executeJob(job, missed);
    }

    active.push(
      new Cron(job.cron, { timezone: job.timezone, protect: true, name: job.name }, () => {
        const fireTime = lastScheduledFire(job.cron, job.timezone, new Date()) ?? new Date();
        return executeJob(job, fireTime);
      }),
    );
  }

  logger.info(`Scheduler started with ${jobs.length} job(s)`);
};

export const stopScheduler = (): void => {
  for (const cron of active) cron.stop();
  active = [];
};
