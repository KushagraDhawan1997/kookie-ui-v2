/**
 * Which JSX elements in a file are OURS.
 *
 * Both rules exist to catch a call site reaching past the API, so both have to know that the
 * element under the cursor came from this package. A consumer's own `<Header className="p-4">`
 * is their business; a `<Card>` wearing the same class is a system boundary being walked
 * around, and the difference is only visible in the import list.
 *
 * A namespace import is tracked separately because `<Kui.Card>` parses as a member expression
 * rather than an identifier, and an import that renames (`Card as Pane`) is tracked by its
 * LOCAL name for the same reason: the rule reads source, and source only ever says the local.
 */

/** The one specifier a consumer imports from. Flat exports, so there are no deep subpaths. */
export const PACKAGE = "@kookie-ui/react";

export type SymbolTracker = {
  /** Local names bound to a named or default import — `Card`, or `Pane` after a rename. */
  readonly named: Set<string>;
  /** Local names bound to `import * as Kui`, which reach components through a member. */
  readonly namespaces: Set<string>;
};

/** A minimal shape of the nodes these rules touch; the parser hands us far more than this. */
type Node = { type: string; [key: string]: unknown };

export const createTracker = (): SymbolTracker => ({ named: new Set(), namespaces: new Set() });

/** Call from an `ImportDeclaration` listener; anything not from this package is ignored. */
export function recordImport(tracker: SymbolTracker, node: Node): void {
  const source = node.source as { value?: unknown } | undefined;
  if (!source || source.value !== PACKAGE) return;
  const specifiers = (node.specifiers ?? []) as Array<{ type: string; local?: { name?: string } }>;
  for (const specifier of specifiers) {
    const local = specifier.local?.name;
    if (!local) continue;
    if (specifier.type === "ImportNamespaceSpecifier") tracker.namespaces.add(local);
    else tracker.named.add(local);
  }
}

/**
 * Does this opening element name a component of ours?
 *
 * `<Card>` is an identifier; `<Kui.Card>` is a member expression whose object is the namespace.
 * A lowercase tag (`<div>`) can never be one of ours, and falls out of the identifier test
 * without needing a case check of its own — nothing binds `div` to an import.
 */
export function isKookieElement(tracker: SymbolTracker, nameNode: Node | undefined): boolean {
  if (!nameNode) return false;
  if (nameNode.type === "JSXIdentifier") {
    return tracker.named.has(String(nameNode.name));
  }
  if (nameNode.type === "JSXMemberExpression") {
    const object = nameNode.object as Node | undefined;
    return object?.type === "JSXIdentifier" && tracker.namespaces.has(String(object.name));
  }
  return false;
}
