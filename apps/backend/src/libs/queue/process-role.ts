/**
 * What this process does, picked with PROCESS_ROLE. One image, one entrypoint:
 *
 * - `all` (default): API, scheduler, and task workers in one process. Right until background work
 *   starts competing with requests.
 * - `web`: API only. Still enqueues tasks, never runs them, never ticks cron.
 * - `worker`: scheduler and task workers. Serves /health and nothing else, so platform health
 *   checks keep passing without a second Dockerfile or start command.
 *
 * To scale out, run the same image twice: PROCESS_ROLE=web on the public service,
 * PROCESS_ROLE=worker on a copy with the same database, bucket, and provider keys, no public
 * domain, and no migration command. The two never talk to each other; Postgres is the hand-off.
 */
export const PROCESS_ROLES = ["all", "web", "worker"] as const;

export type ProcessRole = (typeof PROCESS_ROLES)[number];

export const getProcessRole = (): ProcessRole => {
  const role = process.env.PROCESS_ROLE ?? "all";
  if (!PROCESS_ROLES.includes(role as ProcessRole)) {
    throw new Error(`PROCESS_ROLE must be one of ${PROCESS_ROLES.join(", ")}, got "${role}"`);
  }
  return role as ProcessRole;
};

/** True when this process serves the API routes and sockets. */
export const servesApi = (): boolean => getProcessRole() !== "worker";

/** True when this process runs cron jobs and queued tasks. */
export const runsWorkers = (): boolean => getProcessRole() !== "web";
