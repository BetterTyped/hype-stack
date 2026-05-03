import { ContentfulStatusCode } from "hono/utils/http-status";
import { ErrorDetails } from "../types";
export declare enum ApplicationErrorCode {
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    NOT_FOUND = "NOT_FOUND",
    BAD_REQUEST = "BAD_REQUEST",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    FORBIDDEN = "FORBIDDEN",
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
    VALIDATION_ERROR = "VALIDATION_ERROR"
}
export declare class ApplicationError {
    readonly code: ApplicationErrorCode;
    readonly message: string;
    readonly statusCode: ContentfulStatusCode;
    readonly details: ErrorDetails;
    constructor({ code, message, statusCode, details }: {
        code: ApplicationErrorCode;
        message: string;
        statusCode: ContentfulStatusCode;
        details?: ErrorDetails;
    });
}
//# sourceMappingURL=types.d.ts.map