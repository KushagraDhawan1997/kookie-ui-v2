/**
 * REVIEW — the house style as checks over the document (2026-08-20).
 *
 * This is the thing no other builder can have, and the reason is structural rather than
 * clever: a composition rule can only be CHECKED where the vocabulary is closed. "One loud
 * action per surface" is not a lint anyone can write against arbitrary CSS — there is no
 * such thing as loud. Here `emphasis="loud"` is a rung the system defined, a Card is a
 * surface the system named, and the brief that says one focal point per pane is written
 * down in DECISIONS §15 and operationalised in `.claude/skills/composition`. So the check is
 * a walk over a tree whose every node the system already understands.
 *
 * Each rule states three things, and the third is the point: what it found, WHY the system
 * says so (in the system's own words, not a lint's), and — where a fix is unambiguous — a
 * pure function that performs it. A rule with no honest automatic fix offers none; guessing
 * words a person meant to write is how lint tools teach people to ignore them.
 *
 * Deliberately NOT here: anything the tokens already guarantee (contrast, spacing values,
 * type pairings). Those cannot be wrong. What can be wrong is composition, and that is the
 * layer this file speaks to.
 *
 * ── Two invariants the laws hold this file to, both earned by defects ──
 *
 * A FIX MAY ONLY WRITE A VALUE THE AXIS HOLDS. The reviewer is the one surface in this
 * builder that can mint a value: the inspector picks from `componentAxes`, resize walks
 * `sizeStepsFor`, and this file did arithmetic. `gap: String(Number(inner) + 2)` on a
 * document at gap 11 wrote `gap="13"`, which the palette does not have — it left the package
 * as unitless raw CSS, so the fix that promised to open a gap deleted it. Fixes go through
 * `writeProp`, and a law walks every rule's repair and checks every value it writes.
 *
 * A FIX MAY NOT TRADE ONE FINDING FOR ANOTHER. The round-trip law asked whether the finding
 * it was offered for had gone, which is one indirection short: `mixed-control-sizes` could
 * move the majority to the minority and go silent while the row got worse. The law now
 * re-reviews the whole document and refuses any finding the original did not have.
 */

import { componentAxes } from "@kushagradhawan/kookie-ui-react";

import { CATALOG, type PropSchema } from "./catalog";
import {
  findParent,
  removeNode,
  unwrapNode,
  updateProps,
  wrapNodes,
  type BuilderDoc,
  type BuilderNode,
  type PropValue,
} from "./model";
import { RULE_ENTRIES } from "./rules";

export type Severity = "error" | "warning";

export type Finding = {
  /** Stable across re-runs: rule id + node id, so a list does not reshuffle while you read. */
  id: string;
  /** The RULE's id. It used to hold the title, which meant a renamed rule silently kept its
      old finding-id prefix and the panel had two names for one thing. */
  rule: string;
  title: string;
  severity: Severity;
  nodeId: string | null;
  message: string;
  why: string;
  fix?: { title: string; apply: (roots: BuilderNode[]) => BuilderNode[] };
};

export type Rule = {
  id: string;
  title: string;
  severity: Severity;
  /** The brief's own sentence — shown with every finding this rule raises. */
  why: string;
  run: (ctx: RuleContext) => RawFinding[];
};

/** What a rule returns: the rule supplies its own id, title, severity and why. Carrying those
    on every finding was two homes for one fact, and the per-finding copy always won. */
type RawFinding = {
  nodeId: string;
  message: string;
  fix?: { title: string; apply: (roots: BuilderNode[]) => BuilderNode[] };
};

type Entry = { node: BuilderNode; parents: BuilderNode[] };
type RuleContext = { roots: BuilderNode[]; all: Entry[] };

/** The document's own root — the CANVAS since 2026-08-20. Rules whose remedy is "unwrap it"
    or "cut it" cannot speak to it: the canvas is not optional, so a finding against it names
    a fault with no available fix, which is noise rather than review. Both such rules ask
    this, so the exemption is one sentence in one place rather than a condition each rule
    remembers to carry. */
const isCanvas = (e: Entry): boolean => e.parents.length === 0;

const walk = (roots: BuilderNode[]): Entry[] => {
  const out: Entry[] = [];
  const visit = (list: BuilderNode[], parents: BuilderNode[]) => {
    for (const node of list) {
      out.push({ node, parents });
      if (node.children) visit(node.children, [...parents, node]);
    }
  };
  visit(roots, []);
  return out;
};

const str = (v: PropValue | undefined): string | null => (typeof v === "string" ? v : null);

/**
 * The one door a fix writes through. Everything it sets must be a member of the axis the
 * catalog declares for that prop — see the file header for the defect that earned this.
 */
const writeProp = (
  roots: BuilderNode[],
  id: string,
  key: string,
  value: string,
  type: string,
): BuilderNode[] => {
  if (!legalValue(type, key, value)) return roots; // the caller decided not to offer this
  return updateProps(roots, id, { [key]: value });
};

/** Is this a value the catalog's schema for `type.key` actually holds? Exported for the law
    that walks every rule's repair. */
