export class ContextError extends Error {
  public extra?: Record<string, unknown> | undefined;
  constructor(
    message: string,
    extra?: {
      error?: Error;
      [x: string]: unknown;
    },
  ) {
    super(message);
    this.extra = extra;
    this.name = this.constructor.name;
    if (extra && extra.error && extra.error.stack) {
      this.stack = extra.error.stack;
    } else {
      if (typeof message === "string" && typeof Error.captureStackTrace === "function") {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = new Error().stack;
      }
    }
  }
}
