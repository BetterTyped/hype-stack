import type { S3Client } from "@aws-sdk/client-s3";
import { WorkOS } from "@workos-inc/node";
import type { Hono } from "hono";
import Valkey from "iovalkey";

import { initializeValkeyClient } from "./cache/valkey/initialize-valkey";
import { initializePostgresDb } from "./db/postgres/initialize";
import { initializeStorage } from "./libs/storage/storage";

export type ContextVariables = {
  workos: WorkOS;
  postgres: Awaited<ReturnType<typeof initializePostgresDb>>;
  valkey: Valkey;
  storage: S3Client;
};

export let workos: WorkOS;
export let postgres: Awaited<ReturnType<typeof initializePostgresDb>>;
export let valkey: Valkey;
export let storage: S3Client;

export const STORAGE_BUCKETS = {
  AVATARS: "avatars",
} as const;

export const setupContext = async (_app: Hono) => {
  workos = new WorkOS(process.env.WORKOS_API_KEY, { clientId: process.env.WORKOS_CLIENT_ID });
  postgres = await initializePostgresDb();
  valkey = await initializeValkeyClient();
  storage = initializeStorage();
};
