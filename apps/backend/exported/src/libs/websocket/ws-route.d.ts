import type { WsHandlerEntry } from "./types";
export declare const createWsRoutes: (topicHandlers: Map<string, WsHandlerEntry>) => import("hono/hono-base").HonoBase<import("hono/types").BlankEnv, {
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