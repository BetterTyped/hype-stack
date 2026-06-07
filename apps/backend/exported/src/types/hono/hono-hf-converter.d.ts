import { ClientInstance, Request } from "@hyper-fetch/core";
import type { HonoBase } from "hono/hono-base";
type ExtractRouteTuple<T> = T extends readonly [infer Prefix extends string, infer Route] ? {
    prefix: Prefix;
    schema: Route extends HonoBase<any, infer S, any, any> ? S : {};
} : never;
type PrefixPaths<Schema extends Record<string, any>, Prefix extends string> = {
    [Path in keyof Schema as Path extends string ? `${Prefix}${Path}` : never]: Schema[Path];
};
type ProcessRouteTuple<T> = T extends {
    prefix: infer P extends string;
    schema: infer S extends Record<string, any>;
} ? PrefixPaths<S, P> : {};
type UnionSchemas<T> = T extends readonly unknown[] ? {
    [K in keyof T]: ProcessRouteTuple<ExtractRouteTuple<T[K]>>;
}[number] : {};
type ExtractInput<T> = "input" extends keyof T ? T["input"] : undefined;
type ExtractOutput<T> = "output" extends keyof T ? T["output"] : undefined;
type ExtractJson<T> = "json" extends keyof T ? T["json"] : undefined;
type ExtractQuery<T> = "query" extends keyof T ? T["query"] : undefined;
type ExtractFormError<T> = "formError" extends keyof T ? T["formError"] : undefined;
type MethodKey = `$${string}`;
type ExtractMethodKeys<T> = Extract<keyof T, MethodKey>;
type ConvertToRequest<Schema extends Record<string, any>, Client extends ClientInstance> = {
    [Path in keyof Schema]: {
        [K in ExtractMethodKeys<Schema[Path]> as K extends `$${infer M extends string}` ? `$${Lowercase<M>}` : never]: Request<ExtractOutput<Schema[Path][K]>, ExtractJson<ExtractInput<Schema[Path][K]>>, ExtractQuery<ExtractInput<Schema[Path][K]>>, ExtractFormError<Schema[Path][K]>, Path extends string ? Path : never, Client>;
    };
};
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type TrimStartSlash<S extends string> = S extends `/${infer R}` ? R : S;
type SplitPath<S extends string> = S extends "" ? [] : S extends `${infer Head}/${infer Tail}` ? [Head, ...SplitPath<Tail>] : [S];
type CamelCase<S extends string> = S extends `${infer H}-${infer T}` ? `${H}${Capitalize<CamelCase<T>>}` : S;
type NormalizeSegment<S extends string> = S extends `:${infer P}` ? `$${P}` : CamelCase<S>;
type BuildNestedObject<Segments extends readonly string[], Value> = Segments extends [
    infer Head extends string,
    ...infer Rest extends string[]
] ? {
    [K in NormalizeSegment<Head>]: BuildNestedObject<Rest, Value>;
} : Value;
type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;
type NestFlatRecord<R extends Record<string, any>> = Prettify<UnionToIntersection<{
    [P in keyof R & string]: BuildNestedObject<SplitPath<TrimStartSlash<P>>, R[P]>;
}[keyof R & string]>>;
type UnionKeys<U> = U extends any ? keyof U : never;
type MergeUnionToRecord<U> = {
    [K in UnionKeys<U> & string]: UnionToIntersection<U extends any ? (K extends keyof U ? U[K] : never) : never>;
};
export type HonoToHyperFetch<T, Client extends ClientInstance> = Prettify<NestFlatRecord<ConvertToRequest<MergeUnionToRecord<UnionSchemas<T>>, Client>>>;
export type HonoAppToHyperFetch<App, Client extends ClientInstance> = App extends HonoBase<any, infer S, any, any> ? Prettify<NestFlatRecord<ConvertToRequest<MergeUnionToRecord<S>, Client>>> : {};
export {};
//# sourceMappingURL=hono-hf-converter.d.ts.map