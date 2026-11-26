/**
 * Reading JSX for the composition rules.
 *
 * `kookie-symbols.ts` answers "is this element ours". The composition rules need one more
 * fact: WHICH of ours it is, under whatever local name the file gave it (`Dialog as Modal`).
 * So this tracks the imported name beside the local one. It reads one file's syntax and
 * nothing else: no types, no other files. That keeps every rule here runnable by any linter
 * that speaks ESLint's rule API.
 */
import { PACKAGE } from "./kookie-symbols.ts";

export type Node = { type: string; [key: string]: unknown };

export type Imports = {
  /** Local name to the name the package exports it under. */
  readonly named: Map<string, string>;
  /** Local names bound to `import * as Kui`. */
  readonly namespaces: Set<string>;
  /** The last named specifier imported from the package, where a fix adds a name. */
  lastSpecifier: Node | null;
};

export const createImports = (): Imports => ({ named: new Map(), namespaces: new Set(), lastSpecifier: null });

/** Call from an `ImportDeclaration` listener. */
export function readImport(imports: Imports, node: Node): void {
  const source = node.source as { value?: unknown } | undefined;
  if (source?.value !== PACKAGE) return;
  for (const specifier of (node.specifiers ?? []) as Node[]) {
    const local = (specifier.local as { name?: string } | undefined)?.name;
    if (!local) continue;
    if (specifier.type === "ImportNamespaceSpecifier") imports.namespaces.add(local);
    else if (specifier.type === "ImportSpecifier") {
      const imported = specifier.imported as { name?: string; value?: string } | undefined;
      imports.named.set(local, imported?.name ?? imported?.value ?? local);
      if (node.importKind !== "type" && specifier.importKind !== "type") imports.lastSpecifier = specifier;
    }
  }
}

/** The package's own name for this element, or null when the element is not one of ours. */
export function kookieName(imports: Imports, element: Node | undefined): string | null {
  const opening = element?.type === "JSXElement" ? (element.openingElement as Node) : element;
  const name = opening?.name as Node | undefined;
  if (!name) return null;
  if (name.type === "JSXIdentifier") return imports.named.get(String(name.name)) ?? null;
  if (name.type === "JSXMemberExpression") {
    const object = name.object as Node | undefined;
    if (object?.type === "JSXIdentifier" && imports.namespaces.has(String(object.name))) {
      return String((name.property as Node).name);
    }
  }
  return null;
}

/** The name as the file wrote it, for a message. */
export function writtenName(element: Node): string {
  const opening = element.type === "JSXElement" ? (element.openingElement as Node) : element;
  const name = opening.name as Node;
  if (name.type === "JSXIdentifier") return String(name.name);
  if (name.type === "JSXMemberExpression") {
    return `${String((name.object as Node).name)}.${String((name.property as Node).name)}`;
  }
  return "";
}

/** A plain attribute by name, or undefined. A spread is not one. */
export function attribute(element: Node, name: string): Node | undefined {
  const opening = element.type === "JSXElement" ? (element.openingElement as Node) : element;
  return ((opening.attributes ?? []) as Node[]).find(
    (entry) => entry.type === "JSXAttribute" && (entry.name as Node | undefined)?.name === name,
  );
}

/** Does the element spread props? Then what it receives cannot be read from the file. */
export function hasSpread(element: Node): boolean {
  const opening = element.type === "JSXElement" ? (element.openingElement as Node) : element;
  return ((opening.attributes ?? []) as Node[]).some((entry) => entry.type === "JSXSpreadAttribute");
}

/** An attribute's value when it is a plain string, in either spelling. */
export function stringValue(entry: Node | undefined): string | null {
  const value = entry?.value as Node | undefined | null;
  if (!value) return null;
  if (value.type === "Literal" && typeof value.value === "string") return value.value;
  if (value.type === "JSXExpressionContainer") {
    const inner = value.expression as Node | undefined;
    if (inner?.type === "Literal" && typeof inner.value === "string") return inner.value;
  }
  return null;
}

/** The element an attribute holds, as in `render={<DialogTitle />}`. */
export function elementValue(entry: Node | undefined): Node | null {
  const value = entry?.value as Node | undefined | null;
  if (value?.type !== "JSXExpressionContainer") return null;
  const inner = value.expression as Node | undefined;
  return inner?.type === "JSXElement" ? inner : null;
}

/** The JSX elements directly inside this one, looking through fragments. */
export function childElements(element: Node): Node[] {
  const out: Node[] = [];
  for (const child of (element.children ?? []) as Node[]) {
    if (child.type === "JSXElement") out.push(child);
    else if (child.type === "JSXFragment") out.push(...childElements(child));
  }
  return out;
}

/**
 * Can every child of this element be read from the file? A `{children}` or a `{rows.map(…)}`
 * is content the rule cannot see, and a rule that cannot see must stay silent.
 */
export function isClosed(element: Node): boolean {
  return ((element.children ?? []) as Node[]).every((child) => {
    if (child.type === "JSXElement" || child.type === "JSXText") return true;
    if (child.type === "JSXFragment") return isClosed(child);
    if (child.type === "JSXExpressionContainer") {
      const inner = child.expression as Node | undefined;
      return inner?.type === "JSXEmptyExpression" || inner?.type === "Literal";
    }
    return false;
  });
}

/** Every element under this one, in document order, including those held in a `render` prop. */
export function* descendants(element: Node): Generator<Node> {
  for (const child of childElements(element)) {
    yield child;
    const rendered = elementValue(attribute(child, "render"));
    if (rendered) {
      yield rendered;
      yield* descendants(rendered);
    }
    yield* descendants(child);
  }
}

/** The words written directly inside an element, trimmed. Null when any child is not text. */
export function textOf(element: Node): string | null {
  const parts: string[] = [];
  for (const child of (element.children ?? []) as Node[]) {
    if (child.type === "JSXText") parts.push(String(child.value));
    else if (child.type === "JSXExpressionContainer") {
      const inner = child.expression as Node | undefined;
      if (inner?.type === "Literal" && typeof inner.value === "string") parts.push(inner.value);
      else if (inner?.type !== "JSXEmptyExpression") return null;
    } else return null;
  }
  return parts.join("").replace(/\s+/g, " ").trim();
}

/** The name a fix can write for one of the package's exports, and the import edit it needs. */
export function localNameFor(
  imports: Imports,
  exported: string,
): { name: string; importAfter: Node | null } | null {
  for (const [local, imported] of imports.named) {
    if (imported === exported) return { name: local, importAfter: null };
  }
  const [namespace] = imports.namespaces;
  if (namespace) return { name: `${namespace}.${exported}`, importAfter: null };
  // A local of the same name that is NOT ours would be shadowed by the import the fix adds.
  if (imports.named.has(exported) || !imports.lastSpecifier) return null;
  return { name: exported, importAfter: imports.lastSpecifier };
}
