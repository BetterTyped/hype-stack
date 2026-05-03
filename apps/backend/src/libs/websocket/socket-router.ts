/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WsHandler, WsHandlerEntry, WsMiddleware } from "./types";
import { createWsRoutes, type WsAuthenticator } from "./ws-route";

export type SocketRouterOptions = {
  authenticate: WsAuthenticator;
};

export class SocketRouter<
  Schema extends {
    listeners: Record<string, any>;
    emitters: Record<string, any>;
  } = { listeners: {}; emitters: {} },
  Routes extends readonly (readonly [string, SocketRouter<any>])[] = readonly [],
> {
  private _handlers = new Map<string, WsHandlerEntry>();
  private _childRoutes: [string, SocketRouter<any>][] = [];
  private _options: SocketRouterOptions;

  constructor(options: SocketRouterOptions) {
    this._options = options;
  }

  /**
   * Declare a server-to-client event (backend emits, frontend listens).
   * Type-only — no handler needed. The actual push happens via `wsManager.pushToUser()`.
   *
   * Uses curried generics so `Topic` is inferred as a literal from the argument
   * and `Payload` is specified explicitly in the second call:
   * ```ts
   * .emitter("new")<WsNotificationPayload>()
   * ```
   */
  emitter<Topic extends string>(
    _topic: Topic,
  ): <Payload>() => SocketRouter<
    {
      listeners: Schema["listeners"];
      emitters: Schema["emitters"] & Record<Topic, Payload>;
    },
    Routes
  > {
    return () => this as any;
  }

  /**
   * Register a client-to-server handler (backend listens, frontend emits).
   * Supports an optional validation middleware that narrows the data type.
   */
  listener<Topic extends string, Output>(
    topic: Topic,
    middleware: WsMiddleware<Output>,
    handler: WsHandler<Output>,
  ): SocketRouter<
    {
      listeners: Schema["listeners"] & Record<Topic, Output>;
      emitters: Schema["emitters"];
    },
    Routes
  >;
  listener<Payload, Topic extends string>(
    topic: Topic,
    handler: WsHandler<Payload>,
  ): SocketRouter<
    {
      listeners: Schema["listeners"] & Record<Topic, Payload>;
      emitters: Schema["emitters"];
    },
    Routes
  >;
  listener(topic: string, middlewareOrHandler: WsMiddleware<any> | WsHandler<any>, maybeHandler?: WsHandler<any>): any {
    if (maybeHandler) {
      this._handlers.set(topic, {
        handler: maybeHandler as WsHandler<unknown>,
        middleware: middlewareOrHandler as WsMiddleware<unknown>,
      });
    } else {
      this._handlers.set(topic, {
        handler: middlewareOrHandler as WsHandler<unknown>,
      });
    }
    return this;
  }

  /**
   * Mount a child SocketRouter under a prefix — mirrors Hono's `app.route(prefix, routes)`.
   *
   * ```ts
   * new SocketRouter()
   *   .socket("/notification", notificationSockets)
   *   .socket("/invitation", invitationSockets)
   * ```
   */
  socket<Prefix extends string, R extends SocketRouter<any>>(
    prefix: Prefix,
    router: R,
  ): SocketRouter<Schema, readonly [...Routes, readonly [StripLeadingSlash<Prefix>, R]]> {
    const stripped = (prefix.startsWith("/") ? prefix.slice(1) : prefix) as StripLeadingSlash<Prefix>;
    this._childRoutes.push([stripped, router]);
    return this as any;
  }

  /**
   * Build the Hono app with the merged WebSocket handlers from all child routers.
   * Pass the result to `app.route("/ws", sockets.routes())`.
   */
  routes() {
    const merged = new Map<string, WsHandlerEntry>();

    for (const [prefix, router] of this._childRoutes) {
      for (const [topic, entry] of router._getHandlers()) {
        merged.set(`${prefix}/${topic}`, entry);
      }
    }

    return createWsRoutes(merged, this._options.authenticate);
  }

  /** @hype-stack — used by parent routers to collect handlers */
  _getHandlers(): ReadonlyMap<string, WsHandlerEntry> {
    return this._handlers;
  }
}

type StripLeadingSlash<S extends string> = S extends `/${infer Rest}` ? Rest : S;

export const createSocketRouter = (options: SocketRouterOptions) => new SocketRouter(options);
