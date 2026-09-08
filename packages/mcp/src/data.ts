/**
 * The snapshot, and the lookups over it.
 *
 * `dist/data.json` is written by `scripts/build-data.ts` before `tsdown` runs, so it sits
 * beside this module's own output and travels with the package. It is read once, on the first
 * question asked, rather than at import: a stdio server that dies while parsing 700 KB has no
 * channel to say why, and a client sees a process that exited.
 */
import { refusalReaches } from "@kookie-ui/react/agent";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * THE SNAPSHOT'S SHAPE LIVES HERE, not beside the script that writes it, because this is the
 * half that ships: `scripts/build-data.ts` imports these types, so the writer is checked
 * against the reader rather than the other way round.
 */
export type ApiProp = { name: string; type: string; optional: boolean; doc: string };
export type ApiEntry = { element: string | null; props: ApiProp[] };
export type ComponentRow = { name: string; slug: string; family: string; abstract: string; symbols: string[] };
/** `on`, when present, names the only parts a registry refusal applies to (§48). */
export type Refusal = { prop: string; why: string; on?: readonly string[] };
export type TokenRow = { name: string; value: string; scopes?: string[] };

export type Data = {
  /** The single home of every fact below, so a reader can go and check rather than trust. */
  sources: Record<string, string>;
  components: ComponentRow[];
  /** slug -> the markdown twin of `/components/<slug>`, byte for byte what the site serves. */
  markdown: Record<string, string>;
  api: Record<string, ApiEntry>;
  /** Axis name -> its legal values. Component and theme axes in one table. */
  axes: Record<string, string[]>;
  /** The named types the generated API prints -> the axis holding that type's values. */
  typeAxis: Record<string, string>;
  /** `data-` plus every axis key: the attributes TSX waves through undeclared, taken from
      the eslint rule that computes them (`src/lint/no-refused-attribute.ts`). */
  refusedAttributes: string[];
  /** The eslint rule's own report for that refusal, with its `{{attribute}}` and `{{axis}}`
      placeholders intact. Carried rather than rewritten: `check_usage` refuses exactly what
      `no-refused-attribute` refuses, so a sentence of its own would be a second answer. */
  refusedAttributeMessage: string;
  /** The refusal sets `refused.ts` declares, each prop carrying the compiler's own sentence. */
  refusalSets: Record<string, Refusal[]>;
  /** Exported symbol -> the refusal sets its props type intersects. */
  symbolRefusals: Record<string, string[]>;
  /** Registry entry name -> the props IT refuses, on top of the universal sets. */
  componentRefusals: Record<string, Refusal[]>;
  /** The layout props Box and its presets take, and the scale each resolves through. */
  layoutProps: Record<string, { scale: string | null }>;
  tokens: TokenRow[];
};

let cached: Data | undefined;

/**
 * TWO PLACES TO LOOK, because this module runs from two. Built, it is `dist/index.js` with the
 * snapshot beside it; under the laws it is `src/data.ts`, one directory up from `dist`. The
 * alternative is a law that reads a different file from the one that ships, which is the thing
 * the drift law exists to prevent.
 */
function snapshotPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const beside = path.join(here, "data.json");
  return existsSync(beside) ? beside : path.join(here, "../dist/data.json");
}

export function data(): Data {
  if (!cached) cached = JSON.parse(readFileSync(snapshotPath(), "utf8")) as Data;
  return cached;
}

/**
 * A symbol to the entry that documents it.
 *
 * A caller writes `<MenuItem>`, and what refuses props on its behalf is the Menu entry — so
 * the parts are in this map beside the roots. Nothing here is a second list: `symbols` is the
 * entry's own name plus the parts the registry already declares for it.
 */
export function entryOf(symbol: string): ComponentRow | undefined {
  for (const row of data().components) if (row.symbols.includes(symbol)) return row;
  return undefined;
}

/** Is this JSX tag one of ours at all? Everything else in a file is the caller's own. */
export const isKookie = (tag: string): boolean =>
  Boolean(data().symbolRefusals[tag]) || Boolean(data().api[tag]) || Boolean(entryOf(tag));

