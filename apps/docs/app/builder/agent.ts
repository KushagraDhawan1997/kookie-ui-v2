/**
 * THE BUILDER, DRIVEN BY AN AGENT (2026-11-03, Kushagra: "Builder is on the table, and that has to
 * be AI driven too, so that I can build interfaces on Kookie UI's builder using AI/MCP").
 *
 * Three tools, offered to an agent in the browser through WebMCP like the docs pages' four: read
 * the screen, write the screen, and look up what the catalog allows. An agent writes a whole
 * screen at once and gets the review panel's findings back in the same answer, so it fixes its
 * own composition the way a person does: build, read the findings, build again.
 *
 * A WRITE IS ONE EDIT. It goes through the reducer's `edit` action, so it lands on the same undo
 * history as a person's edits and one Undo takes it back. That is the "one undo for people and
 * AI" rule, held by construction rather than by a second history.
 *
 * A WRITE REFUSES RATHER THAN REPAIRS. Storage is sanitised on load because a stored document was
 * once legal; an agent's document was never checked, so an unknown component, a prop the catalog
 * does not state, or a value off its closed list comes back as an error naming the node, and the
 * canvas is left as it was. Quietly dropping what an agent asked for would teach it nothing.
 */

import { componentAxes } from "@kushagradhawan/kookie-ui-react";

import { CATALOG, canContain, slotsFor, type PropSchema } from "./catalog";
import { CANVAS_TYPE, canvasChildren, canvasNode, withStableIds, type BuilderDoc, type BuilderNode, type PropValue } from "./model";
import { legalValue, reviewDocument } from "./review";
import { serializeDocument } from "./serialize";

export const BUILDER_TOOL_NAMES = {
  catalog: "kookie_builder_catalog",
  read: "kookie_builder_read",
  write: "kookie_builder_write",
} as const;

export type BuilderTool = {
  name: string;
  description: string;
  inputSchema: { type: "object"; properties: Record<string, unknown>; required?: string[] };
  annotations: { readOnlyHint: boolean };
  execute: (input: Record<string, unknown>) => Promise<string>;
};

/** What the tools need from the editor: the document on screen now, and a way to replace it. */
export type BuilderAgentEnv = {
  doc: () => BuilderDoc;
  name: () => string;
  /** Replace the canvas's children with `roots`, as one undoable edit. */
  write: (roots: BuilderNode[]) => void;
};

/* ── The catalog, as an agent reads it ──────────────────────────────────────────────────── */

const valuesOf = (schema: PropSchema): string => {
  if (schema.kind === "axis") return (componentAxes[schema.axis] as readonly string[]).join(" | ");
  if (schema.kind === "options") return schema.values.join(" | ");
  return schema.kind;
};

const describeEntry = (type: string): string => {
  const entry = CATALOG[type]!;
  const props = Object.entries(entry.props).map(
    ([key, schema]) =>
      `- ${key}: ${valuesOf(schema)}${"responsive" in schema && schema.responsive ? " (or a per-tier object)" : ""}`,
  );
  const children =
    entry.children === "none"
      ? "none"
      : entry.children === "text"
        ? "text (set `text`)"
        : entry.children === "any"
          ? "any component"
          : `only ${entry.children.only.join(", ")}`;
  return [
    `# ${type}`,
    entry.blurb,
    `Children: ${children}`,
    ...(entry.slots?.length ? [`Slots: ${entry.slots.join(", ")}`] : []),
    ...(entry.requiresAncestor ? [`Only inside a ${entry.requiresAncestor}`] : []),
    "Props:",
    ...(props.length ? props : ["(none)"]),
  ].join("\n");
};

function catalog(input: Record<string, unknown>): string {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (name) {
    const type = Object.keys(CATALOG).find((key) => key.toLowerCase() === name.toLowerCase());
    return type ? describeEntry(type) : `No component named "${name}" in the builder's catalog.`;
  }
  return [
    "The components a builder screen can use. Call again with a name for its props and children.",
    ...Object.entries(CATALOG)
      .filter(([, entry]) => !entry.partOf)
      .map(([type, entry]) => `- ${type} (${entry.family}): ${entry.blurb}`),
  ].join("\n");
}

/* ── Validation: refuse, naming the node ────────────────────────────────────────────────── */

type Incoming = { type?: unknown; props?: unknown; text?: unknown; slot?: unknown; children?: unknown };

const legal = (type: string, key: string, value: PropValue): boolean => {
  if (value !== null && typeof value === "object") {
    const schema = CATALOG[type]?.props[key];
    if (!schema || !("responsive" in schema) || !schema.responsive) return false;
    return Object.values(value).every((tier) => legalValue(type, key, tier));
  }
  return legalValue(type, key, value);
};

