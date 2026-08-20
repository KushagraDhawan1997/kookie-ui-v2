/**
 * The builder's document model (2026-08-19). A document is a tree of catalog entries — the
 * exported name, props off the closed unions, editable text where the entry takes text — and
 * ONE theme identity for the whole canvas. That is the entire vocabulary on purpose: the
 * builder does not add freedom to the system, it withholds the escapes (raw lengths, style,
 * arbitrary nesting), so a document cannot state anything the package would refuse.
 *
 * Every operation is pure and returns a new tree, which is what makes undo a stack of
 * documents rather than a second mechanism. IDs are editor plumbing — they never survive
 * into the exported code, and the round-trip law is what proves that.
 */

import { themeDefaults, tierNames, type ThemeProps } from "@kookie-ui/react";

/** The tier vocabulary a responsive value may speak, DERIVED from the package's own table
    (2026-08-19): `initial` plus the container tiers, in resolution order. The serializer
    emits overrides in this order, and refuses any key outside it. */
export const TIER_KEYS = ["initial", ...tierNames] as const;
export type TierKey = (typeof TIER_KEYS)[number];

/** A per-tier value — the package's own `Responsive<string>` object arm. Every tier's
    value is still a pick from the same closed list; responsiveness multiplies WHERE a
    token applies, never what a value may be. */
export type ResponsiveValue = Partial<Record<TierKey, string>>;
export type PropValue = string | number | boolean | ResponsiveValue;

export type BuilderNode = {
  /** Editor identity. Never serialized. */
  id: string;
  /**
   * The named seat this node occupies in its parent, if any (§4's adornment slots). A
   * slotted child lives in the same `children` array as everything else — which is the
   * whole point: every traversal, every drag, every id lookup keeps working unchanged, and
   * only the three places that care (the grammar, the serializer, the interpreter) ask.
   *
   * The alternative — a second `slots` map beside `children` — was refused: it doubles
   * every walk in this file and every rule in review.ts, to express a fact one field says.
   */
  slot?: "leading" | "trailing";
  /** The catalog key, which IS the exported component name. */
  type: string;
  /** Only props the user has stated. Absent means the component's own default — the
      serializer emits nothing, so the exported code says only what was decided. */
  props: Record<string, PropValue>;
  /** Text content, for entries whose children mode is "text". */
  text?: string;
  /** Child nodes, for entries whose children mode allows nodes. */
  children?: BuilderNode[];
};

/** The document's one Theme identity — the axes the canvas Theme is handed. `appearance`
    and `contrast` stay the docs store's, exactly as /preview divides them. */
export type DocTheme = {
  /** A screen may legitimately state its own appearance — a dark section inside a light app
      is a composition, not a preference — so it belongs to the DOCUMENT rather than to the
      site's toggle. `inherit` is the default and exports nothing. */
  appearance: NonNullable<ThemeProps["appearance"]>;
  density: NonNullable<ThemeProps["density"]>;
  pointer: NonNullable<ThemeProps["pointer"]>;
  radius: NonNullable<ThemeProps["radius"]>;
  depth: NonNullable<ThemeProps["depth"]>;
  material: NonNullable<ThemeProps["material"]>;
};

export type BuilderDoc = {
  theme: DocTheme;
  /** ALWAYS exactly one node: the canvas (2026-08-20, Kushagra: "I still expect to see parent
      Canvas in layers so that I can manually adjust padding and gap"). It stays an array
      because every traversal, every drag, every id lookup in this file already speaks it —
      making the canvas the single ROOT is what lets it be an ordinary node everywhere rather
      than a second kind of thing beside them.

      It existed before this, hidden: the canvas rendered its children inside a `Stack gap="5"`
      that the tree never showed and the EXPORT never emitted, so two roots sat 16px apart on
      screen and flush in the generated code (measured). A wrapper you cannot see is a wrapper
      that lies; this makes it a node you can select, retune and read in the export. */
  roots: BuilderNode[];
};

