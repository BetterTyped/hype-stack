import { ContentfulStatusCode } from "hono/utils/http-status";
import { ErrorDetails } from "../types";
export declare enum DatabaseErrorCode {
    DATABASE_CONNECTION_ERROR = "DATABASE_CONNECTION_ERROR",
    DATABASE_QUERY_ERROR = "DATABASE_QUERY_ERROR",
    DATABASE_CONSTRAINT_ERROR = "DATABASE_CONSTRAINT_ERROR",
    DATABASE_TIMEOUT_ERROR = "DATABASE_TIMEOUT_ERROR",
    DATABASE_UNKNOWN_ERROR = "DATABASE_UNKNOWN_ERROR"
}
export declare class DatabaseError {
    readonly code: DatabaseErrorCode;
    readonly message: string;
    readonly statusCode: ContentfulStatusCode;
    readonly details: ErrorDetails;
    constructor({ code, message, statusCode, details }: {
        code: DatabaseErrorCode;
        message: string;
        statusCode: ContentfulStatusCode;
        details?: ErrorDetails;
    });
}
//# sourceMappingURL=types.d.ts.map