/**
 * Document → JSX (2026-08-19). The bar is that a reader of the exported code cannot tell a
 * builder produced it: real imports from @kookie-ui/react, no wrapper divs, no builder
 * runtime, only the props the user actually stated — and a Theme wrapper only when the
 * document's identity differs from the system's defaults, stating only the axes that differ.
 *
 * The serializer REFUSES rather than degrades: an unknown component or an unstated-in-the-
 * catalog prop throws, because the alternative is exported code quietly wider than the
 * system — the exact failure this builder exists to make impossible. A law feeds it a
 * hostile node and expects the throw.
 *
 * `effectiveProps` is shared with the canvas interpreter on purpose: the round-trip law
 * (exported code, compiled and rendered, versus the canvas render) is only meaningful if
 * both sides read ONE derivation of "what props does this node state".
 */

import { themeDefaults } from "@kookie-ui/react";

import { CATALOG } from "./catalog";
import { TIER_KEYS, type PropValue, type ResponsiveValue } from "./model";
import type { BuilderDoc, BuilderNode } from "./model";

/** A responsive object normalized to what it actually SAYS: tiers in resolution order,
    unknown tiers refused, `{ initial }` alone collapsed to the plain value (a one-tier
    object states nothing a string does not), an empty object collapsed to unset. Shared
    by the serializer and the interpreter through effectiveProps, so the canvas and the
    export cannot read one statement two ways. */
const normalizeResponsive = (
  key: string,
  type: string,
  v: ResponsiveValue,
): string | ResponsiveValue | undefined => {
  for (const tier of Object.keys(v)) {
    if (!(TIER_KEYS as readonly string[]).includes(tier)) {
      throw new Error(`"${tier}" is not a tier on ${type}.${key} — the tiers are ${TIER_KEYS.join(", ")}.`);
    }
  }
  const ordered: ResponsiveValue = {};
  for (const tier of TIER_KEYS) {
    const value = v[tier];
    if (value !== undefined) ordered[tier] = value;
  }
  const keys = Object.keys(ordered);
  if (keys.length === 0) return undefined;
  if (keys.length === 1 && ordered.initial !== undefined) return ordered.initial;
  return ordered;
};

/** The props a node states, in catalog order, with `false` booleans dropped — an unset
    boolean and a false one are the same statement, so only one spelling may exist. */
export const effectiveProps = (n: BuilderNode): [string, PropValue][] => {
  const entry = CATALOG[n.type];
  if (!entry) throw new Error(`Unknown component "${n.type}" — not in the builder catalog.`);
  const out: [string, PropValue][] = [];
  for (const key of Object.keys(entry.props)) {
    let v = n.props[key];
    if (v !== undefined && typeof v === "object") {
      const schema = entry.props[key]!;
      if (!("responsive" in schema) || !schema.responsive) {
        throw new Error(`${n.type}.${key} is not a responsive prop — refusing a per-tier value.`);
      }
      v = normalizeResponsive(key, n.type, v);
    }
    if (v === undefined || v === false) continue;
    out.push([key, v]);
  }
  for (const key of Object.keys(n.props)) {
    if (!(key in entry.props)) {
      throw new Error(`"${key}" is not a prop the builder knows on ${n.type} — refusing to export it.`);
    }
  }
  return out;
};

