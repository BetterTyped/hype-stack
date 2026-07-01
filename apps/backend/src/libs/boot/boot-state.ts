export type BootState = { status: "ok" } | { status: "error"; message: string; hint: string };

type BootErrorReason = "env" | "context";

/**
 * Predefined, safe-to-expose messages per boot failure reason.
 *
 * NEVER put raw error details here - the boot state is served to the frontend and
 * raw errors can leak secrets, connection strings, or internals. Keep it generic and
 * actionable; the real error is logged server-side.
 */
const BOOT_ERRORS: Record<BootErrorReason, { message: string; hint: string }> = {
  env: {
    message: "Invalid backend environment configuration.",
    hint: "Some env variables are missing or misconfigured. Compare apps/backend/.env with .env.example.",
  },
  context: {
    message: "Backend services failed to initialize.",
    hint: "You may be missing or have misconfigured env variables (database, cache, storage, WorkOS).",
  },
};

let bootState: BootState = { status: "ok" };

export const getBootState = (): BootState => bootState;

export const setBootError = (message: string, hint: string) => {
  bootState = { status: "error", message, hint };
};

/**
 * Classifies a boot failure into a predefined, safe message + hint.
 * Never returns the raw error - that is only logged server-side.
 */
export const describeBootError = (error: unknown): { message: string; hint: string } => {
  const raw = error instanceof Error ? error.message : String(error);

  // Env validation throws a "...environment variables..." message; everything else
  // (setupContext: db/cache/storage/WorkOS) is treated as a services/context failure.
  return raw.includes("environment variables") ? BOOT_ERRORS.env : BOOT_ERRORS.context;
};
