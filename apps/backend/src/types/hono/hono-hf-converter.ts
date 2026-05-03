/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientInstance, Request } from "@hyper-fetch/core";
import type { Hono } from "hono";
// import { BlankSchema } from "hono/types";

// Step 1: Extract route tuple [prefix, HonoRoute]
type ExtractRouteTuple<T> = T extends readonly [infer Prefix extends string, infer Route]
  ? { prefix: Prefix; schema: Route extends Hono<any, infer S, any> ? S : {} }
  : never;

// Step 2: Prefix all paths in a schema with the route prefix
type PrefixPaths<Schema extends Record<string, any>, Prefix extends string> = {
  [Path in keyof Schema as Path extends string ? `${Prefix}${Path}` : never]: Schema[Path];
};

// Step 3: Process each tuple and prefix its paths
type ProcessRouteTuple<T> = T extends { prefix: infer P extends string; schema: infer S extends Record<string, any> }
  ? PrefixPaths<S, P>
  : {};

// Step 4: Union all schemas together from array of route tuples
type UnionSchemas<T> = T extends readonly unknown[]
  ? {
      [K in keyof T]: ProcessRouteTuple<ExtractRouteTuple<T[K]>>;
    }[number]
  : {};

// Step 5: Extract schema field types for conversion
type ExtractInput<T> = "input" extends keyof T ? T["input"] : undefined;
type ExtractOutput<T> = "output" extends keyof T ? T["output"] : undefined;
type ExtractJson<T> = "json" extends keyof T ? T["json"] : undefined;
type ExtractQuery<T> = "query" extends keyof T ? T["query"] : undefined;
type ExtractFormError<T> = "formError" extends keyof T ? T["formError"] : undefined;
// Method extraction helpers: methods are encoded as $get, $post, ... on the schema leaf
type MethodKey = `$${string}`;
type ExtractMethodKeys<T> = Extract<keyof T, MethodKey>;

// Step 6: Convert schemas to flat path-to-request object
// Input: Array of route tuples [["/auth", typeof authRoutes], ["/files", typeof fileRoutes], ...]
// Output: {
//   "/auth/login": Request<{ user: any; organizationId: string }, { email: string; password: string }, void, void, "/auth/login", Client>;
//   "/auth/logout": Request<{ message: string }, void, void, void, "/auth/logout", Client>;
//   "/auth/google/login": Request<{ authUrl: string }, void, void, void, "/auth/google/login", Client>;
//   "/users/me": Request<{ user: any; organizationId: string }, void, void, void, "/users/me", Client>;
// }
type ConvertToRequest<Schema extends Record<string, any>, Client extends ClientInstance> = {
  [Path in keyof Schema]: {
    [K in ExtractMethodKeys<Schema[Path]> as K extends `$${infer M extends string}`
      ? `$${Lowercase<M>}`
      : never]: Request<
      ExtractOutput<Schema[Path][K]>,
      ExtractJson<ExtractInput<Schema[Path][K]>>,
      ExtractQuery<ExtractInput<Schema[Path][K]>>,
      ExtractFormError<Schema[Path][K]>,
      Path extends string ? Path : never,
      Client
    >;
  };
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/* -------------------------------------------------------------------------------------------------
 * Nesting utilities to convert flat path records into nested objects
 * -----------------------------------------------------------------------------------------------*/
type TrimStartSlash<S extends string> = S extends `/${infer R}` ? R : S;

type SplitPath<S extends string> = S extends ""
  ? []
  : S extends `${infer Head}/${infer Tail}`
    ? [Head, ...SplitPath<Tail>]
    : [S];

// Convert dynamic ":param" to "$param" to get nice property accessors on SDK (e.g., sdk.users.$userId)
type CamelCase<S extends string> = S extends `${infer H}-${infer T}` ? `${H}${Capitalize<CamelCase<T>>}` : S;

type NormalizeSegment<S extends string> = S extends `:${infer P}` ? `$${P}` : CamelCase<S>;

type BuildNestedObject<Segments extends readonly string[], Value> = Segments extends [
  infer Head extends string,
  ...infer Rest extends string[],
]
  ? { [K in NormalizeSegment<Head>]: BuildNestedObject<Rest, Value> }
  : Value;

type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;

type NestFlatRecord<R extends Record<string, any>> = Prettify<
  UnionToIntersection<
    {
      [P in keyof R & string]: BuildNestedObject<SplitPath<TrimStartSlash<P>>, R[P]>;
    }[keyof R & string]
  >
>;

/* -------------------------------------------------------------------------------------------------
 * Merge utilities for union of route schemas into a single record
 * -----------------------------------------------------------------------------------------------*/
type UnionKeys<U> = U extends any ? keyof U : never;

type MergeUnionToRecord<U> = {
  [K in UnionKeys<U> & string]: UnionToIntersection<U extends any ? (K extends keyof U ? U[K] : never) : never>;
};

// Step 7: Final conversion - nest flat paths into structured SDK
// Input: Array of route tuples [["/auth", authRoutes], ["/users", userRoutes], ...]
// Output: Nested SDK structure with full paths preserved
// {
//   auth: {
//     login: {
//       $post: Request<{ user: any; organizationId: string }, { email: string; password: string }, void, void, "/auth/login", Client>;
//     };
//     logout: {
//       $post: Request<{ message: string }, void, void, void, "/auth/logout", Client>;
//     };
//     google: {
//       login: {
//         $get: Request<{ authUrl: string }, void, void, void, "/auth/google/login", Client>;
//       };
//     };
//   };
//   users: {
//     me: {
//       $get: Request<{ user: any; organizationId: string }, void, void, void, "/users/me", Client>;
//     };
//   };
// }
export type HonoToHyperFetch<T, Client extends ClientInstance> = Prettify<
  NestFlatRecord<ConvertToRequest<MergeUnionToRecord<UnionSchemas<T>>, Client>>
>;

export type HonoAppToHyperFetch<App, Client extends ClientInstance> = App extends Hono<any, infer S, any>
  ? Prettify<NestFlatRecord<ConvertToRequest<S, Client>>>
  : {};
