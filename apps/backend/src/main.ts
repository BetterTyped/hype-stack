import { serve } from "@hono/node-server";
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-namespace */
import { Hono } from "hono";
import { cors } from "hono/cors";

import { Env, validateEnv } from "./config/env/env.config";
import { setupContext } from "./context";
import { BootState, BootStage, getBootState, setBootError } from "./libs/boot/boot-state";
import { logger } from "./libs/logger/logger";
import { ApplicationError, AuthorizationError, DatabaseError, ValidationError } from "./middleware/error";
import { AuthError } from "./middleware/error/auth-error/types";
import { errorMiddleware, onError } from "./middleware/error/error-middleware";
import { registerRoutes } from "./routes";
import { registerSockets } from "./sockets";
import { freePort } from "./utils/misc/free-port";
import { initWebSocket, serveWebsockets } from "./utils/misc/websocket";

let bootStage: BootStage = "env";

/**
 * Heavy initialization that can fail (env, DB, cache, storage, routes).
 * Kept separate so a failure here doesn't take the whole process down in dev -
 * the server stays up serving /health so the frontend can show a boot banner.
 */
const initialize = async (app: Hono, server: ReturnType<typeof serve>) => {
  /* -------------------------------------------------------------------------------------------------
   * Initialize
   * -----------------------------------------------------------------------------------------------*/
  bootStage = "env";
  validateEnv();
  logger.info(`FRONTEND_URL configured as: ${process.env.FRONTEND_URL}`);

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
  app.get("/ping/*", (c) => {
    return c.json<{ message: string; success: boolean }>({ message: "Pong", success: true });
  });
  registerSockets(app);
  registerRoutes(app);

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
};

const startServer = async () => {
  logger.info("Starting server");
  const app = new Hono();

  /* -------------------------------------------------------------------------------------------------
   * Boot diagnostics - registered first so /health responds even if init fails below
   * -----------------------------------------------------------------------------------------------*/
  app.use(
    cors({
      origin: [process.env.FRONTEND_URL ?? "*", process.env.ADMIN_URL ?? "*"],
      credentials: true,
    }),
  );
  app.get("/health", (c) => c.json<BootState>(getBootState()));

  /* -------------------------------------------------------------------------------------------------
   * Serve - start listening before heavy init so a broken boot is still observable
   * -----------------------------------------------------------------------------------------------*/
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await freePort(port);
  const server = serve(
    {
      fetch: app.fetch,
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
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  /* -------------------------------------------------------------------------------------------------
   * Initialize - on failure keep the server alive in dev to surface the reason, exit in prod
   * -----------------------------------------------------------------------------------------------*/
  await initialize(app, server).catch((error: unknown) => {
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
