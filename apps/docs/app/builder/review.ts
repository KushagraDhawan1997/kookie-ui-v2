/**
 * REVIEW — the house style as checks over the document (2026-08-20).
 *
 * This is the thing no other builder can have, and the reason is structural rather than
 * clever: a composition rule can only be CHECKED where the vocabulary is closed. "One loud
 * action per surface" is not a lint anyone can write against arbitrary CSS — there is no
 * such thing as loud. Here `emphasis="loud"` is a rung the system defined, a Card is a
 * surface the system named, and the brief that says one focal point per pane is written
 * down in DECISIONS §15. So the check is a walk over a tree whose every node the system
 * already understands.
 *
 * Each rule states three things, and the third is the point: what it found, WHY the system
 * says so (in the system's own words, not a lint's), and — where a fix is unambiguous — a
 * pure function that performs it. A rule with no honest automatic fix offers none; guessing
 * words a person meant to write is how lint tools teach people to ignore them.
 *
 * Deliberately NOT here: anything the tokens already guarantee (contrast, spacing values,
 * type pairings). Those cannot be wrong. What can be wrong is composition, and that is the
 * layer this file speaks to.
 */

import { CATALOG } from "./catalog";
import {
  findParent,
  removeNode,
  unwrapNode,
  updateProps,
  type BuilderDoc,
  type BuilderNode,
  type PropValue,
} from "./model";

export type Severity = "error" | "warning";

export type Finding = {
  /** Stable across re-runs: rule id + node id, so a list does not reshuffle while you read. */
  id: string;
  rule: string;
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
  run: (ctx: RuleContext) => Finding[];
};

type RuleContext = {
  roots: BuilderNode[];
  /** Every node with its parent chain, depth-first — most rules want one or the other. */
  all: { node: BuilderNode; parents: BuilderNode[] }[];
};

