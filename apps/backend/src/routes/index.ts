import { ApplicationError, AuthError, DatabaseError, ValidationError } from "@backend/middleware/error";
import { HonoToHyperFetch } from "@backend/types/hono/hono-hf-converter";
import { Client, HttpAdapterType } from "@hyper-fetch/core";
import { Hono } from "hono";

export const registerRoutes = (app: Hono) => {
  return app;
};

/* -------------------------------------------------------------------------------------------------
 * Types exported to the frontend
 * -----------------------------------------------------------------------------------------------*/
export type ApiErrorTypes = ApplicationError | AuthError | ValidationError | DatabaseError;
export type ApiClient = Client<ApiErrorTypes, HttpAdapterType>;

type Routes = [
  // Add like:
  // ["/auth", typeof authRoutes],
];

export type ApiRoutesSdk = HonoToHyperFetch<Routes, ApiClient>;
