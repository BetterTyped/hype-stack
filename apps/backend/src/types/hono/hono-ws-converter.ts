import type { SocketRouter } from "@backend/libs/websocket/socket-router";
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Listener, Emitter, SocketInstance } from "@hyper-fetch/sockets";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type SplitPath<S extends string> = S extends ""
  ? []
  : S extends `${infer Head}/${infer Tail}`
    ? [Head, ...SplitPath<Tail>]
    : [S];

type CamelCase<S extends string> = S extends `${infer H}-${infer T}` ? `${H}${Capitalize<CamelCase<T>>}` : S;

type NormalizeSegment<S extends string> = S extends `:${infer P}` ? `$${P}` : CamelCase<S>;

type BuildNestedObject<Segments extends readonly string[], Value> = Segments extends [
  infer Head extends string,
  ...infer Rest extends string[],
]
  ? { [K in NormalizeSegment<Head>]: BuildNestedObject<Rest, Value> }
  : Value;

type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;

type NestListeners<Listeners extends Record<string, any>, S extends SocketInstance> = Prettify<
  UnionToIntersection<
    {
      [Topic in keyof Listeners & string]: BuildNestedObject<
        SplitPath<Topic>,
        { $listener: Listener<Listeners[Topic], Topic, S> }
      >;
    }[keyof Listeners & string]
  >
>;

type NestEmitters<Emitters extends Record<string, any>, S extends SocketInstance> = Prettify<
  UnionToIntersection<
    {
      [Topic in keyof Emitters & string]: BuildNestedObject<
        SplitPath<Topic>,
        { $emitter: Emitter<Emitters[Topic], Topic, S> }
      >;
    }[keyof Emitters & string]
  >
>;

type DeepMerge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof A & keyof B
    ? A[K] extends Record<string, any>
      ? B[K] extends Record<string, any>
        ? DeepMerge<A[K], B[K]>
        : A[K]
      : A[K]
    : K extends keyof A
      ? A[K]
      : K extends keyof B
        ? B[K]
        : never;
};

type EventsToSocketSdk<Events, S extends SocketInstance> =
  Events extends { listeners: infer L extends Record<string, any>; emitters: infer E extends Record<string, any> }
    ? Prettify<DeepMerge<NestListeners<L, S>, NestEmitters<E, S>>>
    : never;

/* -------------------------------------------------------------------------------------------------
 * SocketRouter type extraction
 * -----------------------------------------------------------------------------------------------*/

type ExtractSocketSchema<R> = R extends SocketRouter<infer S> ? S : never;
type ExtractBackendListeners<R> = ExtractSocketSchema<R>["listeners"];
type ExtractBackendEmitters<R> = ExtractSocketSchema<R>["emitters"];
type ExtractRoutes<R> = R extends SocketRouter<any, infer Routes> ? Routes : never;

type PrefixKeys<R extends Record<string, any>, P extends string> = {
  [K in keyof R as K extends string ? `${P}/${K}` : never]: R[K];
};

/**
 * Direction flip: backend semantics → frontend SDK semantics.
 *
 * - Backend `.emitter<Payload>(topic)` = server pushes to client → frontend `$listener`
 * - Backend `.listener(topic, handler)` = server handles client messages → frontend `$emitter`
 */
type SocketRoutesToEvents<T extends readonly (readonly [string, SocketRouter<any>])[]> = {
  listeners: UnionToIntersection<
    {
      [I in keyof T]: T[I] extends readonly [infer P extends string, infer R]
        ? PrefixKeys<ExtractBackendEmitters<R>, P>
        : never;
    }[number]
  >;
  emitters: UnionToIntersection<
    {
      [I in keyof T]: T[I] extends readonly [infer P extends string, infer R]
        ? PrefixKeys<ExtractBackendListeners<R>, P>
        : never;
    }[number]
  >;
};

/**
 * Converts a SocketRouter (with `.socket()` children) or an array of socket route tuples
 * into a HyperFetch Socket SDK schema.
 *
 * @example
 * ```ts
 * const sockets = new SocketRouter()
 *   .socket("/notification", notificationSockets)
 *   .socket("/invitation", invitationSockets);
 *
 * type Schema = SocketRoutesToSdk<typeof sockets, typeof socket>;
 * // {
 * //   notification: {
 * //     new: { $listener: Listener<WsNotificationPayload, "notification/new", Socket> };
 * //     count: { $listener: Listener<WsUnreadCountPayload, "notification/count", Socket> };
 * //     markRead: { $emitter: Emitter<WsMarkReadPayload, "notification/mark-read", Socket> };
 * //   };
 * //   invitation: {
 * //     new: { $listener: Listener<WsInvitationPayload, "invitation/new", Socket> };
 * //   };
 * // }
 * ```
 */
export type SocketRoutesToSdk<
  T extends SocketRouter<any, any> | readonly (readonly [string, SocketRouter<any>])[],
  S extends SocketInstance,
> = T extends SocketRouter<any, any>
  ? EventsToSocketSdk<SocketRoutesToEvents<ExtractRoutes<T>>, S>
  : T extends readonly (readonly [string, SocketRouter<any>])[]
    ? EventsToSocketSdk<SocketRoutesToEvents<T>, S>
    : never;

/* -------------------------------------------------------------------------------------------------
 * Server-side emitter map — used by TypedEmitter for type-safe pushes
 * -----------------------------------------------------------------------------------------------*/

type CollectEmitters<T extends readonly (readonly [string, SocketRouter<any>])[]> = UnionToIntersection<
  {
    [I in keyof T]: T[I] extends readonly [infer P extends string, infer R]
      ? PrefixKeys<ExtractBackendEmitters<R>, P>
      : never;
  }[number]
>;

/**
 * Extracts a flat `Record<"prefix/topic", Payload>` of all server-to-client emitter events
 * from a top-level `SocketRouter` with `.socket()` children.
 *
 * Used to parameterize `TypedEmitter` for compile-time topic + payload enforcement.
 */
export type ServerEmitterMap<R extends SocketRouter<any, any>> =
  ExtractRoutes<R> extends readonly [] ? Record<string, never> : CollectEmitters<ExtractRoutes<R>>;
