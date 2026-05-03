import type { ServerType } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import type { Hono } from "hono";
type WebSocketHelpers = ReturnType<typeof createNodeWebSocket>;
type UpgradeWebSocket = WebSocketHelpers["upgradeWebSocket"];
export declare const initWebSocket: (app: Hono) => import("@hono/node-ws").NodeWebSocket;
export declare const getUpgradeWebSocket: () => UpgradeWebSocket;
export declare const serveWebsockets: (server: ServerType) => void;
export {};
//# sourceMappingURL=websocket.d.ts.map