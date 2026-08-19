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
  density: NonNullable<ThemeProps["density"]>;
  pointer: NonNullable<ThemeProps["pointer"]>;
  radius: NonNullable<ThemeProps["radius"]>;
  depth: NonNullable<ThemeProps["depth"]>;
  material: NonNullable<ThemeProps["material"]>;
};

export type BuilderDoc = {
  theme: DocTheme;
  roots: BuilderNode[];
};

/** DERIVED from the package (the /preview law's rule): a builder copy of an axis default is
    the drift the environment panel already shipped once. */
export const defaultDocTheme = (): DocTheme => ({
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
  extra?: { text?: string; children?: BuilderNode[] },
): BuilderNode => ({
  id: nextId(),
  type,
  props,
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

const mapTree = (list: BuilderNode[], f: (n: BuilderNode) => BuilderNode): BuilderNode[] =>
  list.map((n) => f(n.children ? { ...n, children: mapTree(n.children, f) } : { ...n }));

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
  const prune = (list: BuilderNode[]): BuilderNode[] =>
    list.filter((n) => n.id !== id).map((n) => (n.children ? { ...n, children: prune(n.children) } : n));
  return prune(roots);
};

export const updateProps = (
  roots: BuilderNode[],
  id: string,
  patch: Record<string, PropValue | undefined>,
): BuilderNode[] =>
  mapTree(roots, (n) => {
    if (n.id !== id) return n;
    const props = { ...n.props };
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) delete props[k];
      else props[k] = v;
    }
    return { ...n, props };
  });

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
