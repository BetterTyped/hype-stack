import { getProcessRole, runsWorkers, servesApi } from "./process-role";

describe("process role", () => {
  const original = process.env.PROCESS_ROLE;

  afterEach(() => {
    if (original === undefined) delete process.env.PROCESS_ROLE;
    else process.env.PROCESS_ROLE = original;
  });

  it("defaults to running everything in one process", () => {
    delete process.env.PROCESS_ROLE;
    expect(getProcessRole()).toBe("all");
    expect(servesApi()).toBe(true);
    expect(runsWorkers()).toBe(true);
  });

  it("web serves the API and leaves background work to someone else", () => {
    process.env.PROCESS_ROLE = "web";
    expect(servesApi()).toBe(true);
    expect(runsWorkers()).toBe(false);
  });

  it("worker runs background work and serves no API", () => {
    process.env.PROCESS_ROLE = "worker";
    expect(servesApi()).toBe(false);
    expect(runsWorkers()).toBe(true);
  });

  it("fails loudly on a typo instead of silently running as something else", () => {
    Object.assign(process.env, { PROCESS_ROLE: "workers" });
    expect(() => getProcessRole()).toThrow(/PROCESS_ROLE must be one of/);
  });
});