export const legalValue = (type: string, key: string, value: PropValue | undefined): boolean => {
  const schema: PropSchema | undefined = CATALOG[type]?.props[key];
  if (!schema) return false;
  if (value === undefined) return true; // clearing a prop is always legal
  if (schema.kind === "axis") return (componentAxes[schema.axis] as readonly string[]).includes(String(value));
  if (schema.kind === "options") return schema.values.includes(String(value));
  if (schema.kind === "boolean") return typeof value === "boolean";
  if (schema.kind === "number") return typeof value === "number";
  return typeof value === "string";
};

/** A step's neighbour, or null when the scale has no room — the clamp the gap fix needed. */
const stepBy = (axis: keyof typeof componentAxes, value: string, delta: number): string | null => {
  const list = componentAxes[axis] as readonly string[];
  const at = list.indexOf(value);
  const next = at + delta;
  return at === -1 || next < 0 || next >= list.length ? null : list[next]!;
};

/* ── Where a composition is JUDGED ─────────────────────────────────────────────────────── */

/** A surface: something that draws its own pane. The tone budget is scoped to these. */
const SURFACES = new Set(["Card", "DialogContent", "AlertDialogContent", "MenuContent", "SelectContent"]);

/** A LAYER: a thing that covers, so its contents are judged on their own rather than against
    the screen behind them. The distinction matters for the figure budget — §15 says "once per
    screen", and a dialog is its own screen while a Card inside one is not. */
const LAYERS = new Set(["DialogContent", "AlertDialogContent", "MenuContent", "SelectContent"]);

const nearest = (parents: BuilderNode[], set: Set<string>): BuilderNode | null => {
  for (let i = parents.length - 1; i >= 0; i--) if (set.has(parents[i]!.type)) return parents[i]!;
  return null;
};

const surfaceOf = (parents: BuilderNode[]): BuilderNode | null => nearest(parents, SURFACES);
const layerOf = (parents: BuilderNode[]): BuilderNode | null => nearest(parents, LAYERS);
/** The Shell pane a node sits in. RULES.md 8 counts loud actions per pane (2026-11-03). */
const PANES = new Set(["ShellSidebar", "ShellContent", "ShellInspector", "ShellRail", "ShellHeader", "ShellBottom"]);
const paneOf = (parents: BuilderNode[]): BuilderNode | null => nearest(parents, PANES);
/**
 * Which tab a node is behind, per Tabs group it sits inside — `{ tabsId: panelId }`.
 *
 * "Which panel am I in" is not enough, and reading it as enough is a real defect: two loud
 * buttons in two DIFFERENT Tabs groups came out as "different panels", so the rule called them
 * mutually exclusive and fell silent, while on screen both are visible at once. A tab hides a
 * node only from its OWN siblings.
 */
const tabsPath = (parents: BuilderNode[]): Map<string, string> => {
  const path = new Map<string, string>();
  let owner: string | null = null;
  for (const p of parents) {
    if (p.type === "Tabs") owner = p.id;
    else if (p.type === "TabsPanel" && owner) path.set(owner, p.id);
  }
  return path;
};

/** Can these two ever be on screen together? Only one thing separates them: sharing a Tabs
    group and sitting behind different tabs OF IT. */
const bothVisible = (a: Map<string, string>, b: Map<string, string>): boolean => {
  for (const [tabs, panel] of a) {
    const other = b.get(tabs);
    if (other !== undefined && other !== panel) return false;
  }
  return true;
};

/** Which way a layout lays its children out. A Stack is a column by construction; a Flex is
    a row unless it says otherwise, and a per-tier `direction` is read at its base — the
    canvas shows one tier at a time, and that is the tier the eye is judging. */
const axisOf = (n: BuilderNode): "row" | "column" => {
  if (n.type === "Stack") return "column";
  const direction = n.props.direction;
  const base = typeof direction === "object" && direction !== null ? direction.initial : direction;
  return base === "column" ? "column" : "row";
};

const LAYOUTS = new Set(["Stack", "Flex", "Grid"]);
const isLayout = (n: BuilderNode): boolean => LAYOUTS.has(n.type);

/**
 * A GROUP: a layout whose children are content rather than more layouts. The brief's
 * proximity rule is about "within-group versus between-group", and reading it as "every
 * nesting level" is what made it fire on the house intervals themselves — a section at gap 6
 * holding groups at gap 5 is one step apart and correct, because those are two BETWEEN
 * distances, not a within against a between.
 */
const isGroup = (n: BuilderNode): boolean =>
  isLayout(n) && !(n.children ?? []).some((c) => isLayout(c) && str(c.props.gap) !== null);

const label = (n: BuilderNode): string => (n.text?.trim() ? `“${n.text.trim().slice(0, 24)}”` : n.type);

/** The type family's own size prop rides `typeSize`; a control's rides `size`. */
const TYPE_TYPES = new Set(["Text", "Heading", "Blockquote", "Code", "Kbd"]);

/** One rule's words, from the shared list (`rules.json`, 2026-11-02). The screen check
    (`scripts/review-ui`) reads the same list, so a rule both of them enforce has one title,
    one severity and one reason, and a law (`rules.test.ts`) keeps the list and both
    checkers in step. Only the detection lives here. */
type RuleWords = Pick<Rule, "id" | "title" | "severity" | "why">;
const meta = (id: string): RuleWords => {
  const entry = RULE_ENTRIES.find((r) => r.id === id);
  if (!entry?.checkedBy.includes("builder")) throw new Error(`rules.json has no builder rule "${id}"`);
  return { id: entry.id, title: entry.title, severity: entry.severity, why: entry.why };
};

