/**
 * The knobs a component page offers, and the transform that keeps its code honest (2026-08-30,
 * Kushagra: "we need more controls for preview… expose properties that each specimen shows").
 *
 * WHERE THE CONTROLS COME FROM: the builder's own catalog. `catalog.ts` already declares every
 * component's props as machine-readable schemas — `size` as an axis, `backdrop` as a boolean,
 * option lists with their values — because the builder's inspector generates itself from them.
 * A second table here would be a second home for one fact, and the two would part company the
 * first time an axis moved. So this file DERIVES, and what it adds is the one thing the builder
 * does not need: which of those props are worth putting in front of a reader.
 *
 * ONE KIND THE CATALOG CANNOT DESCRIBE: a SLOT (2026-08-31, Kushagra, on the Avatar page:
 * "why is badge on and off not a toggle in the first place, you are showing me avatar state by
 * default with a badge, and I cannot customise it from this very page"). `badge` takes a node,
 * not a value, so no schema holds it and no placeholder can stand for it — the code either has
 * a `<Badge>` in it or it does not. The EXAMPLE spells the node once, as the ternary
 * `badge={badge ? <Badge>3</Badge> : undefined}`, and the knob decides presence: on, the shown
 * source carries the node exactly as written; off, the line and any import only it used are
 * gone. That is the same promise the other kinds make — what is shown is what you would write.
 *
 * NOT EVERY PROP IS A CONTROL. The builder's inspector exists to build a screen, so it offers
 * everything a node can carry; a docs page exists to explain ONE component, so it offers the
 * axes that component is about. `children`, handlers, ids and layout seats are not knobs — they
 * are the example's own content — and a page with eleven sliders teaches less than one with
 * two.
 *
 * THE CODE STAYS TRUE. A control that moved the specimen while the source below it kept saying
 * `size="2"` would be the docs contradicting themselves in the one place a reader is most
 * likely to copy from. `inlineControls` rewrites the source from the live values, so what is
 * shown is what the reader would write to get what they are looking at.
 */
import { CATALOG } from "../builder/catalog";
import { componentAxes } from "@kookie-ui/react";

/** A knob, resolved: what to call it, what it can be, and what the example starts at. */
export type Control =
  | { name: string; kind: "options"; values: readonly string[]; initial: string }
  | { name: string; kind: "boolean"; initial: boolean }
  /** A node the example places or withholds. Its source lives in the example's own ternary. */
  | { name: string; kind: "slot"; initial: boolean };

export type ControlValues = Record<string, string | boolean>;

/**
 * The props worth a knob, per component.
 *
 * Written out rather than derived from the schemas, because "is this prop what the component is
 * ABOUT" is a judgment and the schema cannot hold it: `size` is the point of a Switch page and
 * noise on a Separator, and both declare it identically. Deriving would give every page every
 * prop, which is the builder's job and not this one's.
 *
 * A slug missing here gets no controls, which is the honest default: a component page is a page
 * before it is a playground, and the specimen still reads without a single knob. Nine pages are
 * missing on purpose (2026-08-31, and each for a stated reason rather than by omission):
 * Composer, Tree, NavTree, ScrollArea and Shell are not in the builder's catalog, so there is no
 * schema to derive a knob from; Progress, Spinner and Tooltip declare no axis at all; and
 * Separator's one axis — `orientation` — changes the layout AROUND the separator, which an
 * example can only express with a branch, and the convention forbids a control's identifier
 * from appearing anywhere but `name={name}`.
 *
 * WHERE A SWEEP ALREADY SPENDS AN AXIS, THE KNOB SET IS THE REST OF THEM. Several specimens
 * exist to compare a ladder — Text sweeps emphasis, Chip sweeps tone, Heading shows two steps —
 * and a knob for the axis being swept would flatten the thing the page is showing. So those
 * pages offer every axis the sweep does not use, and the sweep stays the specimen.
 */
