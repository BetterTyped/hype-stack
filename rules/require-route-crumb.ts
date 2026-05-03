/**
 * Oxlint JS Plugin Rule: require-route-crumb
 *
 * PURPOSE:
 * Ensures every TanStack Router file route defines a `loader` that returns
 * an object containing a `crumb` property, so breadcrumbs render on every page.
 *
 * SCOPE:
 * Only runs on files matching `routes/**\/*.{ts,tsx}`.
 * Layout routes (path without trailing slash, e.g. `"/(default)"`) are
 * excluded because they wrap child routes and don't represent standalone pages.
 *
 * BAD (will trigger error):
 *   export const Route = createFileRoute("/(default)/settings/")({
 *     component: RouteComponent,
 *   });
 *
 *   export const Route = createFileRoute("/(default)/settings/")({
 *     component: RouteComponent,
 *     loader: () => ({ title: "Settings" }),  // missing `crumb`
 *   });
 *
 * GOOD:
 *   export const Route = createFileRoute("/(default)/settings/")({
 *     component: RouteComponent,
 *     loader: () => {
 *       return { crumb: "Settings" };
 *     },
 *   });
 */

type AstNode = {
  type?: string;
  name?: string;
  value?: unknown;
  callee?: AstNode;
  property?: AstNode;
  object?: AstNode;
  arguments?: AstNode[];
  properties?: AstNode[];
  key?: AstNode;
  body?: AstNode;
  expression?: AstNode;
  argument?: AstNode;
  consequent?: AstNode[];
};

type RuleContext = {
  report(descriptor: { node: AstNode; messageId: "missingCrumb" | "loaderMissingCrumb" }): void;
  getFilename(): string;
};

function isCreateFileRouteCall(node: AstNode): boolean {
  if (node.type !== "CallExpression") {
    return false;
  }

  const { callee } = node;

  if (
    callee?.type === "CallExpression" &&
    callee.callee?.type === "Identifier" &&
    callee.callee.name === "createFileRoute"
  ) {
    return true;
  }

  return false;
}

function isLayoutRoute(node: AstNode): boolean {
  const innerCall = node.callee;
  if (innerCall?.type !== "CallExpression" || !innerCall.arguments?.length) {
    return false;
  }

  const routePath = innerCall.arguments[0];
  if ((routePath?.type === "Literal" || routePath?.type === "StringLiteral") && typeof routePath.value === "string") {
    return !routePath.value.endsWith("/");
  }

  return false;
}

function getPropertyByName(properties: AstNode[], name: string): AstNode | undefined {
  return properties.find((prop) => {
    if (prop.type !== "Property") {
      return false;
    }
    const key = prop.key;
    return key?.type === "Identifier" && key.name === name;
  });
}

function bodyReturnsCrumb(body: AstNode): boolean {
  if (!body) {
    return false;
  }

  if (body.type === "ObjectExpression" && Array.isArray(body.properties)) {
    return !!getPropertyByName(body.properties, "crumb");
  }

  if (body.type === "BlockStatement" && Array.isArray(body.body)) {
    for (const stmt of body.body as AstNode[]) {
      if (
        stmt.type === "ReturnStatement" &&
        stmt.argument?.type === "ObjectExpression" &&
        Array.isArray(stmt.argument.properties)
      ) {
        if (getPropertyByName(stmt.argument.properties, "crumb")) {
          return true;
        }
      }
    }
  }

  return false;
}

function loaderReturnsCrumb(loaderProp: AstNode): boolean {
  const loaderValue = (loaderProp as unknown as { value?: AstNode }).value;
  if (!loaderValue) {
    return false;
  }

  if (loaderValue.type === "ArrowFunctionExpression" || loaderValue.type === "FunctionExpression") {
    return bodyReturnsCrumb(loaderValue.body!);
  }

  return false;
}

// eslint-disable-next-line import/no-default-export
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Require TanStack Router file routes to define a loader returning { crumb }.",
      recommended: true,
    },
    messages: {
      missingCrumb: 'Route is missing a `loader` that returns `{ crumb: "..." }`. Add one so breadcrumbs render.',
      loaderMissingCrumb: "Route loader must return an object with a `crumb` property for breadcrumbs.",
    },
    schema: [],
  },
  create(context: RuleContext) {
    const filename = context.getFilename();
    const isRouteFile = /routes[/\\]/.test(filename);

    if (!isRouteFile) {
      return {};
    }

    return {
      CallExpression(node: AstNode) {
        if (!isCreateFileRouteCall(node)) {
          return;
        }

        if (isLayoutRoute(node)) {
          return;
        }

        const configArg = node.arguments?.[0];
        if (!configArg || configArg.type !== "ObjectExpression" || !Array.isArray(configArg.properties)) {
          return;
        }

        const loaderProp = getPropertyByName(configArg.properties, "loader");

        if (!loaderProp) {
          context.report({ node, messageId: "missingCrumb" });
          return;
        }

        if (!loaderReturnsCrumb(loaderProp)) {
          context.report({ node: loaderProp, messageId: "loaderMissingCrumb" });
        }
      },
    };
  },
};
