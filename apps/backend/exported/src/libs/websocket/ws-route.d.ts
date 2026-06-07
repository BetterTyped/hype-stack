import { type ConnectionManager } from "./connection-manager";
import type { WsAuthResult, WsHandlerEntry } from "./types";
export type WsAuthenticator = (headers: Headers) => Promise<WsAuthResult | null>;
export declare const createWsRoutes: (topicHandlers: Map<string, WsHandlerEntry>, authenticate: WsAuthenticator, manager?: ConnectionManager) => import("hono/hono-base").HonoBase<import("hono/types").BlankEnv, {
    "/": {
        $get: {
            output: {};
            outputFormat: "ws";
            status: import("hono/utils/http-status").StatusCode;
            input: {};
        };
    };
}, "/", "/">;
//# sourceMappingURL=ws-route.d.ts.map