/** The canvas is a real Stack, so it exports as one and needs no special case anywhere in the
    serializer. `gap="5"` is the value the hidden wrapper already used, kept so existing
    documents look the way they looked. */
export const CANVAS_TYPE = "Stack";
export const canvasNode = (children: BuilderNode[] = []): BuilderNode =>
  node(CANVAS_TYPE, { gap: "5" }, { children });

/** The one node no command may delete, move, unwrap or reparent: the document IS it. */
export const isCanvasId = (doc: BuilderDoc, id: string): boolean => {
  const root = doc.roots[0];
  // The TYPE is checked as well as the position, so the failure is graceful: a document that
  // somehow skipped the migration has an ordinary node at roots[0], and the guard declines to
  // freeze it rather than silently making the user's first element undeletable.
  return doc.roots.length === 1 && root?.id === id && root.type === CANVAS_TYPE;
};

/** A document's content, which is what every "is it empty" question actually means. */
export const canvasChildren = (doc: BuilderDoc): BuilderNode[] => doc.roots[0]?.children ?? [];

/** DERIVED from the package (the /preview law's rule): a builder copy of an axis default is
    the drift the environment panel already shipped once. */
export const defaultDocTheme = (): DocTheme => ({
  // NOT `themeDefaults.appearance`, which is `light`: a document that states light pins the
  // canvas light and stops following the site's own toggle, so a new document INHERITS and
  // only says otherwise when someone chooses.
  appearance: "inherit",
  density: themeDefaults.density,
  pointer: themeDefaults.pointer,
  radius: themeDefaults.radius,
  depth: themeDefaults.depth,
  material: themeDefaults.material,
});

/* ── IDs ─────────────────────────────────────────────────────────────────────────────── */

let counter = 0;
/** Monotonic, not random: deterministic under test, and an id's only job is uniqueness
    within one session. */
export const nextId = (): string => `b${++counter}`;

export const node = (
  type: string,
  props: Record<string, PropValue> = {},
  extra?: { text?: string; children?: BuilderNode[]; slot?: "leading" | "trailing" },
): BuilderNode => ({
  id: nextId(),
  type,
  props,
  ...(extra?.slot !== undefined ? { slot: extra.slot } : {}),
  ...(extra?.text !== undefined ? { text: extra.text } : {}),
  ...(extra?.children !== undefined ? { children: extra.children } : {}),
});

/**
 * Deterministic ids for a tree built during RENDER — the starter document. A module counter
 * is not render-safe: the server mints b1…bN, Strict Mode's double-invoked initializer has
 * already advanced the counter by the client's first real run, and hydration sees two
 * different documents (found live, 2026-08-19). Depth-first renumbering under its own
 * prefix is the same ids every time, on every side.
 */
export const withStableIds = (roots: BuilderNode[], prefix = "s"): BuilderNode[] => {
  let i = 0;
  const stamp = (n: BuilderNode): BuilderNode => ({
    ...n,
    id: `${prefix}${++i}`,
    ...(n.children ? { children: n.children.map(stamp) } : {}),
  });
  return roots.map(stamp);
};

/** A block insertion is a clone: same shape, fresh identity everywhere. */
export const cloneWithNewIds = (n: BuilderNode): BuilderNode => ({
  ...n,
  id: nextId(),
  props: { ...n.props },
  ...(n.children ? { children: n.children.map(cloneWithNewIds) } : {}),
});

/* ── Reads ───────────────────────────────────────────────────────────────────────────── */

export const findNode = (roots: BuilderNode[], id: string): BuilderNode | null => {
  for (const n of roots) {
    if (n.id === id) return n;
    const hit = n.children ? findNode(n.children, id) : null;
    if (hit) return hit;
  }
  return null;
};

/** The parent, or null for a root. Distinct from "not found", which is also null — callers
    that need the difference call findNode first. */
export const findParent = (roots: BuilderNode[], id: string): BuilderNode | null => {
  for (const n of roots) {
    if (n.children?.some((c) => c.id === id)) return n;
    const hit = n.children ? findParent(n.children, id) : null;
    if (hit) return hit;
  }
  return null;
};

