import { SocketRouter } from "@backend/libs/websocket/socket-router";
import type { SocketRoutesToSdk, ServerEmitterMap } from "@backend/types/hono/hono-ws-converter";
import type { Hono } from "hono";
declare const sockets: SocketRouter<{
    listeners: {};
    emitters: {};
}, readonly []>;
declare const adminSockets: SocketRouter<{
    listeners: {};
    emitters: {};
}, readonly []>;
export declare const registerSockets: (app: Hono) => void;
export type WsSocketSdk = SocketRoutesToSdk<typeof sockets, any>;
export type WsEmitters = ServerEmitterMap<typeof sockets>;
export type WsAdminSocketSdk = SocketRoutesToSdk<typeof adminSockets, any>;
export type WsAdminEmitters = ServerEmitterMap<typeof adminSockets>;
export {};
//# sourceMappingURL=index.d.ts.map