import { ApplicationError } from "./application-error/types";
export declare const onError: (error: Error) => ApplicationError | import(".").AuthError | import(".").AuthorizationError | import(".").DatabaseError | import(".").ValidationError;
/**
 * Global error middleware for Hono that handles all types of errors
 * with strongly typed responses
 */
export declare const errorMiddleware: import("hono").MiddlewareHandler<any, string, {}, Response & import("hono").TypedResponse<{
    message: string;
    statusCode: number;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">>;
//# sourceMappingURL=error-middleware.d.ts.map