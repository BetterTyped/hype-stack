import { Hono } from "hono";
import { cors } from "hono/cors";

import { BootState, getBootState } from "./boot-state";

/**
 * The app that answers while the real one initializes, and that keeps
 * answering if initialization fails: boot diagnostics on /health, a 503 with
 * the same state everywhere else.
 *
 * Every route is registered before the server dispatches a single request,
 * and nothing is ever added afterwards. That ordering is load-bearing: Hono
 * builds its route matcher on the first dispatched request and refuses new
 * routes from then on ("Can not add a route since the matcher is already
 * built"). A health probe or an open browser tab hitting the server during
 * the listen-to-initialized window would otherwise crash the boot.
 */
export const createBootApp = (): Hono => {
  const app = new Hono();

  app.use(
    cors({
      origin: [process.env.FRONTEND_URL ?? "*", process.env.ADMIN_URL ?? "*"],
      credentials: true,
    }),
  );
  app.get("/health", (c) => c.json<BootState>(getBootState()));
  // oxlint-disable-next-line rules/no-json-error-response -- the error middleware does not exist yet at boot; this 503 IS the boot diagnostic.
  app.all("*", (c) => c.json<BootState>(getBootState(), 503));

  return app;
};

/**
 * A stable dispatch target whose app can be replaced atomically. serve()
 * captures `fetch` once; initialization builds the complete app on the side
 * and swaps it in with `set`. No app is ever mutated after it may have
 * dispatched a request, which is the invariant the matcher demands.
 */
export const createAppSwapper = (initial: Hono) => {
  let current = initial;

  return {
    fetch: (request: Request): Response | Promise<Response> => current.fetch(request),
    set: (next: Hono): void => {
      current = next;
    },
  };
};
