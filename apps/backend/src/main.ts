import { serve } from "@hono/node-server";
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-namespace */
import { Hono } from "hono";
import { cors } from "hono/cors";

import { Env, validateEnv } from "./config/env/env.config";
import { setupContext } from "./context";
import { createAppSwapper, createBootApp } from "./libs/boot/boot-app";
import { BootState, BootStage, getBootState, setBootError } from "./libs/boot/boot-state";
import { logger } from "./libs/logger/logger";
import { ApplicationError, AuthorizationError, DatabaseError, ValidationError } from "./middleware/error";
import { AuthError } from "./middleware/error/auth-error/types";
import { errorMiddleware, onError } from "./middleware/error/error-middleware";
import { startScheduler, stopScheduler } from "./libs/scheduler/scheduler";
import { m } from "./paraglide/messages.js";
import { paraglideMiddleware } from "./paraglide/server.js";
import { jobs } from "./jobs";
import { registerRoutes } from "./routes";
import { registerSockets } from "./sockets";
import { freePort } from "./utils/misc/free-port";
import { initWebSocket, serveWebsockets } from "./utils/misc/websocket";

let bootStage: BootStage = "env";

/**
 * Heavy initialization that can fail (env, DB, cache, storage, routes).
 * Kept separate so a failure here doesn't take the whole process down in dev -
 * the boot app stays up serving /health so the frontend can show a boot banner.
 *
 * Builds and returns a complete app of its own instead of growing the app the
 * server already dispatches: Hono builds its route matcher on the first
 * dispatched request and refuses registrations after that, so a health probe
 * or an open tab hitting the server mid-boot would crash the process. The
 * caller swaps the returned app in atomically once everything here succeeded.
 */
const initialize = async (server: ReturnType<typeof serve>): Promise<Hono> => {
  /* -------------------------------------------------------------------------------------------------
   * Initialize
   * -----------------------------------------------------------------------------------------------*/
  bootStage = "env";
  validateEnv();
  logger.info(`FRONTEND_URL configured as: ${process.env.FRONTEND_URL}`);

  const app = new Hono();

  bootStage = "context";
  await setupContext(app);
  await initWebSocket(app);

  /* -------------------------------------------------------------------------------------------------
   * Global middlewares
   * -----------------------------------------------------------------------------------------------*/
  bootStage = "server";
  app.use(
    cors({
      origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
      credentials: true,
    }),
  );
  app.use(errorMiddleware);

  /* -------------------------------------------------------------------------------------------------
   * Registering
   * -----------------------------------------------------------------------------------------------*/
  // The boot app served /health until now; the initialized app takes it over.
  app.get("/health", (c) => c.json<BootState>(getBootState()));
  app.get("/ping/*", (c) => {
    return c.json<{ message: string; success: boolean }>({ message: m.pong(), success: true });
  });
  registerSockets(app);
  registerRoutes(app);

  // The scheduler needs the database (advisory locks, job_run bookkeeping), so it starts after
  // context setup; jobs are registered in src/jobs/index.ts.
  startScheduler(jobs);

  /* -------------------------------------------------------------------------------------------------
   * Handlers
   * -----------------------------------------------------------------------------------------------*/
  app.onError((err, c) => {
    logger.error(err);
    const error = onError(err);
    return c.json<ApplicationError | ValidationError | AuthError | AuthorizationError | DatabaseError>(
      error,
      error.statusCode,
    );
  });

  serveWebsockets(server);

  return app;
};

const startServer = async () => {
  logger.info("Starting server");

  /* -------------------------------------------------------------------------------------------------
   * Boot diagnostics - a minimal app serves /health (and 503s everything else)
   * until initialization finishes, so a broken boot is still observable
   * -----------------------------------------------------------------------------------------------*/
  const apps = createAppSwapper(createBootApp());

  /* -------------------------------------------------------------------------------------------------
   * Serve - start listening before heavy init; requests dispatch through the
   * swapper, so the boot app answers until the initialized app replaces it
   * -----------------------------------------------------------------------------------------------*/
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await freePort(port);
  const server = serve(
    {
      // The locale is resolved per request the same way the SSR server does it
      // (the locale cookie, then Accept-Language, then the base locale) and
      // kept in AsyncLocalStorage, so concurrent requests cannot read each
      // other's locale and every m.*() call in a handler picks it up.
      fetch: (request) => paraglideMiddleware(request, () => apps.fetch(request)),
      port,
    },
    (info) => {
      logger.info(`Server is running on http://localhost:${info.port}`);
    },
  );

  /* -------------------------------------------------------------------------------------------------
   * Graceful shutdown
   * -----------------------------------------------------------------------------------------------*/
  const shutdown = () => {
    logger.info("Shutting down server...");
    stopScheduler();
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  /* -------------------------------------------------------------------------------------------------
   * Initialize - on failure keep the server alive in dev to surface the reason, exit in prod
   * -----------------------------------------------------------------------------------------------*/
  await initialize(server)
    .then((app) => apps.set(app))
    .catch((error: unknown) => {
      setBootError(bootStage);
      logger.fatal({ err: error }, "Server failed to initialize");

      if (process.env.NODE_ENV !== "development") {
        process.exit(1);
      }
    });
};

process.on("uncaughtException", (error) => {
  logger.error({ err: error }, "Uncaught exception");
});
process.on("unhandledRejection", (error) => {
  logger.error({ err: error }, "Unhandled rejection");
});

startServer().catch((error: unknown) => {
  logger.fatal({ err: error }, "Failed to start server");
  process.exit(1);
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
