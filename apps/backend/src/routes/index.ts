import { Client, HttpAdapterType } from "@hyper-fetch/core";
import { Hono } from "hono";

import { ApplicationError, AuthError, DatabaseError, ValidationError } from "@backend/middleware/error";
import { HonoAppToHyperFetch } from "@backend/types/hono/hono-hf-converter";

export const registerRoutes = (app: Hono) => {
  return app;
};

/* -------------------------------------------------------------------------------------------------
 * Types exported to the frontend
 * -----------------------------------------------------------------------------------------------*/
export type ApiErrorTypes = ApplicationError | AuthError | ValidationError | DatabaseError;
export type ApiClient = Client<ApiErrorTypes, HttpAdapterType>;

export type ApiRoutesSdk = HonoAppToHyperFetch<ReturnType<typeof registerRoutes>, ApiClient>;
