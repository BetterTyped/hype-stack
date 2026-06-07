import { appWsManager, adminWsManager } from "@backend/libs/websocket/connection-manager";
import { SocketRouter } from "@backend/libs/websocket/socket-router";
import type { SocketRoutesToSdk, ServerEmitterMap } from "@backend/types/hono/hono-ws-converter";
import type { Hono } from "hono";

/* -------------------------------------------------------------------------------------------------
 * Socket route definitions — mirrors routes/index.ts
 * -----------------------------------------------------------------------------------------------*/

const sockets = new SocketRouter({
  manager: appWsManager,
  authenticate: async (_headers) => {
    // TODO: Implement WebSocket authentication (e.g. validate session cookie via WorkOS)
    return null;
  },
});

const adminSockets = new SocketRouter({
  manager: adminWsManager,
  authenticate: async (_headers) => {
    // TODO: Implement WebSocket authentication (e.g. validate session cookie via WorkOS)
    return null;
  },
});

/* -------------------------------------------------------------------------------------------------
 * Registration
 * -----------------------------------------------------------------------------------------------*/

export const registerSockets = (app: Hono) => {
  app.route("/ws", sockets.routes());
  app.route("/ws/admin", adminSockets.routes());
};

/* -------------------------------------------------------------------------------------------------
 * Types exported to the frontend
 * -----------------------------------------------------------------------------------------------*/

// oxlint-disable-next-line typescript/no-explicit-any -- frontend provides the concrete SocketInstance at consumption site
export type WsSocketSdk = SocketRoutesToSdk<typeof sockets, any>;
export type WsEmitters = ServerEmitterMap<typeof sockets>;

// oxlint-disable-next-line typescript/no-explicit-any -- frontend provides the concrete SocketInstance at consumption site
export type WsAdminSocketSdk = SocketRoutesToSdk<typeof adminSockets, any>;
export type WsAdminEmitters = ServerEmitterMap<typeof adminSockets>;
