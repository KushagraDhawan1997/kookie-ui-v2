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
import { ancestorChain, findNode, findParent, type BuilderNode } from "./model";

/** The ancestor TYPES above-and-including a prospective parent — what `canContain` asks. */
export const typesThrough = (roots: BuilderNode[], parentId: string | null): string[] => {
  if (parentId === null) return [];
  const parent = findNode(roots, parentId);
  if (!parent) return [];
  return [...ancestorChain(roots, parentId).map((a) => a.type), parent.type];
};

export type Insertion = { parentId: string | null; index?: number };

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
      if (canContain(parent.type, type, chainTypes)) {
        const branch = chain[i + 1];
        const at = branch ? (parent.children?.findIndex((c) => c.id === branch.id) ?? -1) + 1 : 0;
        return at > 0 ? { parentId: parent.id, index: at } : { parentId: parent.id };
      }
    }
  }
  return canContain(null, type, []) ? { parentId: null } : null;
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