export const RULES: Rule[] = [
  {
    ...meta("one-figure"),
    run: ({ all }) => {
      // `at` is the DOCUMENT-ORDER index, captured here. Sorting by `all.indexOf(copy)`
      // looked equivalent and was dead: these are spread COPIES, so indexOf answered -1 for
      // every one, the comparator was constantly 0 and the sort was a no-op. Document order
      // survived by accident on the plain path and not on the tab path, where the
      // always-visible buttons are prepended — so the rule flagged the EARLIER button and
      // offered to demote the wrong one.
      type Loud = Entry & { layer: string; tabs: Map<string, string>; at: number };
      const loud: Loud[] = [];
      for (const [at, entry] of all.entries()) {
        const { node, parents } = entry;
        if (node.type !== "Button" || str(node.props.emphasis) !== "loud") continue;
        // An alert's Action is loud BY ANATOMY — the component owns the row and there is
        // exactly one (§25). Its grammar refuses a plain Button, so this arm is about a
        // document arriving from elsewhere, not about anything the editor can build.
        if (parents.some((p) => p.type === "AlertDialogContent")) continue;
        // A dialog is its own layer; inside a layer each Shell pane is its own count.
        const layer = `${layerOf(parents)?.id ?? "·screen·"}/${paneOf(parents)?.id ?? "·pane·"}`;
        loud.push({ ...entry, at, layer, tabs: tabsPath(parents) });
      }
      const out: RawFinding[] = [];
      /* A loud action is the second one if ANY loud action earlier in the document can be on
         screen beside it. Asked pairwise rather than by building the sets of what is visible
         together: a set model has to enumerate one choice of tab per Tabs group, and the
         version that skipped the enumeration grouped by panel id alone — so two loud buttons
         in two DIFFERENT Tabs groups read as "different panels", the rule called them
         mutually exclusive, and a screen showing both at once came back clean. */
      for (const layer of new Set(loud.map((l) => l.layer))) {
        const here = loud.filter((l) => l.layer === layer).sort((a, b) => a.at - b.at);
        for (const [i, { node, tabs }] of here.entries()) {
          if (!here.slice(0, i).some((earlier) => bothVisible(earlier.tabs, tabs))) continue;
          out.push({
            nodeId: node.id,
            message: `${label(node)} is a second loud action in this pane.`,
            fix: {
              title: "Make it medium",
              apply: (roots) => writeProp(roots, node.id, "emphasis", "medium", node.type),
            },
          });
        }
      }
      return out;
    },
  },
  {
    ...meta("size-1-retired"),
    run: ({ all }) =>
      all
        .filter(({ node }) => TYPE_TYPES.has(node.type) && str(node.props.size) === "1")
        .map(({ node }) => ({
          nodeId: node.id,
          message: `${label(node)} is set at size 1.`,
          fix: {
            // Only the SIZE. The first spelling also wrote `emphasis: "medium"`, which
            // silently promoted a `quiet` line — §15's exception rung, for something stood
            // down — into "real information said quietly". A size finding may not rewrite
            // what a sentence means.
            title: "Step it to 2",
            apply: (roots) => writeProp(roots, node.id, "size", "2", node.type),
          },
        })),
  },
  {
    ...meta("accessible-name"),
    run: ({ all }) => {
      const needsName = (n: BuilderNode): boolean => {
        if (str(n.props["aria-label"])?.trim()) return false;
        if (["Checkbox", "Switch", "Radio", "RadioGroup", "Slider", "Progress"].includes(n.type)) return true;
        if (["TextField", "TextArea", "SegmentedControl", "TabsList"].includes(n.type)) return true;
        // A button with no text is a glyph with no name.
        if (n.type === "Button") return !n.text?.trim();
        return false;
      };
      // A FieldLabel in the control's own Field (or FieldItem) names it: Base UI wires the two
      // together by id, which is the whole reason Field exists (§28).
      const labelled = (parents: BuilderNode[]): boolean =>
        (nearest(parents, new Set(["Field", "FieldItem"]))?.children ?? []).some(
          (c) => c.type === "FieldLabel",
        );
      return all
        .filter(({ node, parents }) => needsName(node) && !labelled(parents))
        .map(({ node }) => ({
          nodeId: node.id,
          message: `${node.type} has no accessible name.`,
          // No automatic fix on purpose: the name is words nobody but the author knows. The
          // inspector offers the `aria-label` field on every type this rule can flag, which
          // is what makes the finding actionable — it was an error with no remedy until
          // Button, Radio, RadioGroup and TabsList were given one.
        }));
    },
  },
  {
    ...meta("empty-container"),
    run: ({ all }) =>
      all
        // An empty document is a legitimate state, and the canvas cannot be cut.
        .filter((e) => !isCanvas(e))
        .filter(({ node }) => ["Stack", "Flex", "Grid", "Box", "Card"].includes(node.type) && (node.children?.length ?? 0) === 0)
        .map(({ node }) => ({
          nodeId: node.id,
          message: `${node.type} is empty.`,
          fix: { title: "Delete it", apply: (roots) => removeNode(roots, node.id) },
        })),
  },
  {
    ...meta("empty-compound"),
    run: ({ all }) =>
      all
        .filter(
          ({ node }) =>
            ["RadioGroup", "SegmentedControl", "TabsList", "TabsPanel", "MenuContent", "SelectContent", "DialogContent", "AlertDialogContent"].includes(
              node.type,
            ) && (node.children?.length ?? 0) === 0,
        )
        .map(({ node }) => ({
          nodeId: node.id,
          message: `${node.type} holds no parts.`,
          // No fix: deleting it takes the compound's whole point with it, and what belongs
          // inside is the author's.
        })),
  },
  {
    ...meta("single-child-layout"),
    run: ({ all }) =>
      all
        // A canvas holding one root is the most ordinary document there is, and "unwrap it"
        // is not a move available here.
        .filter((e) => !isCanvas(e))
        .filter(({ node }) => {
          if (!isLayout(node)) return false;
          if ((node.children?.length ?? 0) !== 1) return false;
          // The refinement the templates forced: `gap` is the only prop a single child makes
          // inert. Anything else on the box is the box earning its place.
          return Object.keys(node.props).filter((k) => k !== "gap").length === 0;
        })
        .map(({ node }) => ({
          nodeId: node.id,
          message: `${node.type} holds a single ${node.children![0]!.type}.`,
          fix: { title: "Unwrap it", apply: (roots) => unwrapNode(roots, node.id) },
        })),
  },
  {
    ...meta("flat-rhythm"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        if (!isLayout(node)) continue;
        const outer = str(node.props.gap);
        if (!outer) continue;
        for (const child of node.children ?? []) {
          if (!isGroup(child)) continue;
          if (axisOf(node) !== axisOf(child)) continue;
          const inner = str(child.props.gap);
          if (!inner) continue;
          const step = Number(outer) - Number(inner);
          if (Number.isNaN(step) || step >= 2) continue;
          // Open the outer where the scale has room, else tighten the inner. The first
          // spelling did `Number(inner) + 2` with no bound and wrote gap="13" onto a palette
          // that stops at 12 — the value left the package as unitless raw CSS and the gap it
          // promised to open was deleted instead.
          const wider = stepBy("space", inner, 2);
          const tighter = stepBy("space", outer, -2);
          const fix = wider
            ? { title: `Open the outer gap to ${wider}`, node: node.id, key: "gap", value: wider, type: node.type }
            : tighter
              ? { title: `Tighten this group to ${tighter}`, node: child.id, key: "gap", value: tighter, type: child.type }
              : null;
          out.push({
            // The finding points at the CHILD, because that is the group whose spacing reads
            // wrong, and that is also what the panel selects when the fix is applied — even
            // where the repair edits the OUTER group's gap. The eye wants the place the
            // problem was reported, which is the pair; the child is the half of it that is
            // named.
            nodeId: child.id,
            message: `A group at gap ${inner} sits inside one at gap ${outer} — the two read as one.`,
            ...(fix
              ? {
                  fix: {
                    title: fix.title,
                    apply: (roots: BuilderNode[]) => writeProp(roots, fix.node, fix.key, fix.value, fix.type),
                  },
                }
              : {}),
          });
        }
      }
      return out;
    },
  },
  {
    ...meta("heading-space"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        if (!isLayout(node) || axisOf(node) !== "column") continue;
        const outer = str(node.props.gap);
        if (!outer) continue;
        const kids = node.children ?? [];
        for (let i = 0; i < kids.length; i++) {
          const heading = kids[i]!;
          if (heading.type !== "Heading") continue;
          // Only a heading with something on BOTH sides floats. One at the top of its group
          // already has the group's own boundary above it.
          if (i === 0 || i === kids.length - 1) continue;
          const next = kids[i + 1]!;
          // CHANGES 2026-08-26: the wrapper's gap DERIVES from the outer gap; it was pinned at
          // "2". A pinned inner gap is a `flat-rhythm` finding whenever the outer gap is under
          // 4 — and a Stack arrives from the palette at gap 3 — so pressing this fix on the
          // most ordinary column in the builder swapped one warning for another. Two steps
          // under is exactly what `flat-rhythm` asks for, and where the scale has no room
          // there is no fix to offer, the same shape that rule already uses.
          const inner = stepBy("space", outer, -2);
          out.push({
            nodeId: heading.id,
            message: `${label(heading)} sits at the same distance from what is above it and what is below it.`,
            ...(inner
              ? {
                  fix: {
                    title: "Bind it to what follows",
                    // The gesture the templates already use everywhere: the heading and its
                    // first line become one group at a tighter gap, so the space above stays
                    // the section's and the space below becomes the pair's.
                    apply: (roots: BuilderNode[]) => {
                      const wrapper: BuilderNode = {
                        ...CATALOG.Stack!.make(),
                        props: { gap: inner },
                        children: [],
                      };
                      return wrapNodes(roots, [heading.id, next.id], wrapper);
                    },
                  },
                }
              : {}),
          });
        }
      }
      return out;
    },
  },
  {
    ...meta("mixed-control-sizes"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        const kids = (node.children ?? []).filter((c) => CATALOG[c.type]?.family === "Control");
        if (kids.length < 2) continue;
        // Stated sizes only. An unset size means "the component's own default", which lives
        // in the package and not in this table — reading it here would be a second home for
        // it, and a wrong one the day a default moves.
        const sized = kids.filter((k) => str(k.props.size) !== null);
        if (sized.length < 2) continue;
        const tally = new Map<string, number>();
        for (const k of sized) tally.set(str(k.props.size)!, (tally.get(str(k.props.size)!) ?? 0) + 1);
        const majority = [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]![0];
        if (tally.size < 2) continue;
        for (const kid of sized) {
          const size = str(kid.props.size)!;
          if (size === majority) continue;
          out.push({
            nodeId: kid.id,
            message: `${label(kid)} is size ${size} in a row of size ${majority}.`,
            fix: {
              title: `Match it to size ${majority}`,
              apply: (roots) => writeProp(roots, kid.id, "size", majority, kid.type),
            },
          });
        }
      }
      return out;
    },
  },
  {
    ...meta("control-scale"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node, parents } of all) {
        if (CATALOG[node.type]?.family !== "Control") continue;
        const size = str(node.props.size);
        const surface = surfaceOf(parents);
        const pane = surface ? str(surface.props.size) : null;
        if (!size || !pane) continue;
        const gap = Number(pane) - Number(size);
        if (Number.isNaN(gap) || gap < 2) continue;
        out.push({
          nodeId: node.id,
          message: `${label(node)} is size ${size} on a size ${pane} ${surface!.type}.`,
          fix: {
            title: `Match the surface at size ${pane}`,
            apply: (roots) => writeProp(roots, node.id, "size", pane, node.type),
          },
        });
      }
      return out;
    },
  },
  {
    ...meta("tone-as-decoration"),
    run: ({ all }) => {
      const bySurface = new Map<string, { tones: Set<string>; node: BuilderNode }>();
      for (const { node, parents } of all) {
        const tone = str(node.props.tone);
        if (!tone || tone === "neutral" || tone === "accent") continue;
        const surface = surfaceOf(parents);
        const key = surface?.id ?? "·document·";
        const entry = bySurface.get(key) ?? { tones: new Set<string>(), node: surface ?? node };
        entry.tones.add(tone);
        bySurface.set(key, entry);
      }
      return [...bySurface.values()]
        .filter((e) => e.tones.size >= 4)
        .map((e) => ({
          nodeId: e.node.id,
          message: `${e.tones.size} data tones in one place (${[...e.tones].join(", ")}).`,
        }));
    },
  },
  {
    ...meta("heading-ladder"),
    run: ({ all }) =>
      all
        .filter(({ node }) => node.type === "Heading" && Number(str(node.props.size) ?? "6") <= 3)
        .map(({ node }) => ({
          nodeId: node.id,
          message: `${label(node)} is a heading at size ${str(node.props.size)}.`,
          // No fix, and the absence is the finding's honesty: WHICH step this heading wants
          // depends on what it is titling. The first spelling always wrote 6, which turned a
          // page title into a second card title one level up and then went quiet about it.
        })),
  },
  {
    ...meta("eyebrow"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        if (!isLayout(node) || axisOf(node) !== "column") continue;
        const kids = node.children ?? [];
        for (let i = 0; i < kids.length - 1; i++) {
          const above = kids[i]!;
          const heading = kids[i + 1]!;
          if (above.type !== "Text" || heading.type !== "Heading") continue;
          const small = Number(str(above.props.size) ?? "3");
          const big = Number(str(heading.props.size) ?? "6");
          if (!(small < big)) continue;
          out.push({
            nodeId: above.id,
            message: `${label(above)} sits above a heading as an eyebrow.`,
            fix: {
              title: "Delete it",
              // …and dissolve what is left if the deletion makes it inert. A pair wrapped at
              // gap 2 that becomes one heading is a layout stating a rhythm nothing rides,
              // which is another rule's finding — and a repair that trades one complaint for
              // another is a repair nobody trusts.
              apply: (roots) => {
                const without = removeNode(roots, above.id);
                const parent = findParent(without, heading.id);
                const inert =
                  parent &&
                  isLayout(parent) &&
                  (parent.children?.length ?? 0) === 1 &&
                  Object.keys(parent.props).filter((k) => k !== "gap").length === 0;
                return inert ? unwrapNode(without, parent.id) : without;
              },
            },
          });
        }
      }
      return out;
    },
  },
  {
    ...meta("filler-text"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        const fresh = CATALOG[node.type]?.make().text;
        if (!fresh || !node.text) continue;
        if (node.text.trim() !== fresh.trim()) continue;
        out.push({
          nodeId: node.id,
          message: `${node.type} still says “${fresh}”.`,
          // No fix: the words are the author's, and there is nothing to guess.
        });
      }
      return out;
    },
  },
  {
    ...meta("zero-width-container"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node, parents } of all) {
        if (node.type !== "Box" || node.props.container !== true) continue;
        const parent = parents[parents.length - 1];
        if (!parent || !isLayout(parent) || axisOf(parent) !== "row") continue;
        if (str(node.props.flexGrow) || str(node.props.width)) continue;
        out.push({
          nodeId: node.id,
          message: "This Box is measured, sits in a row, and nothing gives it a width.",
          fix: {
            title: "Let the row size it",
            apply: (roots) => writeProp(roots, node.id, "flexGrow", "1", node.type),
          },
        });
      }
      return out;
    },
  },
  {
    ...meta("nested-card"),
    run: ({ all }) =>
      all
        .filter(({ node, parents }) => node.type === "Card" && parents.some((p) => p.type === "Card"))
        .map(({ node }) => ({
          nodeId: node.id,
          message: "This card sits inside another card.",
          // Unwrap rather than retype: the contents belong on the plane that already exists,
          // and lifting them out is the one repair that is right whatever they are. Turning
          // the inner card into a Surface is the OTHER answer and it is a judgment about what
          // the region means, which a fix may not make on the author's behalf.
          fix: { title: "Unwrap it", apply: (roots) => unwrapNode(roots, node.id) },
        })),
  },
  {
    ...meta("orphan-part"),
    run: ({ all }) =>
      all
        .filter(({ node, parents }) => {
          const entry = CATALOG[node.type];
          if (!entry) return false;
          // `requiresAncestor` is the strict version and only four entries carry it; `partOf`
          // is the one every part declares. Keying on the first left 28 parts outside a rule
          // titled "A part needs its compound".
          const needs = entry.requiresAncestor ?? entry.partOf;
          if (!needs) return false;
          return !parents.some((p) => p.type === needs);
        })
        .map(({ node }) => {
          const entry = CATALOG[node.type]!;
          return {
            nodeId: node.id,
            message: `${node.type} sits outside its ${entry.requiresAncestor ?? entry.partOf}.`,
            fix: { title: "Remove it", apply: (roots) => removeNode(roots, node.id) },
          };
        }),
  },

  /* ── From the field (2026-09-14) ────────────────────────────────────────────────────────
     Rules drawn from WCAG, axe-core, GOV.UK, NN/g, Carbon and LukeW, kept only where the tree
     alone can decide them. Each `why` names its source. */

  {
    ...meta("placeholder-as-label"),
    run: ({ all }) =>
      all
        .filter(({ node, parents }) => {
          if (!["TextField", "TextArea"].includes(node.type)) return false;
          if (!str(node.props.placeholder)?.trim()) return false;
          const field = nearest(parents, new Set(["Field", "FieldItem"]));
          if ((field?.children ?? []).some((c) => c.type === "FieldLabel")) return false;
          // A visible line of text directly above it is a label to the eye, even unwired.
          const siblings = parents.at(-1)?.children ?? [];
          const before = siblings[siblings.indexOf(node) - 1];
          return before?.type !== "Text";
        })
        .map(({ node }) => ({
          nodeId: node.id,
          message: `${node.type} says “${str(node.props.placeholder)}” only as a placeholder.`,
        })),
  },
  {
    ...meta("instructions-in-placeholder"),
    run: ({ all }) =>
      all
        .filter(({ node, parents }) => {
          const placeholder = str(node.props.placeholder);
          if (!placeholder || !/\be\.g\.|\bmust\b|\bformat\b|\bDD\b|\bMM\b|\bYYYY\b|characters|at least/i.test(placeholder)) return false;
          const field = nearest(parents, new Set(["Field"]));
          return !(field?.children ?? []).some((c) => c.type === "FieldDescription");
        })
        .map(({ node }) => ({ nodeId: node.id, message: `“${str(node.props.placeholder)}” is an instruction in a placeholder.` })),
  },
  {
    ...meta("label-in-name"),
    run: ({ all }) =>
      all
        .filter(({ node }) => {
          const visible = node.text?.trim().toLowerCase().replace(/\s+/g, " ");
          const name = str(node.props["aria-label"])?.trim().toLowerCase().replace(/\s+/g, " ");
          return !!visible && !!name && !name.includes(visible);
        })
        .map(({ node }) => ({
          nodeId: node.id,
          message: `${label(node)} is announced as “${str(node.props["aria-label"])}”.`,
          fix: {
            title: "Let the text be the name",
            apply: (roots) => updateProps(roots, node.id, { "aria-label": undefined }),
          },
        })),
  },
  {
    ...meta("empty-heading"),
    run: ({ all }) =>
      all
        .filter(({ node }) => ["Heading", "DialogTitle", "SheetTitle", "AlertDialogTitle", "PopoverTitle"].includes(node.type) && !node.text?.trim())
        .map(({ node }) => ({ nodeId: node.id, message: `${node.type} is empty.` })),
  },
  {
    ...meta("single-radio"),
    run: ({ all }) =>
      all
        .filter(({ node }) => node.type === "RadioGroup" && walk(node.children ?? []).filter((e) => e.node.type === "Radio").length === 1)
        .map(({ node }) => ({ nodeId: node.id, message: "This RadioGroup holds a single Radio." })),
  },
  {
    ...meta("radios-in-a-row"),
    run: ({ all }) =>
      all
        .filter(({ node, parents }) => {
          if (!isLayout(node) || axisOf(node) !== "row") return false;
          if (!parents.some((p) => p.type === "RadioGroup")) return false;
          const options = (node.children ?? []).filter(
            (c) => c.type === "Radio" || (c.type === "FieldItem" && (c.children ?? []).some((k) => k.type === "Radio")),
          );
          return options.length > 2;
        })
        .map(({ node }) => ({
          nodeId: node.id,
          message: "Three or more radios share one row.",
          fix: { title: "Stack them", apply: (roots) => writeProp(roots, node.id, "direction", "column", node.type) },
        })),
  },
  {
    ...meta("switch-in-a-form"),
    run: ({ all }) => {
      const scopes = new Set([...SURFACES, "SheetContent", "PopoverContent"]);
      const out: RawFinding[] = [];
      for (const { node, parents } of all) {
        if (node.type !== "Switch") continue;
        const scope = nearest(parents, scopes);
        if (!scope) continue;
        const submit = walk(scope.children ?? []).find(
          (e) => e.node.type === "Button" && SUBMIT.test(e.node.text?.trim() ?? ""),
        );
        if (!submit) continue;
        out.push({ nodeId: node.id, message: `This Switch shares a surface with ${label(submit.node)}.` });
      }
      return out;
    },
  },
  {
    ...meta("tabs-without-panels"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        if (node.type !== "Tabs") continue;
        const inside = walk(node.children ?? []).map((e) => e.node);
        const tabs = inside.filter((n) => n.type === "TabsTab");
        const panels = inside.filter((n) => n.type === "TabsPanel");
        const panelValues = new Set(panels.map((p) => str(p.props.value)));
        const tabValues = new Set(tabs.map((t) => str(t.props.value)));
        for (const t of tabs) {
          if (!panelValues.has(str(t.props.value))) out.push({ nodeId: t.id, message: `${label(t)} has no panel.` });
        }
        for (const p of panels) {
          if (!tabValues.has(str(p.props.value))) out.push({ nodeId: p.id, message: `No tab opens the panel “${str(p.props.value)}”.` });
        }
      }
      return out;
    },
  },
  {
    ...meta("single-tab"),
    run: ({ all }) =>
      all
        .filter(({ node }) => node.type === "TabsList" && (node.children ?? []).filter((c) => c.type === "TabsTab").length === 1)
        .map(({ node }) => ({ nodeId: node.id, message: "This tab list holds one tab." })),
  },
  {
    ...meta("too-many-choices"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        const kids = node.children ?? [];
        const count = (type: string) => kids.filter((c) => c.type === type).length;
        if (node.type === "TabsList" && count("TabsTab") > 7) out.push({ nodeId: node.id, message: `${count("TabsTab")} tabs in one list.` });
        if (node.type === "SegmentedControl" && count("SegmentedItem") > 5)
          out.push({ nodeId: node.id, message: `${count("SegmentedItem")} segments in one control.` });
        if (node.type === "MenuContent" && count("MenuItem") > 9 && !kids.some((c) => ["MenuGroup", "Separator"].includes(c.type)))
          out.push({ nodeId: node.id, message: `${count("MenuItem")} menu items with no grouping.` });
      }
      return out;
    },
  },
  {
    ...meta("table-headers"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        if (node.type !== "Table") continue;
        const inside = walk(node.children ?? []).map((e) => e.node);
        const heads = inside.filter((n) => n.type === "TableHead");
        if (!heads.length) out.push({ nodeId: node.id, message: "This table has no header cells." });
        for (const h of heads) if (!h.text?.trim()) out.push({ nodeId: h.id, message: "This header cell is empty." });
      }
      return out;
    },
  },
  {
    ...meta("breadcrumb-current-linked"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        if (node.type !== "Breadcrumb") continue;
        const last = (node.children ?? []).at(-1);
        const link = last?.children?.find((c) => c.type === "BreadcrumbLink");
        if (link) out.push({ nodeId: link.id, message: `${label(link)} is the current page and still a link.` });
      }
      return out;
    },
  },
  {
    ...meta("vague-action"),
    run: ({ all }) =>
      all
        .filter(({ node }) => {
          const words = node.text?.trim() ?? "";
          if (["Button", "ToolbarButton", "AlertDialogAction", "AlertDialogCancel"].includes(node.type)) return VAGUE_ACTION.test(words);
          if (["Link", "BreadcrumbLink"].includes(node.type)) return VAGUE_LINK.test(words);
          return false;
        })
        .map(({ node }) => ({ nodeId: node.id, message: `${label(node)} does not say what happens.` })),
  },
  {
    ...meta("long-action"),
    run: ({ all }) =>
      all
        .filter(({ node }) => {
          if (!["Button", "ToolbarButton", "AlertDialogAction", "AlertDialogCancel"].includes(node.type)) return false;
          const words = node.text?.trim() ?? "";
          return words.split(/\s+/).length > 4 || /\.$/.test(words);
        })
        .map(({ node }) => ({ nodeId: node.id, message: `${label(node)} is a sentence, not an action.` })),
  },
  {
    ...meta("way-back-as-loud"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        const buttons = (node.children ?? []).filter((c) => c.type === "Button");
        const forward = buttons.filter((b) => SUBMIT.test(b.text?.trim() ?? ""));
        if (!forward.length) continue;
        const loudest = Math.max(...forward.map(rank));
        for (const back of buttons.filter((b) => BACK.test(b.text?.trim() ?? ""))) {
          if (rank(back) < loudest) continue;
          out.push({
            nodeId: back.id,
            message: `${label(back)} is as loud as the action it backs out of.`,
            ...(loudest > 0
              ? { fix: { title: "Make it quiet", apply: (roots: BuilderNode[]) => writeProp(roots, back.id, "emphasis", "quiet", back.type) } }
              : {}),
          });
        }
      }
      return out;
    },
  },
  {
    ...meta("reset-beside-submit"),
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        const buttons = (node.children ?? []).filter((c) => c.type === "Button");
        if (!buttons.some((b) => SUBMIT.test(b.text?.trim() ?? ""))) continue;
        for (const b of buttons) {
          if (!/^(reset|clear|clear form|clear all|start over)$/i.test(b.text?.trim() ?? "")) continue;
          out.push({ nodeId: b.id, message: `${label(b)} sits beside the action that submits.` });
        }
      }
      return out;
    },
  },
  {
    ...meta("negative-option"),
    run: ({ all }) =>
      all
        .filter(({ node, parents }) => {
          if (node.type !== "FieldLabel") return false;
          const item = parents.at(-1);
          if (item?.type !== "FieldItem" || !(item.children ?? []).some((c) => ["Checkbox", "Switch"].includes(c.type))) return false;
          return /^(don['’]t|do not|never|disable|turn off|stop)\b/i.test(node.text?.trim() ?? "");
        })
        .map(({ node }) => ({ nodeId: node.id, message: `${label(node)} is phrased as a negative.` })),
  },
  {
    ...meta("generic-error"),
    run: ({ all }) =>
      all
        .filter(
          ({ node }) =>
            node.type === "FieldError" &&
            /^(invalid|error|required|invalid input|invalid value|this field is required|wrong)\.?$/i.test(node.text?.trim() ?? ""),
        )
        .map(({ node }) => ({ nodeId: node.id, message: `${label(node)} does not say how to fix it.` })),
  },
  {
    ...meta("picture-without-alt"),
    run: ({ all }) =>
      all
        .filter(({ node }) => node.type === "Avatar" && !!str(node.props.src)?.trim() && !str(node.props.alt)?.trim())
        .map(({ node }) => ({ nodeId: node.id, message: "This Avatar has a photo and no alt text." })),
  },
];

/** Words that finish a task, and words that back out of one. Shared by the action rules so
    "submit-like" means one thing across all of them. */
const SUBMIT = /^(save|submit|continue|apply|update|create|send|publish|confirm|done|next|sign in|sign up|log in)\b/i;
const BACK = /^(cancel|back|close|discard|not now|dismiss)\b/i;
const VAGUE_ACTION = /^(ok|okay|yes|no|submit|confirm|go|click here|accept)$/i;
const VAGUE_LINK = /^(click here|here|learn more|read more|more|this|link|this link)$/i;

/** Emphasis as a number; a Button that states none rests at medium. */
const rank = (n: BuilderNode): number => ({ quiet: 0, medium: 1, loud: 2 })[str(n.props.emphasis) ?? "medium"] ?? 1;

/** Run every rule, newest concern first: errors before warnings, document order within. */
export const reviewDocument = (doc: BuilderDoc): Finding[] => {
  const ctx: RuleContext = { roots: doc.roots, all: walk(doc.roots) };
  const order = new Map(ctx.all.map(({ node }, i) => [node.id, i]));
  const findings: Finding[] = RULES.flatMap((rule) =>
    rule.run(ctx).map((f) => ({
      id: `${rule.id}:${f.nodeId}`,
      rule: rule.id,
      title: rule.title,
      severity: rule.severity,
      nodeId: f.nodeId,
      message: f.message,
      why: rule.why,
      ...(f.fix ? { fix: f.fix } : {}),
    })),
  );
  return findings.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "error" ? -1 : 1;
    return (order.get(a.nodeId ?? "") ?? 0) - (order.get(b.nodeId ?? "") ?? 0);
  });
};

