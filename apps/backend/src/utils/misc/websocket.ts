import { ApplicationError, ApplicationErrorCode } from "@backend/middleware/error";
import type { ServerType } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import type { Hono } from "hono";

type WebSocketHelpers = ReturnType<typeof createNodeWebSocket>;
type UpgradeWebSocket = WebSocketHelpers["upgradeWebSocket"];

let wsHelpers: WebSocketHelpers | null = null;

export const initWebSocket = (app: Hono) => {
  if (!wsHelpers) {
    wsHelpers = createNodeWebSocket({ app });
  }
  return wsHelpers;
};

export const getUpgradeWebSocket = (): UpgradeWebSocket => {
  return ((...args: Parameters<UpgradeWebSocket>) => {
    if (!wsHelpers) {
      throw new ApplicationError({
        code: ApplicationErrorCode.INTERNAL_SERVER_ERROR,
        message: "WebSocket helpers not initialized",
        statusCode: 500,
      });
    }
    return wsHelpers.upgradeWebSocket(...args);
  }) as UpgradeWebSocket;
};

export const serveWebsockets = (server: ServerType) => {
  if (!wsHelpers) {
    throw new ApplicationError({
      code: ApplicationErrorCode.INTERNAL_SERVER_ERROR,
      message: "WebSocket helpers not initialized",
      statusCode: 500,
    });
  }
  wsHelpers.injectWebSocket(server);
};
