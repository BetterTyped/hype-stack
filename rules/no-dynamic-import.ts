/**
 * Oxlint JS Plugin Rule: no-dynamic-import
 *
 * Forbids dynamic `import()` expressions. All imports must be static so the
 * dependency graph is fully analysable at build time.
 *
 * BAD:
 *   const mod = await import("./foo");
 *   import(`./locale/${lang}.ts`);
 *
 * GOOD:
 *   import { foo } from "./foo";
 */

type AstNode = {
  type: string;
};

type RuleContext = {
  report(descriptor: { node: AstNode; messageId: "noDynamicImport" }): void;
};

// eslint-disable-next-line import/no-default-export
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow dynamic import() expressions.",
      recommended: true,
    },
    messages: {
      noDynamicImport: "Dynamic imports are forbidden. Use static imports instead.",
    },
    schema: [],
  },
  create(context: RuleContext) {
    return {
      ImportExpression(node: AstNode) {
        context.report({
          node,
          messageId: "noDynamicImport",
        });
      },
    };
  },
};