const attr = (key: string, value: PropValue): string => {
  // `false` never reaches here — effectiveProps drops it, so `true` is the only boolean.
  if (typeof value === "boolean") return key;
  if (typeof value === "number") return `${key}={${value}}`;
  if (typeof value === "object") {
    // The package's own responsive spelling, tiers already in order from normalization.
    const entries = Object.entries(value).map(([tier, v]) => `${tier}: ${JSON.stringify(v)}`);
    return `${key}={{ ${entries.join(", ")} }}`;
  }
  // Clean attribute form when the string is tame; JSON-in-braces when it is not.
  if (!/[\\"\n]/.test(value)) return `${key}="${value}"`;
  return `${key}={${JSON.stringify(value)}}`;
};

/** JSX text: raw when it survives JSX's own parsing untouched; a quoted expression child
    when it would not (braces, angle brackets, entities, edge whitespace). */
const jsxText = (text: string): string =>
  /[<>{}&]/.test(text) || text !== text.trim() ? `{${JSON.stringify(text)}}` : text;

const openTag = (n: BuilderNode): string => {
  const props = effectiveProps(n).map(([k, v]) => attr(k, v));
  return [n.type, ...props].join(" ");
};

/** One node on one line — for render={...} children and text-bearing leaves. */
const inline = (n: BuilderNode): string => {
  const entry = CATALOG[n.type]!;
  if (entry.children === "text" || n.text !== undefined) {
    return `<${openTag(n)}>${jsxText(n.text ?? "")}</${n.type}>`;
  }
  if (n.children?.length) return `<${openTag(n)}>${n.children.map(inline).join("")}</${n.type}>`;
  return `<${openTag(n)} />`;
};

const serializeNode = (n: BuilderNode, depth: number): string => {
  const entry = CATALOG[n.type];
  if (!entry) throw new Error(`Unknown component "${n.type}" — not in the builder catalog.`);
  const pad = "  ".repeat(depth);

  if (entry.renderChild) {
    const child = n.children?.[0];
    // A trigger with nothing to render is an authoring hole, not something to paper over.
    if (!child) throw new Error(`${n.type} has no child to pass through render.`);
    const props = effectiveProps(n).map(([k, v]) => attr(k, v));
    return `${pad}<${[n.type, ...props].join(" ")} render={${inline(child)}} />`;
  }

  if (entry.children === "text") {
    return `${pad}<${openTag(n)}>${jsxText(n.text ?? "")}</${n.type}>`;
  }

  if (!n.children?.length) return `${pad}<${openTag(n)} />`;

  const children = n.children.map((c) => serializeNode(c, depth + 1)).join("\n");
  return `${pad}<${openTag(n)}>\n${children}\n${pad}</${n.type}>`;
};

const collectTypes = (n: BuilderNode, into: Set<string>): void => {
  into.add(n.type);
  n.children?.forEach((c) => collectTypes(c, into));
};

/** The document's Theme statement: only the axes that differ from the system's defaults —
    an exported screen restating a default would pin today's default forever. */
export const themeDiffs = (doc: BuilderDoc): [string, string][] =>
  (Object.entries(doc.theme) as [keyof BuilderDoc["theme"], string][]).filter(
    ([axis, value]) => themeDefaults[axis] !== value,
  );

/** A valid component name from a human label: "media card" → "MediaCard". */
export const toComponentName = (label: string): string => {
  const name = label
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join("");
  return /^[A-Z]/.test(name) ? name : `Block${name}`;
};

export const serializeDocument = (doc: BuilderDoc, exportName = "BuiltScreen"): string => {
  if (doc.roots.length === 0) {
    return [`export function ${exportName}() {`, "  return null;", "}", ""].join("\n");
  }

  const used = new Set<string>();
  doc.roots.forEach((r) => collectTypes(r, used));

  const diffs = themeDiffs(doc);
  if (diffs.length) used.add("Theme");

  const imports = [...used].sort((a, b) => a.localeCompare(b));

  // Body: roots, optionally inside a fragment, optionally inside the Theme statement.
  const needsFragment = doc.roots.length !== 1;
  const wrapDepth = 2 + (diffs.length ? 1 : 0);
  const rootDepth = wrapDepth + (needsFragment ? 1 : 0);
  let body = doc.roots.map((r) => serializeNode(r, rootDepth)).join("\n");
  if (needsFragment) {
    const pad = "  ".repeat(wrapDepth);
    body = `${pad}<>\n${body}\n${pad}</>`;
  }
  if (diffs.length) {
    const pad = "  ".repeat(2);
    const themeAttrs = diffs.map(([axis, value]) => `${axis}="${value}"`).join(" ");
    body = `${pad}<Theme ${themeAttrs}>\n${body}\n${pad}</Theme>`;
  }

  return [
    `import { ${imports.join(", ")} } from "@kookie-ui/react";`,
    "",
    `export function ${exportName}() {`,
    "  return (",
    body,
    "  );",
    "}",
    "",
  ].join("\n");
};

/** A saved block as its own component — a frozen subtree with a name. */
export const serializeBlock = (name: string, root: BuilderNode): string => {
  const used = new Set<string>();
  collectTypes(root, used);
  const imports = [...used].sort((a, b) => a.localeCompare(b));
  return [
    `import { ${imports.join(", ")} } from "@kookie-ui/react";`,
    "",
    `export function ${toComponentName(name)}() {`,
    "  return (",
    serializeNode(root, 2),
    "  );",
    "}",
    "",
  ].join("\n");
};