/** Root-first chain of ancestors ABOVE the node (excludes the node itself). */
export const ancestorChain = (roots: BuilderNode[], id: string): BuilderNode[] => {
  const walk = (list: BuilderNode[], trail: BuilderNode[]): BuilderNode[] | null => {
    for (const n of list) {
      if (n.id === id) return trail;
      if (n.children) {
        const hit = walk(n.children, [...trail, n]);
        if (hit) return hit;
      }
    }
    return null;
  };
  return walk(roots, []) ?? [];
};

/* ── Writes — every one pure ─────────────────────────────────────────────────────────── */

/**
 * Map a tree, PRESERVING IDENTITY where nothing changed (2026-08-20).
 *
 * The first spelling copied every node on every edit — `{ ...n }` unconditionally — which
 * is correct but throws away the one piece of information the renderer needs most: which
 * subtrees are untouched. Measured at 280 nodes, a single keystroke in the inspector cost
 * 103ms, because React was handed 280 new objects and reconciled all of them. With sharing
 * plus a memoized interpreter it is 8ms.
 *
 * Every `f` in this file returns its argument unchanged when the node is not the target, so
 * identity survives by construction as long as this function stops pre-copying.
 */
const mapTree = (list: BuilderNode[], f: (n: BuilderNode) => BuilderNode): BuilderNode[] => {
  let changed = false;
  const next = list.map((n) => {
    const kids = n.children ? mapTree(n.children, f) : undefined;
    const base = kids === undefined || kids === n.children ? n : { ...n, children: kids };
    const out = f(base);
    if (out !== n) changed = true;
    return out;
  });
  return changed ? next : list;
};

/** Insert into a parent (or the root list when parentId is null), at index or appended. */
export const insertNode = (
  roots: BuilderNode[],
  parentId: string | null,
  child: BuilderNode,
  index?: number,
): BuilderNode[] => {
  if (parentId === null) {
    const next = [...roots];
    next.splice(index ?? next.length, 0, child);
    return next;
  }
  return mapTree(roots, (n) => {
    if (n.id !== parentId) return n;
    const children = [...(n.children ?? [])];
    children.splice(index ?? children.length, 0, child);
    return { ...n, children };
  });
};

export const removeNode = (roots: BuilderNode[], id: string): BuilderNode[] => {
  const prune = (list: BuilderNode[]): BuilderNode[] => {
    const kept = list.filter((n) => n.id !== id);
    let changed = kept.length !== list.length;
    const next = kept.map((n) => {
      if (!n.children) return n;
      const kids = prune(n.children);
      if (kids === n.children) return n;
      changed = true;
      return { ...n, children: kids };
    });
    return changed ? next : list;
  };
  return prune(roots);
};

/**
 * One patch, several nodes, ONE pass — the multi-selection inspector's write. Looping
 * `updateProps` would walk the tree once per node and, worse, land as one history entry per
 * node: undoing "make these five medium" would take five presses. This is one edit.
 */
export const updatePropsMany = (
  roots: BuilderNode[],
  ids: readonly string[],
  patch: Record<string, PropValue | undefined>,
): BuilderNode[] => {
  const set = new Set(ids);
  if (set.size === 0) return roots;
  return mapTree(roots, (n) => {
    if (!set.has(n.id)) return n;
    const props = { ...n.props };
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) delete props[k];
      else props[k] = v;
    }
    return { ...n, props };
  });
};

export const updateProps = (
  roots: BuilderNode[],
  id: string,
  patch: Record<string, PropValue | undefined>,
): BuilderNode[] => updatePropsMany(roots, [id], patch);

export const updateText = (roots: BuilderNode[], id: string, text: string): BuilderNode[] =>
  mapTree(roots, (n) => (n.id === id ? { ...n, text } : n));

/** Reorder within the current parent. Out-of-range is a no-op, not an error — the buttons
    that call this are enabled from the same arithmetic, so a throw would only guard drift. */
