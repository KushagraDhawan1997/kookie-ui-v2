/**
 * Where a new node may go, as pure functions over the tree (2026-08-20). Extracted from the
 * app on its third consumer — the palette asked it, then the drop handler, then the command
 * table — which is this repo's own promotion rule (a mechanism with laws promotes at two).
 *
 * Everything here answers with TREE coordinates. Nothing measures a pixel: geometry belongs
 * to the drag, and the drag asks these same questions once it knows which container it is
 * over.
 */

import { CATALOG, canContain } from "./catalog";
import {
  ancestorChain,
  cloneWithNewIds,
  findNode,
  findParent,
  flowChildren,
  insertNode,
  type BuilderNode,
} from "./model";

/** The ancestor TYPES above-and-including a prospective parent — what `canContain` asks. */
export const typesThrough = (roots: BuilderNode[], parentId: string | null): string[] => {
  if (parentId === null) return [];
  const parent = findNode(roots, parentId);
  if (!parent) return [];
  return [...ancestorChain(roots, parentId).map((a) => a.type), parent.type];
};

export type Insertion = { parentId: string | null; index?: number };

/**
 * Is there ROOM in this parent? (2026-08-20)
 *
 * The grammar answers per child — "may a Button sit in a MenuTrigger" — and says nothing
 * about how many. For most parents that is right; for the four that hand their child to the
 * primitive's `render` prop it is a hole. Both the interpreter and the serializer take
 * `flowChildren(n)[0]`, so a second child in a trigger is in the tree, in Layers and in
 * storage, and drawn and exported nowhere — the seat ghost's shape, one mechanism over. The
 * grammar permitted it: `canContain("MenuTrigger", "Button", …)` is true, and right-click →
 * Insert here → Button was a one-gesture route to it.
 */
export const hasRoom = (parent: BuilderNode): boolean =>
  !CATALOG[parent.type]?.renderChild || flowChildren(parent).length === 0;

/** The whole question a drop asks: does the grammar allow it, and is there room. */
export const canAccept = (roots: BuilderNode[], parentId: string | null, childType: string): boolean => {
  if (parentId === null) return canContain(null, childType, []);
  const parent = findNode(roots, parentId);
  if (!parent) return false;
  return canContain(parent.type, childType, typesThrough(roots, parentId)) && hasRoom(parent);
};

/**
 * Where a palette insertion lands, relative to the selection: the selected node if its
 * grammar accepts, else the nearest accepting ancestor (landing beside the branch the
 * selection is on, because the gesture means "next to what I'm looking at"), else the
 * document root. Null means nowhere, and the palette entry disables.
 */
export const insertionTarget = (
  roots: BuilderNode[],
  selection: string | null,
  type: string,
): Insertion | null => {
  if (selection) {
    const chain = [...ancestorChain(roots, selection), findNode(roots, selection)].filter(
      (x): x is BuilderNode => x !== null,
    );
    for (let i = chain.length - 1; i >= 0; i--) {
      const parent = chain[i]!;
      const chainTypes = chain.slice(0, i + 1).map((c) => c.type);
      if (canContain(parent.type, type, chainTypes) && hasRoom(parent)) {
        const branch = chain[i + 1];
        const at = branch ? (parent.children?.findIndex((c) => c.id === branch.id) ?? -1) + 1 : 0;
        return at > 0 ? { parentId: parent.id, index: at } : { parentId: parent.id };
      }
    }
  }
  return canContain(null, type, []) ? { parentId: null } : null;
};

/**
 * What may be inserted INTO a given node — the right-click menu's question, and the same
 * grammar the palette and the drop handlers ask. Parts first, because inside a compound
 * (a Menu, a Select, a Tabs) the part is what you actually reached for; `limit` bounds the
 * list because a context menu that has to scroll is a menu nobody reads.
 */
export const insertableInto = (
  roots: BuilderNode[],
  id: string | null,
  limit = 14,
): string[] => {
  const node = id ? findNode(roots, id) : null;
  if (!node) return [];
  const chain = typesThrough(roots, node.id);
  const fits = (type: string) => canContain(node.type, type, chain) && hasRoom(node);
  const types = Object.keys(CATALOG).filter(fits);
  const parts = types.filter((t) => CATALOG[t]!.partOf);
  const rest = types.filter((t) => !CATALOG[t]!.partOf);
  return [...parts, ...rest].slice(0, limit);
};

/**
 * Place several nodes where the selection says, IN ORDER (2026-08-20).
 *
 * The order is the whole reason this exists. Both paste paths — the ⌘V command and the
 * clipboard event — used to run the same loop, recomputing the target against a selection
 * whose index never moved, so every node landed at the same spot and each one pushed the
 * previous one down: copying A, B, C pasted C, B, A. One defect, spelled out twice, in two
 * files, with no law over either.
 *
 * The repair is a per-parent offset rather than re-anchoring on the node just placed: the
 * anchor advance reads well and is wrong, because `insertionTarget` asks whether the anchor
 * ITSELF accepts the type — so pasting a Card and then a Text would put the Text inside the
 * Card rather than beside it.
 */
export const placeNodes = (
  roots: BuilderNode[],
  anchorId: string | null,
  nodes: readonly BuilderNode[],
): { roots: BuilderNode[]; placed: string[] } => {
  let next = roots;
  const placed: string[] = [];
  const already = new Map<string | null, number>();
  for (const n of nodes) {
    const target = insertionTarget(next, anchorId, n.type);
    if (!target) continue;
    const bump = already.get(target.parentId) ?? 0;
    const fresh = cloneWithNewIds(n);
    // `index: undefined` means append, and appending in order is already in order.
    next = insertNode(next, target.parentId, fresh, target.index === undefined ? undefined : target.index + bump);
    already.set(target.parentId, bump + 1);
    placed.push(fresh.id);
  }
  return { roots: next, placed };
};

/** Can this wrapper legally stand where the node stands, AND hold it? Both halves matter:
    wrapping a MenuItem in a Stack would put a Stack inside a MenuContent that refuses it. */
export const canWrap = (roots: BuilderNode[], ids: string[], wrapperType: string): boolean => {
  if (ids.length === 0 || !CATALOG[wrapperType]) return false;
  const nodes = ids.map((id) => findNode(roots, id)).filter((n): n is BuilderNode => n !== null);
  if (nodes.length !== ids.length) return false;
  const parent = findParent(roots, ids[0]!);
  // Several nodes may only be wrapped together when they are siblings of one parent.
  if (nodes.length > 1) {
    const parentId = parent?.id ?? null;
    for (const n of nodes) if ((findParent(roots, n.id)?.id ?? null) !== parentId) return false;
  }
  const chain = parent ? typesThrough(roots, parent.id) : [];
  if (!canContain(parent?.type ?? null, wrapperType, chain)) return false;
  return nodes.every((n) => canContain(wrapperType, n.type, [...chain, wrapperType]));
};

/** Can this node's children survive standing where it stands? (Unwrap's grammar check.) */
export const canUnwrap = (roots: BuilderNode[], id: string): boolean => {
  const node = findNode(roots, id);
  if (!node) return false;
  const kids = node.children ?? [];
  if (kids.length === 0) return true; // dissolving an empty container is a delete, always legal
  const parent = findParent(roots, id);
  const chain = parent ? typesThrough(roots, parent.id) : [];
  return kids.every((k) => canContain(parent?.type ?? null, k.type, chain));
};
