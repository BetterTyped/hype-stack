import { ContentfulStatusCode } from "hono/utils/http-status";
import { ErrorDetails } from "../types";
export declare enum AuthorizationErrorCode {
    AUTHORIZATION_FORBIDDEN = "AUTHORIZATION_FORBIDDEN",
    AUTHORIZATION_MISSING_PERMISSION = "AUTHORIZATION_MISSING_PERMISSION"
}
export declare class AuthorizationError {
    readonly code: AuthorizationErrorCode;
    readonly message: string;
    readonly statusCode: ContentfulStatusCode;
    readonly details: ErrorDetails;
    constructor({ code, message, statusCode, details }: {
        code: AuthorizationErrorCode;
        message: string;
        statusCode?: ContentfulStatusCode;
        details?: AuthorizationError["details"];
    });
}
//# sourceMappingURL=types.d.ts.map