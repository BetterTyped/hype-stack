import type { JobDefinition } from "../libs/scheduler/scheduler";

/**
 * Registered background jobs. Ships empty on purpose: feature packs append entries at install
 * time through the CLI's jobs codemod, and app code can add its own the same way. Every entry
 * runs on the cron schedule it declares, exactly once across instances per fire; see the
 * scheduler module for the guarantees and for why business schedules belong in your tables, not
 * here.
 */
export const jobs: JobDefinition[] = [];