export const moveNode = (roots: BuilderNode[], id: string, delta: -1 | 1): BuilderNode[] => {
  const shift = (list: BuilderNode[]): BuilderNode[] => {
    const i = list.findIndex((n) => n.id === id);
    if (i !== -1) {
      const j = i + delta;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      const [moved] = next.splice(i, 1);
      next.splice(j, 0, moved!);
      return next;
    }
    return list.map((n) => (n.children ? { ...n, children: shift(n.children) } : n));
  };
  return shift(roots);
};

/** Move a node under a new parent (append). The caller checks the grammar first; this is
    tree surgery, not judgment. Refuses only the one incoherent case: a node into its own
    subtree, which would delete it. */
export const moveNodeTo = (
  roots: BuilderNode[],
  id: string,
  newParentId: string | null,
  index?: number,
): BuilderNode[] => {
  const moving = findNode(roots, id);
  if (!moving) return roots;
  if (newParentId !== null && (id === newParentId || findNode([moving], newParentId))) return roots;
  // `index` speaks PRE-move positions — what a pointer computed while the node still sat
  // among its siblings. Moving later within the same parent, the removal shifts everything
  // after the node one left, so the stated index lands one late without this.
  let at = index;
  if (at !== undefined) {
    const siblings = newParentId === null ? roots : (findNode(roots, newParentId)?.children ?? []);
    const from = siblings.findIndex((n) => n.id === id);
    if (from !== -1 && from < at) at -= 1;
  }
  return insertNode(removeNode(roots, id), newParentId, moving, at);
};

/* ── Structural surgery (2026-08-20): the operations a composition editor owes ────────── */

/** Replace one node in place, keeping its position among its siblings. */
export const replaceNode = (roots: BuilderNode[], id: string, next: BuilderNode): BuilderNode[] => {
  const walk = (list: BuilderNode[]): BuilderNode[] => {
    let changed = false;
    const out = list.map((n) => {
      if (n.id === id) {
        changed = true;
        return next;
      }
      if (!n.children) return n;
      const kids = walk(n.children);
      if (kids === n.children) return n;
      changed = true;
      return { ...n, children: kids };
    });
    return changed ? out : list;
  };
  return walk(roots);
};

/**
 * Put `wrapper` where the node is, with the node inside it — the single most-wanted
 * composition gesture ("these two things belong in a row"). The caller checks the grammar
 * both ways: the wrapper must be legal where the node stands, and must accept the node.
 */
export const wrapNode = (roots: BuilderNode[], id: string, wrapper: BuilderNode): BuilderNode[] => {
  const target = findNode(roots, id);
  if (!target) return roots;
  return replaceNode(roots, id, { ...wrapper, children: [...(wrapper.children ?? []), target] });
};

/** Wrap SEVERAL adjacent siblings in one wrapper, which is what "wrap these in a row" means
    when more than one thing is selected: the wrapper lands at the first one's position and
    the rest move into it. Non-siblings are refused — a wrapper cannot straddle two parents. */
export const wrapNodes = (roots: BuilderNode[], ids: string[], wrapper: BuilderNode): BuilderNode[] => {
  if (ids.length === 0) return roots;
  if (ids.length === 1) return wrapNode(roots, ids[0]!, wrapper);
  const parent = findParent(roots, ids[0]!);
  const siblings = parent ? (parent.children ?? []) : roots;
  const chosen = siblings.filter((n) => ids.includes(n.id));
  if (chosen.length !== ids.length) return roots; // not all siblings of one parent
  const at = siblings.findIndex((n) => n.id === chosen[0]!.id);
  const wrapped = { ...wrapper, children: [...(wrapper.children ?? []), ...chosen] };
  let next = roots;
  for (const n of chosen) next = removeNode(next, n.id);
  return insertNode(next, parent?.id ?? null, wrapped, at);
};

/**
 * Dissolve a container, leaving its children where it stood. The inverse of wrap, and the
 * escape from a layout that turned out to be one too many. A node with no children simply
 * goes — "unwrap" of an empty box is a delete, which is what the eye expects.
 */
