export type BootState = { status: "ok" } | { status: "error"; message: string; hint: string };

export type BootStage = "env" | "context" | "server";

/**
 * Predefined, safe-to-expose messages per boot failure reason.
 *
 * NEVER put raw error details here - the boot state is served to the frontend and
 * raw errors can leak secrets, connection strings, or internals. Keep it generic and
 * actionable; the real error is logged server-side.
 */
const BOOT_ERRORS: Record<BootStage, { message: string; hint: string }> = {
  env: {
    message: "Invalid backend environment configuration.",
    hint: "Some env variables are missing or misconfigured. Compare apps/backend/.env with .env.example.",
  },
  context: {
    message: "Backend services failed to initialize.",
    hint: "You may be missing or have misconfigured env variables (database, cache, storage, WorkOS).",
  },
  server: {
    message: "Backend server failed to start.",
    hint: "An unexpected error occurred during server initialization. Check the server logs for details.",
  },
};

let bootState: BootState = { status: "ok" };

export const getBootState = (): BootState => bootState;

/**
 * Records a boot failure using the safe, predefined message for the given reason.
 * The caller decides the reason based on which stage of boot failed.
 */
export const setBootError = (reason: BootStage) => {
  bootState = { status: "error", ...BOOT_ERRORS[reason] };
};
