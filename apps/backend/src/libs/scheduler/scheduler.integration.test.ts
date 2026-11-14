import { executeJob, stopScheduler, type JobDefinition } from "./scheduler";
import { postgres } from "@backend/context";
import { setupIntegrationTest } from "@backend/testing/setup/test-utils";

const env = setupIntegrationTest();

beforeEach(async () => {
  await env.flushAll();
});

afterAll(async () => {
  await stopScheduler();
});

/** More than the query pool holds (pg's default is ten connections). */
const JOBS_AT_ONCE = 12;

const within = <T>(ms: number, work: Promise<T>): Promise<T> => {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`Jobs were still running after ${ms} ms`)), ms);
  });
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
};

describe("executeJob", () => {
  // Each job's lock used to hold a connection from the pool its own queries need. With ten jobs
  // due in the same minute and ten connections, none of them could run a query, and every later
  // query in the process waited behind them until a restart.
  it("finishes every job when more are due at once than the query pool has connections", async () => {
    // Arrange
    const fireTime = new Date("2026-11-07T05:00:00.000Z");
    const ran: string[] = [];
    const jobs: JobDefinition[] = Array.from({ length: JOBS_AT_ONCE }, (_unused, index) => ({
      name: `job-${index}`,
      cron: "* * * * *",
      run: async () => {
        await postgres.qb.selectFrom("jobRun").select("name").execute();
        ran.push(`job-${index}`);
      },
    }));

    // Act
    await within(10_000, Promise.all(jobs.map((job) => executeJob(job, fireTime))));

    // Assert
    expect(ran).toHaveLength(JOBS_AT_ONCE);
    const recorded = await postgres.qb.selectFrom("jobRun").select(["name", "lastRunAt"]).execute();
    expect(recorded).toHaveLength(JOBS_AT_ONCE);
    expect(recorded.every((row) => row.lastRunAt.getTime() === fireTime.getTime())).toBe(true);
  });

  it("runs a fire once, however many instances pick it up", async () => {
    // Arrange
    const fireTime = new Date("2026-11-07T05:00:00.000Z");
    let runs = 0;
    const job: JobDefinition = {
      name: "once",
      cron: "* * * * *",
      run: async () => {
        runs += 1;
        await postgres.qb.selectFrom("jobRun").select("name").execute();
      },
    };

    // Act
    await within(
      10_000,
      Promise.all([executeJob(job, fireTime), executeJob(job, fireTime), executeJob(job, fireTime)]),
    );
    await executeJob(job, fireTime);

    // Assert
    expect(runs).toBe(1);
  });
});
