export type AstNode = {
  type?: string;
  name?: string;
  value?: unknown;
  callee?: AstNode;
  property?: AstNode;
  object?: AstNode;
  arguments?: AstNode[];
  typeArguments?: TypeArguments | AstNode[];
  typeParameters?: TypeArguments | AstNode[];
  params?: AstNode[];
  members?: AstNode[];
  properties?: AstNode[];
  key?: AstNode;
};

export type TypeArguments = {
  params?: AstNode[];
};

const HONO_CONTEXT_NAMES = new Set(["c", "ctx", "context"]);

export function getStaticPropertyName(property: AstNode | undefined): string | null {
  if (!property) {
    return null;
  }

  if (property.type === "Identifier" && typeof property.name === "string") {
    return property.name;
  }

  if ((property.type === "Literal" || property.type === "StringLiteral") && typeof property.value === "string") {
    return property.value;
  }

  return null;
}

export function isHonoJsonCall(node: AstNode): boolean {
  if (node.type !== "CallExpression" || node.callee?.type !== "MemberExpression") {
    return false;
  }

  const methodName = getStaticPropertyName(node.callee.property);
  if (methodName !== "json") {
    return false;
  }

  const { object } = node.callee;
  if (object?.type !== "Identifier" || typeof object.name !== "string") {
    return false;
  }

  return HONO_CONTEXT_NAMES.has(object.name.toLowerCase());
}

export function getCallTypeArguments(node: AstNode): AstNode[] {
  const typeArguments = node.typeArguments ?? node.typeParameters;

  if (!typeArguments) {
    return [];
  }

  if (Array.isArray(typeArguments)) {
    return typeArguments;
  }

  return typeArguments.params ?? [];
}

export function getNumericLiteralValue(node: AstNode | undefined): number | null {
  if (!node) {
    return null;
  }

  if ((node.type === "Literal" || node.type === "NumericLiteral") && typeof node.value === "number") {
    return node.value;
  }

  return null;
}
