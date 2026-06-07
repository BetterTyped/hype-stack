import type { ConnectionManager } from "./connection-manager";
import type { WsHandler, WsHandlerEntry, WsMiddleware } from "./types";
import { type WsAuthenticator } from "./ws-route";
export type SocketRouterOptions = {
    authenticate: WsAuthenticator;
    /**
     * Connection registry connections are registered into. Defaults to the shared
     * `appWsManager`. Pass a dedicated instance to isolate a namespace (e.g.
     * admin), so broadcasts over that manager never reach other routers.
     */
    manager: ConnectionManager;
};
export declare class SocketRouter<Schema extends {
    listeners: Record<string, any>;
    emitters: Record<string, any>;
} = {
    listeners: {};
    emitters: {};
}, Routes extends readonly (readonly [string, SocketRouter<any>])[] = readonly []> {
    private _handlers;
    private _childRoutes;
    private _options?;
    constructor(options?: SocketRouterOptions);
    /**
     * Declare a server-to-client event (backend emits, frontend listens).
     * Type-only - no handler needed. The actual push happens via `wsEmit.toUser()`.
     *
     * Uses curried generics so `Topic` is inferred as a literal from the argument
     * and `Payload` is specified explicitly in the second call:
     * ```ts
     * .emitter("new")<WsNotificationPayload>()
     * ```
     */
    emitter<Topic extends string>(_topic: Topic): <Payload>() => SocketRouter<{
        listeners: Schema["listeners"];
        emitters: Schema["emitters"] & Record<Topic, Payload>;
    }, Routes>;
    /**
     * Register a client-to-server handler (backend listens, frontend emits).
     * Supports an optional validation middleware that narrows the data type.
     */
    listener<Topic extends string, Output>(topic: Topic, middleware: WsMiddleware<Output>, handler: WsHandler<Output>): SocketRouter<{
        listeners: Schema["listeners"] & Record<Topic, Output>;
        emitters: Schema["emitters"];
    }, Routes>;
    listener<Payload, Topic extends string>(topic: Topic, handler: WsHandler<Payload>): SocketRouter<{
        listeners: Schema["listeners"] & Record<Topic, Payload>;
        emitters: Schema["emitters"];
    }, Routes>;
    /**
     * Mount a child SocketRouter under a prefix - mirrors Hono's `app.route(prefix, routes)`.
     *
     * ```ts
     * new SocketRouter()
     *   .socket("/notification", notificationSockets)
     *   .socket("/invitation", invitationSockets)
     * ```
     */
    socket<Prefix extends string, R extends SocketRouter<any>>(prefix: Prefix, router: R): SocketRouter<Schema, readonly [...Routes, readonly [StripLeadingSlash<Prefix>, R]]>;
    /**
     * Build the Hono app with the merged WebSocket handlers from all child routers.
     * Pass the result to `app.route("/ws", sockets.routes())`.
     */
    routes(): import("hono/hono-base").HonoBase<import("hono/types").BlankEnv, {
        "/": {
            $get: {
                output: {};
                outputFormat: "ws";
                status: import("hono/utils/http-status").StatusCode;
                input: {};
            };
        };
    }, "/", "/">;
    /** @hype-stack - used by parent routers to collect handlers */
    _getHandlers(): ReadonlyMap<string, WsHandlerEntry>;
}
type StripLeadingSlash<S extends string> = S extends `/${infer Rest}` ? Rest : S;
export declare const createSocketRouter: (options?: SocketRouterOptions) => SocketRouter<{
    listeners: {};
    emitters: {};
}, readonly []>;
export {};
//# sourceMappingURL=socket-router.d.ts.map