const walk = (roots: BuilderNode[]): RuleContext["all"] => {
  const out: RuleContext["all"] = [];
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

/** The panes a composition is judged INSIDE: everything that draws its own surface, plus the
    document itself. §15's "one figure per surface" is scoped to exactly these. */
const SURFACES = new Set(["Card", "DialogContent", "AlertDialogContent", "MenuContent", "SelectContent"]);

/** The nearest surface above a node — the pane its figure budget belongs to. */
const surfaceOf = (parents: BuilderNode[]): BuilderNode | null => {
  for (let i = parents.length - 1; i >= 0; i--) if (SURFACES.has(parents[i]!.type)) return parents[i]!;
  return null;
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

const label = (n: BuilderNode): string => (n.text?.trim() ? `“${n.text.trim().slice(0, 24)}”` : n.type);

export const RULES: Rule[] = [
  {
    id: "one-figure",
    title: "One focal action per surface",
    severity: "warning",
    why:
      "Boldness is spent exactly once. Two loud actions on one pane means neither is the point — the second one is medium, and the composition still says which is which (§15, figure/ground).",
    run: ({ all }) => {
      const bySurface = new Map<string, { node: BuilderNode; parents: BuilderNode[] }[]>();
      for (const entry of all) {
        const { node, parents } = entry;
        if (node.type !== "Button" || str(node.props.emphasis) !== "loud") continue;
        // An alert's Action is loud BY ANATOMY — the component owns the row and there is
        // exactly one, so the rule holds without the call site policing it (§25).
        if (parents.some((p) => p.type === "AlertDialogContent")) continue;
        const key = surfaceOf(parents)?.id ?? "·document·";
        bySurface.set(key, [...(bySurface.get(key) ?? []), entry]);
      }
      const out: Finding[] = [];
      for (const [, entries] of bySurface) {
        if (entries.length < 2) continue;
        // The FIRST keeps the budget; every later one is the finding.
        for (const { node } of entries.slice(1)) {
          out.push({
            id: `one-figure:${node.id}`,
            rule: "One focal action per surface",
            severity: "warning",
            nodeId: node.id,
            message: `${label(node)} is a second loud action on this surface.`,
            why: "",
            fix: {
              title: "Make it medium",
              apply: (roots) => updateProps(roots, node.id, { emphasis: "medium" }),
            },
          });
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
        .filter(({ node }) => (node.type === "Text" || node.type === "Heading") && str(node.props.size) === "1")
        .map(({ node }) => ({
          id: `size-1:${node.id}`,
          rule: "size 1 is retired from composed surfaces",
          severity: "warning" as const,
          nodeId: node.id,
          message: `${label(node)} is set at size 1.`,
          why: "",
          fix: {
            title: "Step it to 2 and mute it",
            apply: (roots) => updateProps(roots, node.id, { size: "2", emphasis: "medium" }),
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
        const named = Boolean(str(n.props["aria-label"])?.trim());
        if (named) return false;
        if (["Checkbox", "Switch", "Radio", "Slider", "Progress"].includes(n.type)) return true;
        if (n.type === "TextField" || n.type === "TextArea") return true;
        if (n.type === "SegmentedControl" || n.type === "Tabs") return n.type === "SegmentedControl";
        // A button with no text is a glyph with no name.
        if (n.type === "Button") return !n.text?.trim();
        return false;
      };
      return all
        .filter(({ node }) => needsName(node))
        .map(({ node }) => ({
          id: `name:${node.id}`,
          rule: "Every control states its name",
          severity: "error" as const,
          nodeId: node.id,
          message: `${node.type} has no accessible name.`,
          why: "",
          // No automatic fix on purpose: the name is words nobody but the author knows.
        }));
    },
  },
  {
    id: "empty-container",
    title: "An empty container draws nothing",
    severity: "warning",
    why:
      "A layout with nothing in it still takes its padding and its place in the rhythm — it reads as a mistake to the eye and as noise to the export. Fill it or cut it (the accessory rule, §15).",
    run: ({ all }) =>
      all
        .filter(
          ({ node }) =>
            ["Stack", "Flex", "Grid", "Box", "Card"].includes(node.type) && (node.children?.length ?? 0) === 0,
        )
        .map(({ node }) => ({
          id: `empty:${node.id}`,
          rule: "An empty container draws nothing",
          severity: "warning" as const,
          nodeId: node.id,
          message: `${node.type} is empty.`,
          why: "",
          fix: { title: "Delete it", apply: (roots) => removeNode(roots, node.id) },
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
          if (!["Stack", "Flex", "Grid"].includes(node.type)) return false;
          if ((node.children?.length ?? 0) !== 1) return false;
          // The refinement the templates forced: `gap` is the only prop a single child makes
          // inert. Anything else on the box is the box earning its place.
          const stated = Object.keys(node.props).filter((k) => k !== "gap");
          return stated.length === 0;
        })
        .map(({ node }) => ({
          id: `single:${node.id}`,
          rule: "A layout around one thing is not a layout",
          severity: "warning" as const,
          nodeId: node.id,
          message: `${node.type} holds a single ${node.children![0]!.type}.`,
          why: "",
          fix: { title: "Unwrap it", apply: (roots) => unwrapNode(roots, node.id) },
        })),
  },
  {
    id: "flat-rhythm",
    title: "Distance is relationship",
    severity: "warning",
    why:
      "Things that belong together sit closer than things that do not, and the two distances must differ by at least two steps or the eye reads one undifferentiated column (§15, proximity). Only distances on the SAME axis compete: a row's internal gap and the column rhythm around it are not measured against each other by any eye.",
    run: ({ all }) => {
      const out: Finding[] = [];
      for (const { node } of all) {
        if (!["Stack", "Flex"].includes(node.type)) continue;
        const outer = str(node.props.gap);
        if (!outer) continue;
        for (const child of node.children ?? []) {
          if (!["Stack", "Flex"].includes(child.type)) continue;
          // Same axis or nothing: the rule fired on a row inside a column while writing the
          // templates, which is the rule being wrong rather than the template.
          if (axisOf(node) !== axisOf(child)) continue;
          const inner = str(child.props.gap);
          if (!inner) continue;
          const step = Number(outer) - Number(inner);
          if (Number.isNaN(step) || step >= 2) continue;
          out.push({
            id: `rhythm:${child.id}`,
            rule: "Distance is relationship",
            severity: "warning",
            nodeId: child.id,
            message: `A group at gap ${inner} sits inside one at gap ${outer} — the two read as one.`,
            why: "",
            fix: {
              title: `Open the outer gap to ${Number(inner) + 2}`,
              apply: (roots) => updateProps(roots, node.id, { gap: String(Number(inner) + 2) }),
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
      "Controls sitting in one row are one role, so they take one size. A control two rungs under its neighbour reads as a mistake rather than as modesty (§15, similarity and proportion).",
    run: ({ all }) => {
      const out: Finding[] = [];
      for (const { node } of all) {
        const kids = (node.children ?? []).filter((c) => CATALOG[c.type]?.family === "Control");
        if (kids.length < 2) continue;
        const sizes = kids.map((k) => str(k.props.size)).filter((s): s is string => s !== null);
        if (sizes.length < 2) continue;
        const first = sizes[0]!;
        for (const kid of kids.slice(1)) {
          const size = str(kid.props.size);
          if (!size || size === first) continue;
          out.push({
            id: `sizes:${kid.id}`,
            rule: "Same role, same treatment",
            severity: "warning",
            nodeId: kid.id,
            message: `${label(kid)} is size ${size} beside a size ${first} sibling.`,
            why: "",
            fix: {
              title: `Match it to size ${first}`,
              apply: (roots) => updateProps(roots, kid.id, { size: first }),
            },
          });
        }
      }
      return out;
    },
  },
  {
    id: "tone-as-decoration",
    title: "Tone is vocabulary, not decoration",
    severity: "warning",
    why:
      "The ten families are colour-as-data — destructive, success, warning mean something. Three or more of them on one surface is a palette being enjoyed rather than a meaning being said (§7, §15 harmony).",
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
        .filter((e) => e.tones.size >= 3)
        .map((e) => ({
          id: `tones:${e.node.id}`,
          rule: "Tone is vocabulary, not decoration",
          severity: "warning" as const,
          nodeId: e.node.id,
          message: `${e.tones.size} data tones on one surface (${[...e.tones].join(", ")}).`,
          why: "",
        }));
    },
  },
  {
    id: "heading-ladder",
    title: "The ladder has real jumps",
    severity: "warning",
    why:
      "Page 8, section 7, card title 6, body 3, label and meta 2. A heading at or below body size is a label wearing a heading's element, and adjacent levels that differ by a rounding error are not a hierarchy (§15).",
    run: ({ all }) =>
      all
        .filter(({ node }) => node.type === "Heading" && Number(str(node.props.size) ?? "6") <= 4)
        .map(({ node }) => ({
          id: `ladder:${node.id}`,
          rule: "The ladder has real jumps",
          severity: "warning" as const,
          nodeId: node.id,
          message: `${label(node)} is a heading at size ${str(node.props.size)}.`,
          why: "",
          fix: {
            title: "Take the card-title step (6)",
            apply: (roots) => updateProps(roots, node.id, { size: "6" }),
          },
        })),
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
          if (!entry?.requiresAncestor) return false;
          return !parents.some((p) => p.type === entry.requiresAncestor);
        })
        .map(({ node }) => ({
          id: `orphan:${node.id}`,
          rule: "A part needs its compound",
          severity: "error" as const,
          nodeId: node.id,
          message: `${node.type} sits outside its ${CATALOG[node.type]!.requiresAncestor}.`,
          why: "",
          fix: { title: "Remove it", apply: (roots) => removeNode(roots, node.id) },
        })),
  },
];

/** Run every rule, newest concern first: errors before warnings, document order within. */
export const reviewDocument = (doc: BuilderDoc): Finding[] => {
  const ctx: RuleContext = { roots: doc.roots, all: walk(doc.roots) };
  const order = new Map(ctx.all.map(({ node }, i) => [node.id, i]));
  const findings = RULES.flatMap((rule) =>
    rule.run(ctx).map((f) => ({ ...f, why: f.why || rule.why, severity: f.severity ?? rule.severity })),
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
