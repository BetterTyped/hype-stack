import { assertValidJobs, lastScheduledFire, type JobDefinition } from "./scheduler";

const job = (overrides: Partial<JobDefinition> = {}): JobDefinition => ({
  name: "test-job",
  cron: "* * * * *",
  run: () => undefined,
  ...overrides,
});

describe("lastScheduledFire", () => {
  it("finds the previous minute fire for an every-minute pattern", () => {
    const now = new Date("2026-08-27T12:30:45.000Z");
    const fire = lastScheduledFire("* * * * *", "UTC", now);
    expect(fire?.toISOString()).toBe("2026-08-27T12:30:00.000Z");
  });

  it("includes a fire landing exactly on now", () => {
    const now = new Date("2026-08-27T12:30:00.000Z");
    const fire = lastScheduledFire("*/5 * * * *", "UTC", now);
    expect(fire?.toISOString()).toBe("2026-08-27T12:30:00.000Z");
  });

  it("walks back across a day boundary for a daily pattern", () => {
    const now = new Date("2026-08-27T01:15:00.000Z");
    const fire = lastScheduledFire("0 3 * * *", "UTC", now);
    expect(fire?.toISOString()).toBe("2026-08-26T03:00:00.000Z");
  });

  it("returns null for a pattern rarer than the widest lookback window", () => {
    // Fires once a year; the walk only looks back eight days.
    const now = new Date("2026-08-27T12:00:00.000Z");
    const fire = lastScheduledFire("0 0 1 1 *", "UTC", now);
    expect(fire).toBeNull();
  });
});

describe("assertValidJobs", () => {
  it("accepts distinct valid jobs", () => {
    expect(() => assertValidJobs([job(), job({ name: "other", cron: "*/5 * * * *" })])).not.toThrow();
  });

  it("rejects duplicate names", () => {
    expect(() => assertValidJobs([job(), job()])).toThrow(/duplicate job name/);
  });

  it("rejects empty names", () => {
    expect(() => assertValidJobs([job({ name: "  " })])).toThrow(/empty name/);
  });

  it("rejects an invalid cron pattern at boot instead of ticking oddly", () => {
    expect(() => assertValidJobs([job({ cron: "not a pattern" })])).toThrow();
  });
});