export const OFFERED: Record<string, readonly string[]> = {
  accordion: ["size", "multiple"],
  "alert-dialog": ["size"],
  avatar: ["size", "backdrop", "badge"],
  "avatar-group": ["size", "backdrop"],
  badge: ["size"],
  blockquote: ["size", "emphasis", "tone"],
  breadcrumb: ["size"],
  box: ["p"],
  button: ["size", "tone", "emphasis", "bordered", "loading", "backdrop"],
  card: ["size", "backdrop"],
  checkbox: ["size"],
  chip: ["size", "weight", "emphasis", "backdrop"],
  code: ["weight", "tone"],
  dialog: ["size"],
  field: ["size"],
  flex: ["gap", "direction", "align", "justify"],
  grid: ["columns", "gap"],
  heading: ["weight", "tone"],
  kbd: ["weight", "tone"],
  link: ["weight", "tone"],
  menu: ["size"],
  notice: ["size", "tone", "backdrop"],
  popover: ["size"],
  radio: ["size"],
  "radio-group": ["size"],
  row: ["size"],
  select: ["size"],
  slider: ["size"],
  "segmented-control": ["size", "backdrop"],
  stack: ["gap", "align"],
  surface: ["size"],
  switch: ["size"],
  table: ["size"],
  tabs: ["size"],
  text: ["size", "weight", "tone"],
  "text-area": ["size", "backdrop"],
  "text-field": ["size", "backdrop"],
  // NO THEME KNOBS, and the reason is a package gap rather than a judgment (2026-08-31).
  // Measured: the catalog derives Theme's option lists from the package's `themeAxes`, which
  // is exported from `theme/theme.tsx` — a "use client" module. A Server Component importing a
  // value from one gets a client reference, not the value, so `themeAxes.density` is
  // `undefined` here and every Theme prop resolves to an options schema with no options. Every
  // other page works because its values come from `componentAxes`, which is not in a client
  // module. Restating the lists would fix the page and break the one-home rule the catalog
  // exists to keep, so this waits on `themeAxes` moving to a server-reachable home.
  toggle: ["size", "tone", "bordered", "backdrop"],
};

/** The catalog's component key for a docs slug. Most are the pascal case of the slug. */
const CATALOG_KEY: Record<string, string> = {
  breadcrumb: "Breadcrumb",
  accordion: "Accordion",
  "alert-dialog": "AlertDialog",
  avatar: "Avatar",
  // The AVATARS' schemas, on Radio's precedent one entry down (2026-09-05, Kushagra: "sure
  // lets pass to all"). `backdrop` is not a group prop and must not become one — the group is
  // a line of text with no words in it, not a pane — so the knob writes the material onto
  // every face inside, and the schema that describes it is the face's. `size` is declared
  // identically on both (the same `TypeSize` axis), so nothing about that knob changes by
  // deriving it here; what the value lands on is still the group, which is the example's
  // business and never this table's.
  "avatar-group": "Avatar",
  badge: "Badge",
  blockquote: "Blockquote",
  box: "Box",
  button: "Button",
  card: "Card",
  checkbox: "Checkbox",
  chip: "Chip",
  code: "Code",
  dialog: "Dialog",
  field: "Field",
  flex: "Flex",
  grid: "Grid",
  heading: "Heading",
  kbd: "Kbd",
  link: "Link",
  menu: "Menu",
  notice: "Notice",
  popover: "Popover",
  // The knob is the RADIOS' size, so the schema that describes it is Radio's. A group has no
  // size of its own — it is a wrapper — and the page is about the group.
  radio: "Radio",
  "radio-group": "Radio",
  row: "Row",
  select: "Select",
  slider: "Slider",
  "segmented-control": "SegmentedControl",
  stack: "Stack",
  surface: "Surface",
  switch: "Switch",
  table: "Table",
  // A tab bar takes its index on the LIST, which is the element that rides the height ladder.
  tabs: "TabsList",
  text: "Text",
  "text-area": "TextArea",
  "text-field": "TextField",
  toggle: "Toggle",
};

/**
 * The knobs for one page, in the order they are offered.
 *
 * Values come from the package's own axis lists (`componentAxes`) through the schema, so a
 * widened axis reaches these controls the day it ships and cannot be listed here as a stale
 * copy. The initial value is the EXAMPLE's, read from its source rather than assumed — see
 * `initialFromSource`.
 */
/**
 * The catalog entry a slug's knobs are derived from.
 *
 * Exported for the laws, which need to ask what a page COULD offer — `controlsFor` only answers
 * what it DOES. One lookup rather than a second copy of the mapping.
 */
