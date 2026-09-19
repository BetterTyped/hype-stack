import type { AnyQueueDefinition } from "../libs/queue/queue";

/**
 * Registered task queues. Ships empty on purpose: feature packs append entries at install time
 * through the CLI's queues codemod, and app code can add its own the same way. Every entry gets
 * workers in this process; see the queue module for retries, transactional enqueue, and why
 * handlers must be safe to run twice.
 */
export const queues: AnyQueueDefinition[] = [];
