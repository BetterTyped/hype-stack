import { type AstNode, getCallTypeArguments, isHonoJsonCall } from "./hono-json-utils.ts";

/**
 * Oxlint JS Plugin Rule: require-json-generic-type
 *
 * PURPOSE:
 * Enforces that all c.json() calls have an explicit generic type parameter.
 * This ensures proper type inference for API responses across the monorepo.
 *
 * WHY:
 * - Without explicit types, Hono infers response types from the data passed
 * - This inference can break when consumed by other packages (frontend, other backends)
 * - Explicit types create a clear contract for what the endpoint returns
 * - Types flow through HonoToHyperFetch converter to provide type-safe SDK
 * - Prevents accidental type widening or loss of type information
 *
 * WHY NO typeof:
 * - typeof extracts the type from a runtime value, which may include implementation details
 * - typeof types can change unexpectedly when the source variable changes
 * - Explicit types serve as documentation and contract for the API
 * - typeof can capture unwanted properties or internal types
 *
 * INLINE TYPES:
 * - Simple responses (≤3 properties) can use inline types: c.json<{ message: string }>(...)
 * - Complex responses (>3 properties) must use a named type/interface
 *
 * BAD (will trigger error):
 *   return c.json({ user, token });                    // Missing type
 *   return c.json<typeof result>(result);              // typeof not allowed
 *   return c.json<unknown>(data);                      // unknown not allowed
 *   return c.json<{ a: string; b: string; c: string; d: string }>(data);  // >3 props inline
 *   return ctx.json(data);                             // Missing type
 *
 * GOOD:
 *   return c.json<{ message: string }>({ message });   // Simple inline (≤3 props)
 *   return c.json<{ success: boolean }>({ success: true });
 *   return c.json<LoginResponse>({ user, token });    // Named type for complex
 *   return c.json<UserListResponse>(users);           // Named type
 *
 * TYPES SHOULD BE:
 * - Defined in the module's types.ts file
 * - Imported from shared type definitions
 * - Inline object types for simple responses (≤3 properties)
 */

type MessageId = "missingGenericType" | "noTypeofAllowed" | "noUnknownAllowed" | "tooManyInlineProperties";

type RuleContext = {
  report(descriptor: { node: AstNode; messageId: MessageId }): void;
};

const MAX_INLINE_PROPERTIES = 3;

function countTypeProperties(typeNode: AstNode): number {
  if (typeNode.type !== "TSTypeLiteral" || !Array.isArray(typeNode.members)) {
    return -1;
  }

  return typeNode.members.filter(
    (member) => member.type === "TSPropertySignature" || member.type === "TSMethodSignature",
  ).length;
}

// eslint-disable-next-line import/no-default-export
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Require Hono context json() calls to have explicit response type parameters.",
      recommended: true,
    },
    messages: {
      missingGenericType:
        "c.json() must have an explicit generic type parameter. Use c.json<YourResponseType>(...) or c.json<{ prop: Type }>(...) for simple responses.",
      noTypeofAllowed: "c.json() generic type cannot use 'typeof'. Use a proper type definition or interface instead.",
      noUnknownAllowed: "c.json() generic type cannot be 'unknown'. Use a concrete response type or interface instead.",
      tooManyInlineProperties: `Inline type has more than ${MAX_INLINE_PROPERTIES} properties. Extract to a named type/interface in the module's types.ts file.`,
    },
    schema: [],
  },
  create(context: RuleContext) {
    return {
      CallExpression(node: AstNode) {
        if (!isHonoJsonCall(node)) {
          return;
        }

        const typeArguments = getCallTypeArguments(node);

        if (typeArguments.length === 0) {
          context.report({
            node,
            messageId: "missingGenericType",
          });
          return;
        }

        const [firstTypeArgument] = typeArguments;

        if (firstTypeArgument.type === "TSTypeQuery") {
          context.report({
            node,
            messageId: "noTypeofAllowed",
          });
          return;
        }

        if (firstTypeArgument.type === "TSUnknownKeyword") {
          context.report({
            node,
            messageId: "noUnknownAllowed",
          });
          return;
        }

        const propertyCount = countTypeProperties(firstTypeArgument);

        if (propertyCount > MAX_INLINE_PROPERTIES) {
          context.report({
            node,
            messageId: "tooManyInlineProperties",
          });
        }
      },
    };
  },
};
