import type { SocketRoutesToSdk, ServerEmitterMap } from "@backend/types/hono/hono-ws-converter";
import { SocketRouter } from "@backend/libs/websocket/socket-router";
import type { Hono } from "hono";

/* -------------------------------------------------------------------------------------------------
 * Socket route definitions — mirrors routes/index.ts
 * -----------------------------------------------------------------------------------------------*/

const sockets = new SocketRouter({
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
};

/* -------------------------------------------------------------------------------------------------
 * Types exported to the frontend
 * -----------------------------------------------------------------------------------------------*/

// oxlint-disable-next-line typescript/no-explicit-any -- frontend provides the concrete SocketInstance at consumption site
export type WsSocketSdk = SocketRoutesToSdk<typeof sockets, any>;
export type WsEmitters = ServerEmitterMap<typeof sockets>;
