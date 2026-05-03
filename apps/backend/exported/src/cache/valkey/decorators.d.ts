/**
 * Valkey caching utilities: a method decorator and a standalone function wrapper.
 *
 * Usage (method):
 * ```ts
 * class Service {
 *   @ValkeyCache(60)
 *   async getUser(id: string) { // ... }
 * }
 * ```
 *
 * Usage (function via helper):
 * ```ts
 * async function fetchData(id: string) { // ... }
 * export const fetchDataCached = withValkeyCache(60, fetchData);
 * ```
 *
 * Options example:
 * ```ts
 * @ValkeyCache({ ttlSeconds: 120, prefix: "users", cacheUndefined: false })
 * async getUser(id: string) { // ... }
 * ```
 */
import type { ValkeyClient } from "./initialize-valkey";
export type ValkeyCacheKeyBuilder = (params: {
    prefix: string;
    className?: string;
    methodName?: string;
    functionName?: string;
    args: unknown[];
}) => string;
export type ValkeyClientProvider = () => Promise<ValkeyClient> | ValkeyClient;
export type ValkeyCacheOptions = {
    ttlSeconds: number;
    prefix?: string;
    keyBuilder?: ValkeyCacheKeyBuilder;
    cacheUndefined?: boolean;
    client?: ValkeyClient;
    clientProvider?: ValkeyClientProvider;
};
export declare const buildDefaultCacheKey: ValkeyCacheKeyBuilder;
export declare function ValkeyCache(ttlOrOptions: number | ValkeyCacheOptions): MethodDecorator;
export declare function withValkeyCache<Args extends unknown[], Return>(ttlOrOptions: number | ValkeyCacheOptions, fn: (...args: Args) => Promise<Return> | Return): (...args: Args) => Promise<Return>;
//# sourceMappingURL=decorators.d.ts.map