import { ContentfulStatusCode } from "hono/utils/http-status";
import { $ZodIssue } from "zod/v4/core";
import { ErrorDetails } from "../types";
export declare enum ValidationErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR"
}
export declare class ValidationError {
    readonly code: ValidationErrorCode;
    readonly message: string;
    readonly statusCode: ContentfulStatusCode;
    readonly details?: ErrorDetails;
    readonly issues: $ZodIssue[];
    constructor({ issues, code, message, statusCode, details }: {
        issues: $ZodIssue[];
        code: ValidationErrorCode;
        message: string;
        statusCode: ContentfulStatusCode;
        details?: ErrorDetails;
    });
}
//# sourceMappingURL=types.d.ts.map