import { m } from "./paraglide/messages.js";

/**
 * A canary for the message catalog under Vitest.
 *
 * `src/paraglide` is compiled output, not source, so a test run has to compile
 * it the way a build or a dev server does. When it does not, everything that
 * reads a message fails to load with "Failed to resolve import
 * ./paraglide/messages.js", which reads like a config problem rather than a
 * missing compiler. This fails first, and for an obvious reason.
 */
describe("message catalog", () => {
  it("resolves a message in a test run", () => {
    expect(m.pong()).toBe("Pong");
  });
});