/**
 * Every prop this symbol refuses, with the sentence that names what to write instead.
 *
 * TWO SOURCES, ONE ANSWER, and they are two because they are read by two different things.
 * `refused.ts` is what the compiler prints — the reflex props a model reaches for first — and
 * it is stated per symbol in that symbol's own props type. The registry's refusals are what a
 * person reads on the page, and they are per component. A caller wants both and does not care
 * which file said it.
 */
export function refusalsFor(symbol: string): Refusal[] {
  const snapshot = data();
  const out: Refusal[] = [];
  const seen = new Set<string>();
  const take = (row: Refusal): void => {
    if (seen.has(row.prop)) return;
    seen.add(row.prop);
    out.push(row);
  };
  for (const set of snapshot.symbolRefusals[symbol] ?? []) {
    for (const row of snapshot.refusalSets[set] ?? []) take(row);
  }
  const entry = entryOf(symbol);
  if (entry) {
    // A REGISTRY REFUSAL IS WRITTEN ABOUT A COMPONENT AND REACHES ITS PARTS, so a refusal
    // scoped to one part arrives on all of them: `render` is refused "on Cancel and Action",
    // and the entry carries it, so `<AlertDialogTrigger render>` — the shape the alert's own
    // example ships — was reported as refused outright. The generated API is the type the
    // compiler actually enforces, so a part that DECLARES the prop is a part that takes it,
    // and no sentence written about a sibling may say otherwise. Measured before it was
    // written: fifteen (part, prop) pairs, including `backdrop` on four Shell panes, which
    // §27 added to those panes on the day it refused it on ShellContent alone.
    const declared = new Set((snapshot.api[symbol]?.props ?? []).map((row) => row.name));
    for (const row of snapshot.componentRefusals[entry.name] ?? []) {
      if (symbol !== entry.name && declared.has(row.prop)) continue;
      // A refusal the registry scoped to named parts reaches only those parts.
      if (!refusalReaches(row, symbol)) continue;
      take(row);
    }
  }
  return out;
}

/**
 * Resolves what a caller typed to a component entry: an export name, a part name, a slug, or
 * any of those in the wrong case.
 *
 * It answers with candidates rather than nothing when it misses, because the likeliest reason
 * a name is not found is that the system calls the thing something else — `Toast`, `Alert`,
 * `Banner` are all real questions with real answers here — and a bare "not found" sends the
 * reader to invent one.
 */
export function resolveComponent(query: string): { row: ComponentRow } | { candidates: ComponentRow[] } {
  const rows = data().components;
  const want = query.trim().toLowerCase().replace(/[\s_-]/g, "");
  const exact = rows.find(
    (row) =>
      row.name.toLowerCase() === want ||
      row.slug.replace(/-/g, "") === want ||
      row.symbols.some((symbol) => symbol.toLowerCase() === want),
  );
  if (exact) return { row: exact };
  const near = rows.filter(
    (row) => row.name.toLowerCase().includes(want) || want.includes(row.name.toLowerCase()),
  );
  return { candidates: near.length ? near : rows };
}

/** The legal values of a declared prop, where the system closes it. `undefined` means open. */
export function legalValues(symbol: string, prop: string): string[] | undefined {
  const snapshot = data();
  const declared = snapshot.api[symbol]?.props.find((row) => row.name === prop);
  if (declared) {
    const axis = snapshot.typeAxis[declared.type];
    if (axis) return snapshot.axes[axis];
    // An inline union the generator printed verbatim: `"start" | "center" | "end"`. Taken only
    // when EVERY member is a string literal, so `string | null` stays open rather than being
    // read as a one-value union.
    const members = declared.type.split("|").map((part) => part.trim());
    if (members.length > 1 && members.every((part) => /^"[^"]*"$/.test(part))) {
      return members.map((part) => part.slice(1, -1));
    }
    return undefined;
  }
  // A layout prop arrives from the shared table rather than from the component, so the API
  // does not repeat it. `props.ts` says which scale it resolves through, and the scale is what
  // closes the value.
  const layout = snapshot.layoutProps[prop];
  if (layout?.scale === "space") {
    if (/^m([xytrbl])?$/.test(prop)) return snapshot.axes["marginSpace"];
    if (/^p([xytrbl])?$/.test(prop)) return snapshot.axes["paddingSpace"];
    return snapshot.axes["space"];
  }
  return undefined;
}
