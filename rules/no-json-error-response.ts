import { type AstNode, getNumericLiteralValue, getStaticPropertyName, isHonoJsonCall } from "./hono-json-utils.ts";

/**
 * Oxlint JS Plugin Rule: no-json-error-response
 *
 * PURPOSE:
 * Prevents returning error responses directly via Hono's c.json() with error status codes.
 * This ensures consistent error handling through the error middleware.
 *
 * WHY:
 * - Error responses should go through the centralized error middleware
 * - This keeps error handling consistent across the entire application
 * - Error types (ApplicationError, AuthError, ValidationError, etc.) provide
 *   structured error information and proper HTTP status codes automatically
 * - Throwing errors allows the middleware to log, format, and respond consistently
 *
 * BAD (will trigger error):
 *   return c.json({ error: "Not found" }, 404);
 *   return c.json({ message: "Server error" }, { status: 500 });
 *   return context.json({ error: err.message }, 400);
 *
 * GOOD:
 *   throw new ApplicationError("Not found", 404);
 *   throw new AuthError("Unauthorized");
 *   throw new ValidationError("Invalid input", errors);
 *
 * The error middleware will catch these and format the response appropriately.
 */

type RuleContext = {
  report(descriptor: { node: AstNode; messageId: "noJsonErrorResponse" }): void;
};

const ERROR_STATUS_MIN = 400;
const ERROR_STATUS_MAX_EXCLUSIVE = 600;

function isErrorStatus(status: number): boolean {
  return status >= ERROR_STATUS_MIN && status < ERROR_STATUS_MAX_EXCLUSIVE;
}

function getResponseInitStatus(node: AstNode | undefined): number | null {
  if (node?.type !== "ObjectExpression" || !Array.isArray(node.properties)) {
    return null;
  }

  // Supports Hono's `c.json(body, { status: 404 })` overload.
  for (const property of node.properties) {
    if (property.type !== "Property") {
      continue;
    }

    const propertyName = getStaticPropertyName(property.key);
    if (propertyName !== "status") {
      continue;
    }

    return getNumericLiteralValue(property.value as unknown as AstNode);
  }

  return null;
}

function getJsonStatus(node: AstNode): number | null {
  const statusArgument = node.arguments?.[1];

  // Supports both `c.json(body, 404)` and `c.json(body, { status: 404 })`.
  return getNumericLiteralValue(statusArgument) ?? getResponseInitStatus(statusArgument);
}

// eslint-disable-next-line import/no-default-export
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow Hono context json() calls with error status codes.",
      recommended: true,
    },
    messages: {
      noJsonErrorResponse:
        "Don't return error responses with c.json(). Throw an application error and let the error middleware handle it.",
    },
    schema: [],
  },
  create(context: RuleContext) {
    return {
      CallExpression(node: AstNode) {
        if (!isHonoJsonCall(node)) {
          return;
        }

        const status = getJsonStatus(node);

        if (status !== null && isErrorStatus(status)) {
          context.report({
            node,
            messageId: "noJsonErrorResponse",
          });
        }
      },
    };
  },
};
