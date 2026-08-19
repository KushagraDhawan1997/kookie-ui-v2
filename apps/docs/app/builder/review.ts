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

import { componentAxes } from "@kookie-ui/react";

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
/** The tab panel a node sits in, if any — two nodes in DIFFERENT panels are never on screen
    together, so they never compete for anything. */
const panelOf = (parents: BuilderNode[]): BuilderNode | null => nearest(parents, new Set(["TabsPanel"]));

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

export const RULES: Rule[] = [
  {
    id: "one-figure",
    title: "One focal action per screen",
    severity: "warning",
    why:
      "Boldness is spent exactly once. Two loud actions on one screen means neither is the point — the second one is medium, and the composition still says which is which (§15, figure/ground). A dialog or a menu is its own screen; two tab panels are never on screen together.",
    run: ({ all }) => {
      type Loud = Entry & { layer: string; panel: string | null };
      const loud: Loud[] = [];
      for (const entry of all) {
        const { node, parents } = entry;
        if (node.type !== "Button" || str(node.props.emphasis) !== "loud") continue;
        // An alert's Action is loud BY ANATOMY — the component owns the row and there is
        // exactly one (§25). Its grammar refuses a plain Button, so this arm is about a
        // document arriving from elsewhere, not about anything the editor can build.
        if (parents.some((p) => p.type === "AlertDialogContent")) continue;
        loud.push({ ...entry, layer: layerOf(parents)?.id ?? "·screen·", panel: panelOf(parents)?.id ?? null });
      }
      const out: RawFinding[] = [];
      const flagged = new Set<string>();
      for (const layer of new Set(loud.map((l) => l.layer))) {
        const here = loud.filter((l) => l.layer === layer);
        const always = here.filter((l) => l.panel === null);
        const panels = new Set(here.filter((l) => l.panel !== null).map((l) => l.panel!));
        // Each panel competes with the always-visible ones and with nobody else. A layer with
        // no tabs runs this once with the empty panel set.
        const sets = panels.size === 0 ? [always] : [...panels].map((p) => [...always, ...here.filter((l) => l.panel === p)]);
        for (const set of sets) {
          if (set.length < 2) continue;
          const ordered = set.slice().sort((a, b) => all.indexOf(a) - all.indexOf(b));
          // The FIRST keeps the budget; every later one is the finding.
          for (const { node } of ordered.slice(1)) {
            if (flagged.has(node.id)) continue;
            flagged.add(node.id);
            out.push({
              nodeId: node.id,
              message: `${label(node)} is a second loud action on this screen.`,
              fix: {
                title: "Make it medium",
                apply: (roots) => writeProp(roots, node.id, "emphasis", "medium", node.type),
              },
            });
          }
        }
      }
      return out;
    },
  },
  {
    id: "size-1-retired",
    title: "size 1 is retired from composed surfaces",
    severity: "warning",
    why:
      "12px is for genuinely marginal text. “Matters less” is what the muted and faint ink roles say at a readable size — shrinking it says it twice and costs legibility (§15, hierarchy).",
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
    id: "accessible-name",
    title: "Every control states its name",
    severity: "error",
    why:
      "A control the eye reads from its glyph is a control a screen reader cannot read at all. The mark family refuses children on purpose — the label is a sibling — so the accessible name has to be stated (WCAG 4.1.2).",
    run: ({ all }) => {
      const needsName = (n: BuilderNode): boolean => {
        if (str(n.props["aria-label"])?.trim()) return false;
        if (["Checkbox", "Switch", "Radio", "RadioGroup", "Slider", "Progress"].includes(n.type)) return true;
        if (["TextField", "TextArea", "SegmentedControl", "TabsList"].includes(n.type)) return true;
        // A button with no text is a glyph with no name.
        if (n.type === "Button") return !n.text?.trim();
        return false;
      };
      return all
        .filter(({ node }) => needsName(node))
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
    id: "empty-container",
    title: "An empty container draws nothing",
    severity: "warning",
    why:
      "A layout with nothing in it still takes its padding and its place in the rhythm — it reads as a mistake to the eye and as noise to the export. Fill it or cut it (§15, emphasis by subtraction).",
    run: ({ all }) =>
      all
        .filter(({ node }) => ["Stack", "Flex", "Grid", "Box", "Card"].includes(node.type) && (node.children?.length ?? 0) === 0)
        .map(({ node }) => ({
          nodeId: node.id,
          message: `${node.type} is empty.`,
          fix: { title: "Delete it", apply: (roots) => removeNode(roots, node.id) },
        })),
  },
  {
    id: "empty-compound",
    title: "A compound with no parts is a broken control",
    severity: "error",
    why:
      "An empty layout is untidy; an empty compound is broken. A choice control with no choices, a tab that leads nowhere, a dialog with no content — each renders as a control the eye can see and nobody can use.",
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
    id: "single-child-layout",
    title: "A layout around one thing is not a layout",
    severity: "warning",
    why:
      "Gap needs two things to sit between, so a layout holding one child whose only word is `gap` states a rhythm nothing rides. A layout that also ALIGNS, JUSTIFIES or PADS is doing real work with one child — right-aligning a lone Save button is a composition, not an accident — and is left alone.",
    run: ({ all }) =>
      all
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
    id: "flat-rhythm",
    title: "Distance is relationship",
    severity: "warning",
    why:
      "Things that belong together sit closer than things that do not, and the WITHIN-group distance must be at least two steps under the BETWEEN-group one or the eye reads one undifferentiated column (§15, proximity). Only distances on the same axis compete — a row's internal gap and the column rhythm around it are not measured against each other by any eye — and only a group against the rhythm it sits in: a section at gap 6 holding groups at gap 5 is two BETWEEN distances, which is the house interval, not a fault.",
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
            // wrong; the fix may edit either end, so the panel selects what the fix touched.
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
    id: "heading-space",
    title: "Space around a heading is asymmetric",
    severity: "warning",
    why:
      "A heading belongs to what FOLLOWS it: generous above, tight below, roughly 3-4× one against the other. The common failure is one uniform gap, which leaves the heading floating between two blocks and belonging to neither (§15, proximity).",
    run: ({ all }) => {
      const out: RawFinding[] = [];
      for (const { node } of all) {
        if (!isLayout(node) || axisOf(node) !== "column") continue;
        if (!str(node.props.gap)) continue;
        const kids = node.children ?? [];
        for (let i = 0; i < kids.length; i++) {
          const heading = kids[i]!;
          if (heading.type !== "Heading") continue;
          // Only a heading with something on BOTH sides floats. One at the top of its group
          // already has the group's own boundary above it.
          if (i === 0 || i === kids.length - 1) continue;
          const next = kids[i + 1]!;
          out.push({
            nodeId: heading.id,
            message: `${label(heading)} sits at the same distance from what is above it and what is below it.`,
            fix: {
              title: "Bind it to what follows",
              // The gesture the templates already use everywhere: the heading and its first
              // line become one group at a tighter gap, so the space above stays the
              // section's and the space below becomes the pair's.
              apply: (roots) => {
                const wrapper: BuilderNode = { ...CATALOG.Stack!.make(), props: { gap: "2" }, children: [] };
                return wrapNodes(roots, [heading.id, next.id], wrapper);
              },
            },
          });
        }
      }
      return out;
    },
  },
  {
    id: "mixed-control-sizes",
    title: "Same role, same treatment",
    severity: "warning",
    why:
      "Controls sitting in one row are one role, so they take one size: two spellings of one role is entropy the reader pays for (§15, similarity). The reference is what MOST of the row says — matching the majority to whichever control happens to be first is how a fix makes a row worse.",
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
    id: "control-scale",
    title: "A control matches the surface it sits on",
    severity: "warning",
    why:
      "A size-3 dialog holds size-3 fields and buttons. A control two rungs under its container reads as a mistake rather than as modesty (§15, proportion).",
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
    id: "tone-as-decoration",
    title: "Tone is vocabulary, not decoration",
    severity: "warning",
    why:
      "The ten families are colour-as-data — destructive, success, warning mean something. Four or more of them on one surface is a palette being enjoyed rather than a meaning being said (§7, §15 harmony). Three is a legend: a status set, a three-series key.",
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
    id: "heading-ladder",
    title: "A heading outranks its body",
    severity: "warning",
    why:
      "Page 8, section 7, card title 6, body 3, label and meta 2. A heading at or below body size is a label wearing a heading's element (§15, hierarchy).",
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
    id: "eyebrow",
    title: "No eyebrows",
    severity: "warning",
    why:
      "A title carries its own subject; a small label above it is two elements doing one element's job (§15, information design). The rule was written into the brief the day it was tried and reversed on sight.",
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
    id: "filler-text",
    title: "The palette's own words are still in it",
    severity: "warning",
    why:
      "Every element states its one-word job, and the words are the author's. A node still carrying the text the palette gave it is a node nobody has written yet — which is what an unfinished export looks like to whoever reads it.",
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
    id: "zero-width-container",
    title: "A measured Box needs something to measure",
    severity: "error",
    why:
      "Containment makes a Box's contents stop contributing to its own width (§2), so a `container` Box that is a row-flex item with nothing sizing it renders 0px wide and draws nothing at all. This is the recorded defect that made containment opt-in in the first place.",
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
    id: "orphan-part",
    title: "A part needs its compound",
    severity: "error",
    why:
      "The parts of a compound carry wiring, not just looks — a title that is nobody's accessible name, a row outside the list it belongs to. The grammar prevents this at the drop; a document edited elsewhere can still arrive holding one.",
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
];

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