export const unwrapNode = (roots: BuilderNode[], id: string): BuilderNode[] => {
  const target = findNode(roots, id);
  if (!target) return roots;
  const parent = findParent(roots, id);
  const siblings = parent ? (parent.children ?? []) : roots;
  const at = siblings.findIndex((n) => n.id === id);
  if (at === -1) return roots;
  const kids = target.children ?? [];
  const next = [...siblings.slice(0, at), ...kids, ...siblings.slice(at + 1)];
  return parent ? replaceNode(roots, parent.id, { ...parent, children: next }) : next;
};

/** Depth-first ids, which IS the reading order — so keyboard up/down walks the tree the way
    the Layers panel draws it and the canvas lays it out. */
export const flattenIds = (roots: BuilderNode[]): string[] =>
  roots.flatMap((n) => [n.id, ...flattenIds(n.children ?? [])]);

/** The next/previous node in reading order, or null at the ends. */
export const stepInTree = (roots: BuilderNode[], id: string | null, delta: -1 | 1): string | null => {
  const flat = flattenIds(roots);
  if (flat.length === 0) return null;
  if (id === null) return delta === 1 ? flat[0]! : flat[flat.length - 1]!;
  const i = flat.indexOf(id);
  if (i === -1) return flat[0]!;
  return flat[i + delta] ?? null;
};


/* ── Slots (2026-08-20) ────────────────────────────────────────────────────────────────
   A node's children divide into the ones that lay out in flow and the ones that sit in a
   named seat. Stated once here; the grammar, the serializer and the interpreter all ask
   these two rather than filtering by hand. */

/**
 * Which rows a Layers filter keeps (2026-08-20): every node whose type or words match, plus
 * every ancestor of one — because a match with its path cut off is a match nobody can place.
 * Every word must appear somewhere in the node's own description, in any order, which is the
 * palette's matcher and for the same reason: nobody types the words in tree order.
 *
 * An empty query returns null, meaning "no filter" rather than "nothing matched" — the two
 * are opposite answers and a Set cannot tell them apart.
 */
export const matchingIds = (roots: BuilderNode[], query: string): Set<string> | null => {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  const keep = new Set<string>();
  // The ancestors come out of the RETURN value: a node keeps itself when it matches or when
  // anything below it did, and that walks the chain up on its own. Threading an ancestor list
  // down as well was a second mechanism for one fact — and a dead one, which is how its
  // sabotage pass found it: deleting it changed nothing.
  const visit = (list: BuilderNode[]): boolean => {
    let any = false;
    for (const n of list) {
      const haystack = `${n.type} ${n.text ?? ""}`.toLowerCase();
      const hit = words.every((w) => haystack.includes(w));
      const below = n.children ? visit(n.children) : false;
      if (hit || below) {
        keep.add(n.id);
        any = true;
      }
    }
    return any;
  };
  visit(roots);
  return keep;
};

export const flowChildren = (n: BuilderNode): BuilderNode[] => (n.children ?? []).filter((c) => !c.slot);

export const slottedChild = (n: BuilderNode, slot: "leading" | "trailing"): BuilderNode | null =>
  (n.children ?? []).find((c) => c.slot === slot) ?? null;

/** Seat a node in a slot, replacing whatever sat there. */
export const setSlot = (
  roots: BuilderNode[],
  parentId: string,
  slot: "leading" | "trailing",
  child: BuilderNode | null,
): BuilderNode[] => {
  const walk = (list: BuilderNode[]): BuilderNode[] => {
    let changed = false;
    const out = list.map((n) => {
      if (n.id === parentId) {
        changed = true;
        const kept = (n.children ?? []).filter((c) => c.slot !== slot);
        return { ...n, children: child ? [...kept, { ...child, slot }] : kept };
      }
      if (!n.children) return n;
      const kids = walk(n.children);
      if (kids === n.children) return n;
      changed = true;
      return { ...n, children: kids };
    });
    return changed ? out : list;
  };
  return walk(roots);
};
