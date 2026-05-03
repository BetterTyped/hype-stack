import type { S3Client } from "@aws-sdk/client-s3";
import { WorkOS } from "@workos-inc/node";
import type { Hono } from "hono";
import Valkey from "iovalkey";
import { initializePostgresDb } from "./db/postgres/initialize";
export type ContextVariables = {
    workos: WorkOS;
    postgres: Awaited<ReturnType<typeof initializePostgresDb>>;
    valkey: Valkey;
    storage: S3Client;
};
export declare let workos: WorkOS;
export declare let postgres: Awaited<ReturnType<typeof initializePostgresDb>>;
export declare let valkey: Valkey;
export declare let storage: S3Client;
export declare const STORAGE_BUCKETS: {
    readonly AVATARS: "avatars";
};
export declare const setupContext: (_app: Hono) => Promise<void>;
//# sourceMappingURL=context.d.ts.map