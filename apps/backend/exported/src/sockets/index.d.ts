import type { SocketRoutesToSdk, ServerEmitterMap } from "@backend/types/hono/hono-ws-converter";
import { SocketRouter } from "@backend/libs/websocket/socket-router";
import type { Hono } from "hono";
declare const sockets: SocketRouter<{
    listeners: {};
    emitters: {};
}, readonly []>;
export declare const registerSockets: (app: Hono) => void;
export type WsSocketSdk = SocketRoutesToSdk<typeof sockets, any>;
export type WsEmitters = ServerEmitterMap<typeof sockets>;
export {};
//# sourceMappingURL=index.d.ts.map