/** An agent's tree, checked against the catalog. Returns the nodes, or every error found. */
export function validate(nodes: unknown): { roots: BuilderNode[] } | { errors: string[] } {
  const errors: string[] = [];
  const walk = (raw: Incoming, path: string, parent: string, chain: string[]): BuilderNode | null => {
    const type = typeof raw.type === "string" ? raw.type : "";
    const at = `${path} (${type || "no type"})`;
    if (!CATALOG[type]) {
      errors.push(`${at}: not a builder component. Call ${BUILDER_TOOL_NAMES.catalog} for the list.`);
      return null;
    }
    const entry = CATALOG[type];
    if (!canContain(parent, type, chain)) errors.push(`${at}: a ${parent} cannot hold a ${type}.`);
    const props: Record<string, PropValue> = {};
    for (const [key, value] of Object.entries((raw.props as Record<string, PropValue>) ?? {})) {
      if (!(key in entry.props)) errors.push(`${at}: ${type} has no prop "${key}".`);
      else if (!legal(type, key, value)) errors.push(`${at}: ${JSON.stringify(value)} is not a value of ${type}.${key} (${valuesOf(entry.props[key]!)}).`);
      else props[key] = value;
    }
    const node: BuilderNode = { id: "", type, props };
    if (raw.text !== undefined) {
      if (entry.children !== "text") errors.push(`${at}: ${type} takes no text.`);
      else if (typeof raw.text === "string") node.text = raw.text;
    }
    if (raw.slot !== undefined) {
      if (raw.slot !== "leading" && raw.slot !== "trailing") errors.push(`${at}: slot is "leading" or "trailing".`);
      else if (!slotsFor(parent).includes(raw.slot)) errors.push(`${at}: a ${parent} has no ${raw.slot} slot.`);
      else node.slot = raw.slot;
    }
    if (raw.children !== undefined) {
      if (!Array.isArray(raw.children)) errors.push(`${at}: children must be a list.`);
      else if (entry.children === "none" || entry.children === "text") errors.push(`${at}: ${type} takes no child components.`);
      else
        node.children = raw.children
          .map((child, i) => walk((child ?? {}) as Incoming, `${path}.${i}`, type, [...chain, type]))
          .filter((child): child is BuilderNode => child !== null);
    }
    return node;
  };
  if (!Array.isArray(nodes)) return { errors: ["`nodes` must be a list of components."] };
  const roots = nodes
    .map((raw, i) => walk((raw ?? {}) as Incoming, `nodes.${i}`, CANVAS_TYPE, [CANVAS_TYPE]))
    .filter((n): n is BuilderNode => n !== null);
  return errors.length ? { errors } : { roots };
}

/* ── The screen, as an agent reads it ───────────────────────────────────────────────────── */

/** The tree without editor ids: the agent writes the same shape back. */
const strip = (n: BuilderNode): Record<string, unknown> => ({
  type: n.type,
  ...(Object.keys(n.props).length ? { props: n.props } : {}),
  ...(n.text !== undefined ? { text: n.text } : {}),
  ...(n.slot ? { slot: n.slot } : {}),
  ...(n.children?.length ? { children: n.children.map(strip) } : {}),
});

const findingsOf = (doc: BuilderDoc): string => {
  const findings = reviewDocument(doc);
  if (findings.length === 0) return "Review: no findings.";
  return [
    `Review: ${findings.length} finding${findings.length === 1 ? "" : "s"}.`,
    ...findings.map((f) => `- [${f.severity}] ${f.title}: ${f.message}`),
  ].join("\n");
};

function read(env: BuilderAgentEnv): string {
  const doc = env.doc();
  return [
    `Screen: ${env.name()}`,
    "Nodes:",
    JSON.stringify(canvasChildren(doc).map(strip), null, 2),
    findingsOf(doc),
  ].join("\n");
}

function write(env: BuilderAgentEnv, input: Record<string, unknown>): string {
  const checked = validate(input.nodes);
  if ("errors" in checked) return ["Nothing changed. Fix these and write again:", ...checked.errors.map((e) => `- ${e}`)].join("\n");
  const children = withStableIds(checked.roots, `a${Date.now().toString(36)}-`);
  const doc = env.doc();
  // The canvas keeps its own id and props (its padding and gap are a person's choice); only
  // what is on it changes.
  const next: BuilderDoc = { ...doc, roots: [{ ...(doc.roots[0] ?? canvasNode()), children }] };
  // The serializer is the last word: it throws on anything the exported code could not say.
  try {
    serializeDocument(next);
  } catch (error) {
    return `Nothing changed. ${(error as Error).message}`;
  }
  env.write(next.roots);
  return ["Written. One Undo takes it back.", findingsOf(next)].join("\n");
}

/* ── The set ────────────────────────────────────────────────────────────────────────────── */

const NODE_SHAPE =
  'Each node is { "type": "Card", "props": { "size": "3" }, "text": "…", "slot": "leading" | "trailing", "children": [ … ] }. Only `type` is required.';

export function builderTools(env: BuilderAgentEnv): BuilderTool[] {
  return [
    {
      name: BUILDER_TOOL_NAMES.catalog,
      description:
        "List the components a KookieUI builder screen can use, or, given a name, the props it takes with every legal value, what it may hold, and its slots.",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string", description: "A component name, such as Card. Leave it out for the list." } },
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => catalog(input),
    },
    {
      name: BUILDER_TOOL_NAMES.read,
      description:
        "Read the screen open in the KookieUI builder: its components as a tree, and the review panel's findings about its composition.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => read(env),
    },
    {
      name: BUILDER_TOOL_NAMES.write,
      description: `Replace the screen open in the KookieUI builder with a tree of components, as one undoable edit, and get the review's findings back. Read the screen first and fix every finding. ${NODE_SHAPE}`,
      inputSchema: {
        type: "object",
        properties: {
          nodes: {
            type: "array",
            description: `The screen's top-level components, in order. ${NODE_SHAPE}`,
            items: { type: "object" },
          },
        },
        required: ["nodes"],
      },
      annotations: { readOnlyHint: false },
      execute: async (input) => write(env, input),
    },
  ];
}

