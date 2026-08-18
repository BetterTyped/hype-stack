import { describe, expect, it } from "vitest";

import { m } from "@/paraglide/messages.js";

/**
 * A canary for the message catalog under Vitest.
 *
 * `src/paraglide` is compiled output, not source, so a test run has to compile
 * it the way a build or a dev server does. When it does not, every component
 * that reads a message fails to load with "Failed to resolve import
 * @/paraglide/messages.js" and the whole suite collects zero tests, which reads
 * like a config problem rather than a missing compiler. This fails first, and
 * for an obvious reason.
 *
 * Deliberately not pinned to a literal: `create` renames `app_title` to the
 * project's own name, and template overlays rebrand it again ("Vault", "Better
 * Studio"). The canary only cares that the catalog compiled and a message
 * resolves at all, so any non-empty value is a pass.
 */
describe("message catalog", () => {
  it("resolves a message in a test run", () => {
    expect(m.app_title().length).toBeGreaterThan(0);
  });
});
