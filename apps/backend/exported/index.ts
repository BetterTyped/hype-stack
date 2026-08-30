/* -------------------------------------------------------------------------------------------------
 * Types exported to the frontend - DO NOT EXPORT VARIABLES, ONLY TYPES
 *
 * These re-export from ./src, the declaration files `pnpm generate` emits, never from ../src.
 * Client apps must stay on the generated types: importing backend source here would pull the
 * whole backend program into every consumer's typecheck.
 * -----------------------------------------------------------------------------------------------*/
export type { ApiRoutesSdk, ApiClient, ApiErrorTypes } from "./src/routes";
export type { WsSocketSdk, WsAdminSocketSdk } from "./src/sockets";
