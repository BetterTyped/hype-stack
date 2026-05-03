import { ApplicationError, AuthError, DatabaseError, ValidationError } from "@backend/middleware/error";
import { HonoAppToHyperFetch } from "@backend/types/hono/hono-hf-converter";
import { Client, HttpAdapterType } from "@hyper-fetch/core";
import { Hono } from "hono";
export declare const registerRoutes: (app: Hono) => Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
export type ApiErrorTypes = ApplicationError | AuthError | ValidationError | DatabaseError;
export type ApiClient = Client<ApiErrorTypes, HttpAdapterType>;
export type ApiRoutesSdk = HonoAppToHyperFetch<ReturnType<typeof registerRoutes>, ApiClient>;
//# sourceMappingURL=index.d.ts.map