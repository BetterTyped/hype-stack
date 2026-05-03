import { logger } from "@backend/libs/logger/logger";

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
import { initializeValkeyClient } from "./initialize-valkey";

type Serializable = unknown;

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

let sharedClientPromise: Promise<ValkeyClient> | null = null;

async function getValkeyClient(options?: ValkeyCacheOptions): Promise<ValkeyClient> {
  try {
    if (options?.client) return options.client;
    if (options?.clientProvider) return await options.clientProvider();
    if (!sharedClientPromise) {
      sharedClientPromise = initializeValkeyClient();
    }
    return await sharedClientPromise;
  } catch (error) {
    logger.error({ message: "Failed to acquire Valkey client", error });
    throw error;
  }
}

function stableStringify(value: Serializable): string {
  const seen = new WeakSet();
  const replacer = (_key: string, val: unknown): unknown => {
    if (typeof val === "object" && val !== null) {
      if (seen.has(val as object)) return "[Circular]";
      seen.add(val as object);
      if (Array.isArray(val)) return val.map((v) => replacer("", v));
      const sorted: Record<string, unknown> = {};
      // eslint-disable-next-line unicorn/no-array-sort -- Project TS lib does not include Array#toSorted.
      for (const key of Object.keys(val as Record<string, unknown>).sort()) {
        sorted[key] = replacer(key, (val as Record<string, unknown>)[key]);
      }
      return sorted;
    }
    if (typeof val === "function") return `[Function]`;
    if (typeof val === "undefined") return "[Undefined]";
    return val as unknown as Serializable;
  };
  try {
    return JSON.stringify(value, replacer);
  } catch {
    return String(value);
  }
}

export const buildDefaultCacheKey: ValkeyCacheKeyBuilder = ({ prefix, className, methodName, functionName, args }) => {
  const name = [className, methodName || functionName].filter(Boolean).join(":");
  const argsKey = stableStringify(args);
  return `${prefix}:${name}:${argsKey}`;
};

function normalizeOptions(ttlOrOptions: number | ValkeyCacheOptions): Required<
  Omit<ValkeyCacheOptions, "client" | "clientProvider">
> & {
  client?: ValkeyClient;
  clientProvider?: ValkeyClientProvider;
} {
  if (typeof ttlOrOptions === "number") {
    return {
      ttlSeconds: ttlOrOptions,
      prefix: "cache",
      keyBuilder: buildDefaultCacheKey,
      cacheUndefined: false,
      client: undefined,
      clientProvider: undefined,
    };
  }
  const {
    ttlSeconds,
    prefix = "cache",
    keyBuilder = buildDefaultCacheKey,
    cacheUndefined = false,
    client,
    clientProvider,
  } = ttlOrOptions;
  return { ttlSeconds, prefix, keyBuilder, cacheUndefined, client, clientProvider };
}

export function ValkeyCache(ttlOrOptions: number | ValkeyCacheOptions): MethodDecorator {
  const options = normalizeOptions(ttlOrOptions);
  return function (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
    const original = descriptor.value as (this: unknown, ...args: unknown[]) => unknown;
    if (typeof original !== "function") return descriptor;

    const newDescriptor: PropertyDescriptor = {
      ...descriptor,
      value: async function (this: unknown, ...args: unknown[]) {
        const className = (this as { constructor?: { name?: string } })?.constructor?.name;
        const methodName = String(propertyKey);
        const key = options.keyBuilder({
          prefix: options.prefix,
          className,
          methodName,
          args,
        });

        let client: ValkeyClient | null = null;
        try {
          client = await getValkeyClient(options);
          const cached = await client.get(key);
          if (cached !== null) {
            try {
              return JSON.parse(cached);
            } catch {
              return cached;
            }
          }
        } catch (error) {
          logger.error({ message: "Valkey read failed in ValkeyCache decorator", error });
        }

        const result = await Promise.resolve(original.apply(this, args));

        if (result === undefined && !options.cacheUndefined) {
          return result;
        }

        try {
          if (!client) client = await getValkeyClient(options);
          await client.set(key, JSON.stringify(result), "EX", options.ttlSeconds);
        } catch (error) {
          logger.error({ message: "Valkey write failed in ValkeyCache decorator", error });
        }

        return result;
      } as unknown as typeof original,
    };

    return newDescriptor;
  };
}

export function withValkeyCache<Args extends unknown[], Return>(
  ttlOrOptions: number | ValkeyCacheOptions,
  fn: (...args: Args) => Promise<Return> | Return,
): (...args: Args) => Promise<Return> {
  const options = normalizeOptions(ttlOrOptions);
  const functionName = fn.name || "anonymous";
  return async (...args: Args): Promise<Return> => {
    const key = options.keyBuilder({
      prefix: options.prefix,
      functionName,
      args,
    });

    let client: ValkeyClient | null = null;
    try {
      client = await getValkeyClient(options);
      const cached = await client.get(key);
      if (cached !== null) {
        try {
          return JSON.parse(cached) as Return;
        } catch {
          return cached as unknown as Return;
        }
      }
    } catch (error) {
      logger.error({ message: "Valkey read failed in withValkeyCache", error });
    }

    const result = await Promise.resolve(fn(...args));

    if (result === undefined && !options.cacheUndefined) {
      return result as Return;
    }

    try {
      if (!client) client = await getValkeyClient(options);
      await client.set(key, JSON.stringify(result), "EX", options.ttlSeconds);
    } catch (error) {
      logger.error({ message: "Valkey write failed in withValkeyCache", error });
    }

    return result as Return;
  };
}