/**
 * Which repair a click actually applies (2026-08-20).
 *
 * The panel renders findings from the DEFERRED document, so what it shows can be a render
 * behind the tree, and clicking one must be checked against the tree it will edit. The first
 * guard asked whether the finding's id was still there — but an id is `rule:nodeId`, so it
 * only sees a finding that VANISHED. Several repairs bake a computed value into their closure
 * (`mixed-control-sizes` its majority, `control-scale` its pane, `differentiated-rhythm` a
 * stepped gap and a different node), and those move while the id stands still: a button 3
 * among siblings at 2 offers "Match it to size 2"; change the siblings to 4 and the stale
 * closure still writes 2 — the value the live reviewer explicitly rejects — leaving its own
 * finding standing, which is this file's own "a fix may not trade one finding for another"
 * broken on the one path the round-trip law does not walk.
 *
 * So the id is how the finding is FOUND, and the live one is what is applied.
 */
export const liveFix = (doc: BuilderDoc, id: string): Finding | undefined =>
  reviewDocument(doc).find((f) => f.id === id && f.fix);

/** For the law: the parent chain a rule sees, exposed so a test can build one cheaply. */
export const parentsOf = (roots: BuilderNode[], id: string): BuilderNode[] => {
  const chain: BuilderNode[] = [];
  let cursor = findParent(roots, id);
  while (cursor) {
    chain.unshift(cursor);
    cursor = findParent(roots, cursor.id);
  }
  return chain;
};
