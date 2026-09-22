import { z } from "zod";

import { assertValidQueues, defineQueue } from "./queue";

const payload = z.object({ value: z.string() });

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