export const catalogEntryFor = (slug: string) =>
  CATALOG[CATALOG_KEY[slug] as keyof typeof CATALOG] as { props: Record<string, unknown> } | undefined;

export function controlsFor(slug: string, source: string): Control[] {
  const offered = OFFERED[slug];
  const key = CATALOG_KEY[slug];
  if (!offered || !key) return [];
  const entry = CATALOG[key as keyof typeof CATALOG];
  if (!entry) return [];

  const out: Control[] = [];
  for (const name of offered) {
    const schema = (entry.props as Record<string, { kind: string; axis?: string; values?: readonly string[] }>)[name];
    if (!schema) {
      // Not a catalog prop: a slot, if the example spells one. Anything else offered here is a
      // typo, and it gets no knob rather than a knob that moves nothing.
      if (slotNode(source, name) !== undefined) {
        out.push({ name, kind: "slot", initial: initialFromSource(source, name) !== "false" });
      }
      continue;
    }
    if (schema.kind === "axis" && schema.axis) {
      const values = componentAxes[schema.axis as keyof typeof componentAxes] as readonly string[];
      const initial = initialFromSource(source, name) ?? values[0]!;
      out.push({ name, kind: "options", values, initial: String(initial) });
    } else if (schema.kind === "options" && schema.values) {
      const initial = initialFromSource(source, name) ?? schema.values[0]!;
      out.push({ name, kind: "options", values: schema.values, initial: String(initial) });
    } else if (schema.kind === "boolean") {
      out.push({ name, kind: "boolean", initial: initialFromSource(source, name) === "true" });
    }
  }
  return out;
}

/**
 * What the example file starts a control at, read off its own signature.
 *
 * The default lives in the file — `{ size = "2" }` — because the file has to render without a
 * page around it (the blocks laws mount these components directly), and a default stated twice
 * is a default that will disagree with itself.
 */
