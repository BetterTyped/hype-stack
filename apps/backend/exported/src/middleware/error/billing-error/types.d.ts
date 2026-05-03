import { ContentfulStatusCode } from "hono/utils/http-status";
import { ErrorDetails } from "../types";
export declare enum BillingErrorCode {
    LIMIT_EXCEEDED = "LIMIT_EXCEEDED",
    INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS",
    PLAN_NOT_FOUND = "PLAN_NOT_FOUND",
    SUBSCRIPTION_NOT_FOUND = "SUBSCRIPTION_NOT_FOUND"
}
export declare class BillingError extends Error {
    readonly code: BillingErrorCode;
    readonly statusCode: ContentfulStatusCode;
    readonly details: ErrorDetails;
    constructor({ code, message, statusCode, details }: {
        code: BillingErrorCode;
        message: string;
        statusCode?: ContentfulStatusCode;
        details?: ErrorDetails;
    });
}
//# sourceMappingURL=types.d.ts.map