const initialFromSource = (source: string, name: string): string | undefined => {
  const match = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`).exec(signature(source));
  if (match) return match[1];
  const bool = new RegExp(`\\b${name}\\s*=\\s*(true|false)\\b`).exec(signature(source));
  return bool?.[1];
};

/** The parameter list of `export default function Example(...)`, or "" if it takes none. */
const signature = (source: string): string => {
  const start = source.indexOf("export default function Example(");
  if (start < 0) return "";
  const open = source.indexOf("(", start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "(") depth++;
    else if (source[i] === ")") {
      depth--;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  return "";
};

/** The placeholder a control's value wears while the source is tokenized. See `inlineControls`. */
export const sentinel = (name: string) => `__KD_${name.toUpperCase()}__`;

/**
 * The node a slot knob places, read off the example's own ternary — `name={name ? <node> :
 * undefined}` — or `undefined` when the example spells no such slot.
 *
 * The whole attribute must sit on its own line (law-checked), because "off" removes a LINE:
 * an attribute deleted out of the middle of a line would leave the line's spacing to a regex,
 * and the copied code is the one place a stray double space would be noticed.
 */
const SLOT = (name: string) => new RegExp(`\\n([ \\t]*)${name}=\\{${name} \\? (.+?) : undefined\\}(?=\\n)`);

export const slotNode = (source: string, name: string): string | undefined => SLOT(name).exec(source)?.[2];

/** Which slots are on, for one set of values. */
export type SlotState = Record<string, boolean>;

/** The slot half of a set of values, as the key a tokenized variant is stored under. */
export const slotKey = (controls: readonly Control[], values: ControlValues): string =>
  controls
    .filter((c) => c.kind === "slot")
    .map((c) => `${c.name}=${values[c.name] === true ? "on" : "off"}`)
    .join(" ");

/**
 * Every combination of slot states a page can be in — each is tokenized ONCE on the server.
 *
 * Presence is not a value, so a sentinel cannot carry it: the source with a slot on and off
 * differs by a whole line and often by an import, and only the highlighter can colour a
 * `<Badge>` that was not there before. Two to the number of slots, which is two on the one page
 * that has one; a page with none has exactly one variant, which is the page it had before.
 */
export const slotStates = (controls: readonly Control[]): SlotState[] => {
  const slots = controls.filter((c) => c.kind === "slot");
  return slots.reduce<SlotState[]>(
    (states, slot) => states.flatMap((state) => [{ ...state, [slot.name]: true }, { ...state, [slot.name]: false }]),
    [{}],
  );
};

/**
 * The source as a reader should copy it: no parameters, every control's value written in.
 *
 * WHY IT IS A TRANSFORM AND NOT A SECOND FILE. The example must be a real component that takes
 * props, or a control has nothing to move; a reader must see a file that states its values, or
 * the code is not the thing they would write. One of those is the source of truth and the other
 * is derived, and deriving the reader's version keeps the running one honest — the opposite
 * direction would let the shown code drift from what renders.
 *
 * The convention it depends on is narrow and law-checked: a controllable prop appears in the
 * signature as `name = <default>` and in the body only as `name={name}`. Anything else and the
 * transform leaves a dangling identifier, which the law catches by looking for one.
 *
 * SENTINELS, not final values, because the caller tokenizes ONCE. Every control change would
 * otherwise mean running Shiki again — server work, on a page that has already been sent. The
 * placeholder survives tokenizing as a single token, so the client swaps that token's text and
 * the colouring, which is a property of the syntax rather than of the value, stays right.
 */
export function inlineControls(source: string, controls: readonly Control[], slots: SlotState = {}): string {
  let out = source;
  const params = signature(out);
  if (params) out = out.replace(`(${params})`, "()");

  for (const control of controls) {
    if (control.kind === "slot") {
      // On: the node exactly as the example wrote it. Off: the line goes, and
      // `dropUnusedImports` below takes the import that only it referred to.
      const on = slots[control.name] ?? control.initial;
      out = out.replace(SLOT(control.name), on ? `\n$1${control.name}={$2}` : "");
      continue;
    }
    const token = sentinel(control.name);
    // `name={name}` is the only spelling the convention allows, so this is exact rather than
    // hopeful. A boolean keeps its braces — `backdrop={false}` is legal, readable, and states
    // the knob even when it is off, which an omitted attribute cannot do.
    //
    // EVERY OCCURRENCE (2026-08-31). Without the `g` this replaced the FIRST one only, which
    // silently made "a controlled prop is applied to exactly one element" a rule of the
    // mechanism — with no reason behind it and nothing announcing it. An example that sweeps a
    // ladder applies one axis to several elements, and every page whose specimen does that was
    // unreachable: the second `size={size}` survived as an identifier the shown file no longer
    // declares. The convention is about the SPELLING, never about the count.
    out = out.replace(
      new RegExp(`\\b${control.name}=\\{${control.name}\\}`, "g"),
      control.kind === "boolean" ? `${control.name}={${token}}` : `${control.name}="${token}"`,
    );
  }

  return dropUnusedImports(out);
}

/**
 * Imports the transform just orphaned.
 *
 * Removing the parameter list takes its type annotation with it, so `import type { Size }`
 * becomes an import of something nothing mentions — which would be the one line in the shown
 * file that does not compile in the reader's editor. Counted by identifier rather than parsed:
 * an unreferenced specifier is one whose name appears nowhere below the import block.
 */
function dropUnusedImports(source: string): string {
  const lines = source.split("\n");
  const importEnd = lines.findIndex((line, i) => i > 0 && line.trim() === "" && lines.slice(0, i).some((l) => l.startsWith("import")));
  const body = lines.slice(importEnd < 0 ? 0 : importEnd).join("\n");

  return lines
    .map((line, i) => {
      if (importEnd >= 0 && i >= importEnd) return line;
      const named = /^import\s+(type\s+)?\{([^}]*)\}\s+from\s+(.*)$/.exec(line);
      if (!named) return line;
      const kept = named[2]!
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .filter((part) => {
          const identifier = part.replace(/^type\s+/, "").split(/\s+as\s+/).pop()!.trim();
          return new RegExp(`\\b${identifier}\\b`).test(body);
        });
      if (kept.length === 0) return null;
      return `import ${named[1] ?? ""}{ ${kept.join(", ")} } from ${named[3]}`;
    })
    .filter((line): line is string => line !== null)
    .join("\n");
}
