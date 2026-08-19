/**
 * The editor's state, as ONE reducer (2026-08-20). Everything the builder can do to a
 * document happens through `dispatch`, which is what makes the command table, the keyboard
 * map, the palette and the context menus renderers over a single surface rather than four
 * copies of the same twenty callbacks.
 *
 * Three facts shape it:
 *
 * 1. A builder that holds one document is a page; an app holds SEVERAL. Documents are named,
 *    switchable and independently undoable — history is per document, because undo that
 *    reaches across a document switch is undo nobody can predict.
 *
 * 2. Selection is a LIST. One selected node is the common case, but "wrap these two in a
 *    row" is the composition gesture this editor exists for, and it needs more than one.
 *    The last id in the list is the PRIMARY — what the inspector shows and what a relative
 *    insert measures from.
 *
 * 3. Undo restores what you were LOOKING at, not just the tree: a snapshot carries the
 *    selection with it, so stepping back through history puts the selection where the edit
 *    happened rather than leaving it stranded on a node that no longer exists.
 *
 * Storage is persistence, never truth (the docs' own storage-denied lesson): the reducer
 * never touches localStorage, and the app writes state through after it has landed.
 */

import { sanitizeNode } from "./catalog";
import {
  cloneWithNewIds,
  defaultDocTheme,
  findNode,
  findParent,
  stepInTree,
  type BuilderDoc,
  type BuilderNode,
  type DocTheme,
} from "./model";

export type Block = {
  name: string;
  /** A frozen subtree. Its CONTENT is parameterized at export time (serialize.ts derives the
      prop names from the tree's own reading order, so they are stable without being stored)
      and its axes are not — a block's loudness was its author's decision. */
  node: BuilderNode;
};

export type StoredDoc = BuilderDoc & { id: string; name: string };

type Snapshot = { theme: DocTheme; roots: BuilderNode[]; selection: string[] };
type DocHistory = { past: Snapshot[]; future: Snapshot[] };

export type EditorState = {
  docs: StoredDoc[];
  activeId: string;
  /** Reading-order ids; the LAST is the primary. */
  selection: string[];
  histories: Record<string, DocHistory>;
  blocks: Block[];
};

export type Action =
  | { type: "select"; ids: string[]; additive?: boolean }
  | { type: "selectStep"; delta: -1 | 1 }
  | { type: "selectParent" }
  | { type: "selectChild" }
  /** A tree edit that pushes history. `selection` optionally moves with it. */
  | { type: "edit"; roots: BuilderNode[]; selection?: string[] }
  /** A tree edit INSIDE a gesture already pushed — a drag's every frame after the first. */
  | { type: "editSilent"; roots: BuilderNode[] }
  | { type: "setTheme"; axis: keyof DocTheme; value: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "docNew"; name?: string; doc?: BuilderDoc; select?: boolean }
  | { type: "docSwitch"; id: string }
  | { type: "docRename"; id: string; name: string }
  | { type: "docDelete"; id: string }
  | { type: "docDuplicate"; id: string }
  | { type: "blockSave"; block: Block }
  | { type: "blockRemove"; index: number }
  | { type: "hydrate"; state: EditorState };

const HISTORY_DEPTH = 200;

export const emptyHistory = (): DocHistory => ({ past: [], future: [] });

export const activeDoc = (s: EditorState): StoredDoc =>
  s.docs.find((d) => d.id === s.activeId) ?? s.docs[0]!;

/** The node the inspector shows and relative inserts measure from. */
export const primaryId = (s: EditorState): string | null => s.selection[s.selection.length - 1] ?? null;

export const primaryNode = (s: EditorState): BuilderNode | null => {
  const id = primaryId(s);
  return id ? findNode(activeDoc(s).roots, id) : null;
};

export const selectedNodes = (s: EditorState): BuilderNode[] => {
  const roots = activeDoc(s).roots;
  return s.selection.map((id) => findNode(roots, id)).filter((n): n is BuilderNode => n !== null);
};

export const canUndo = (s: EditorState): boolean => (s.histories[s.activeId]?.past.length ?? 0) > 0;
export const canRedo = (s: EditorState): boolean => (s.histories[s.activeId]?.future.length ?? 0) > 0;

let docCounter = 0;
export const newDocId = (): string => `doc${++docCounter}`;

export const makeDoc = (name: string, doc?: BuilderDoc): StoredDoc => ({
  id: newDocId(),
  name,
  theme: doc?.theme ?? defaultDocTheme(),
  roots: doc?.roots ?? [],
});

export const initialState = (first: StoredDoc): EditorState => ({
  docs: [first],
  activeId: first.id,
  selection: [],
  histories: { [first.id]: emptyHistory() },
  blocks: [],
});

/** Replace the active document, pushing the previous one onto its own history. */
const commit = (
  s: EditorState,
  next: { theme?: DocTheme; roots?: BuilderNode[] },
  selection: string[] | undefined,
  push: boolean,
): EditorState => {
  const doc = activeDoc(s);
  const updated: StoredDoc = { ...doc, ...next };
  const history = s.histories[s.activeId] ?? emptyHistory();
  const nextSelection = selection ?? s.selection;
  return {
    ...s,
    docs: s.docs.map((d) => (d.id === updated.id ? updated : d)),
    selection: nextSelection,
    histories: {
      ...s.histories,
      [s.activeId]: push
        ? {
            past: [...history.past, { theme: doc.theme, roots: doc.roots, selection: s.selection }].slice(-HISTORY_DEPTH),
            future: [],
          }
        : history,
    },
  };
};

/** Selection minus the ids a tree no longer holds — every edit runs it, so a deleted node
    can never stay selected and leave the inspector describing a ghost. */
const prune = (roots: BuilderNode[], selection: string[]): string[] =>
  selection.filter((id) => findNode(roots, id) !== null);

export function reducer(s: EditorState, a: Action): EditorState {
  switch (a.type) {
    case "select": {
      if (!a.additive) return { ...s, selection: a.ids };
      const set = new Set(s.selection);
      for (const id of a.ids) {
        if (set.has(id)) set.delete(id);
        else set.add(id);
      }
      // Additive order matters: the last TOUCHED id is the primary, so a shift-click makes
      // the thing just clicked the one the inspector describes.
      const kept = s.selection.filter((id) => set.has(id));
      const added = a.ids.filter((id) => set.has(id) && !s.selection.includes(id));
      return { ...s, selection: [...kept, ...added] };
    }
    case "selectStep": {
      const next = stepInTree(activeDoc(s).roots, primaryId(s), a.delta);
      return next ? { ...s, selection: [next] } : s;
    }
    case "selectParent": {
      const id = primaryId(s);
      if (!id) return s;
      const parent = findParent(activeDoc(s).roots, id);
      return parent ? { ...s, selection: [parent.id] } : s;
    }
    case "selectChild": {
      const node = primaryNode(s);
      const first = node?.children?.[0];
      return first ? { ...s, selection: [first.id] } : s;
    }
    case "edit":
      return commit(s, { roots: a.roots }, prune(a.roots, a.selection ?? s.selection), true);
    case "editSilent":
      return commit(s, { roots: a.roots }, prune(a.roots, s.selection), false);
    case "setTheme": {
      const doc = activeDoc(s);
      return commit(s, { theme: { ...doc.theme, [a.axis]: a.value } }, undefined, true);
    }
    case "undo": {
      const history = s.histories[s.activeId] ?? emptyHistory();
      const prev = history.past[history.past.length - 1];
      if (!prev) return s;
      const doc = activeDoc(s);
      return {
        ...s,
        docs: s.docs.map((d) => (d.id === doc.id ? { ...d, theme: prev.theme, roots: prev.roots } : d)),
        selection: prune(prev.roots, prev.selection),
        histories: {
          ...s.histories,
          [s.activeId]: {
            past: history.past.slice(0, -1),
            future: [{ theme: doc.theme, roots: doc.roots, selection: s.selection }, ...history.future],
          },
        },
      };
    }
    case "redo": {
      const history = s.histories[s.activeId] ?? emptyHistory();
      const next = history.future[0];
      if (!next) return s;
      const doc = activeDoc(s);
      return {
        ...s,
        docs: s.docs.map((d) => (d.id === doc.id ? { ...d, theme: next.theme, roots: next.roots } : d)),
        selection: prune(next.roots, next.selection),
        histories: {
          ...s.histories,
          [s.activeId]: {
            past: [...history.past, { theme: doc.theme, roots: doc.roots, selection: s.selection }],
            future: history.future.slice(1),
          },
        },
      };
    }
    case "docNew": {
      const doc = makeDoc(a.name ?? `Untitled ${s.docs.length + 1}`, a.doc);
      return {
        ...s,
        docs: [...s.docs, doc],
        activeId: a.select === false ? s.activeId : doc.id,
        selection: a.select === false ? s.selection : [],
        histories: { ...s.histories, [doc.id]: emptyHistory() },
      };
    }
    case "docSwitch":
      return s.docs.some((d) => d.id === a.id) ? { ...s, activeId: a.id, selection: [] } : s;
    case "docRename":
      return { ...s, docs: s.docs.map((d) => (d.id === a.id ? { ...d, name: a.name } : d)) };
    case "docDuplicate": {
      const source = s.docs.find((d) => d.id === a.id);
      if (!source) return s;
      const copy = makeDoc(`${source.name} copy`, {
        theme: source.theme,
        roots: source.roots.map(cloneWithNewIds),
      });
      return {
        ...s,
        docs: [...s.docs, copy],
        activeId: copy.id,
        selection: [],
        histories: { ...s.histories, [copy.id]: emptyHistory() },
      };
    }
    case "docDelete": {
      // The last document is never deleted — an editor with no document has nothing to be.
      if (s.docs.length <= 1) return s;
      const remaining = s.docs.filter((d) => d.id !== a.id);
      const histories = { ...s.histories };
      delete histories[a.id];
      const activeId = s.activeId === a.id ? remaining[0]!.id : s.activeId;
      return { ...s, docs: remaining, activeId, histories, selection: s.activeId === a.id ? [] : s.selection };
    }
    case "blockSave":
      return { ...s, blocks: [...s.blocks, a.block] };
    case "blockRemove":
      return { ...s, blocks: s.blocks.filter((_, i) => i !== a.index) };
    case "hydrate":
      return a.state;
    default:
      return s;
  }
}

/* ── Persistence ───────────────────────────────────────────────────────────────────────
   One key for the whole editor, with the v1 single-document keys migrated on first read.
   Everything is sanitized against TODAY's catalog on the way in (a document saved under an
   older vocabulary loads as the part of it the system still speaks), and history is
   deliberately NOT persisted: undo is a session's memory of what it just did. */

export const STORE_KEY = "kookie-builder-v2";
const V1_DOC_KEY = "kookie-builder-doc-v1";
const V1_BLOCKS_KEY = "kookie-builder-blocks-v1";

type Persisted = {
  docs: { id: string; name: string; theme: Partial<DocTheme>; roots: BuilderNode[] }[];
  activeId: string;
  blocks: Block[];
};

const reviveDoc = (d: Persisted["docs"][number]): StoredDoc => ({
  id: d.id || newDocId(),
  name: String(d.name || "Untitled"),
  theme: { ...defaultDocTheme(), ...d.theme },
  roots: (d.roots ?? []).map(sanitizeNode).filter((n): n is BuilderNode => n !== null).map(cloneWithNewIds),
});

const reviveBlocks = (raw: unknown): Block[] =>
  Array.isArray(raw)
    ? raw
        .map((b) => {
          const node = b?.node ? sanitizeNode(b.node) : null;
          return node ? { name: String(b.name ?? "Block"), node } : null;
        })
        .filter((b): b is Block => b !== null && b.name.length > 0)
    : [];

/** Read the editor back, or null when there is nothing (or nothing readable) stored. */
export const loadState = (fallbackName: string): EditorState | null => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted;
      const docs = (parsed.docs ?? []).map(reviveDoc);
      if (docs.length === 0) return null;
      const activeId = docs.some((d) => d.id === parsed.activeId) ? parsed.activeId : docs[0]!.id;
      return {
        docs,
        activeId,
        selection: [],
        histories: Object.fromEntries(docs.map((d) => [d.id, emptyHistory()])),
        blocks: reviveBlocks(parsed.blocks),
      };
    }
    // v1: one unnamed document and its blocks, promoted into the first document of the app.
    const legacy = localStorage.getItem(V1_DOC_KEY);
    const legacyBlocks = localStorage.getItem(V1_BLOCKS_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as BuilderDoc;
      const doc = reviveDoc({ id: newDocId(), name: fallbackName, theme: parsed.theme ?? {}, roots: parsed.roots ?? [] });
      return {
        ...initialState(doc),
        blocks: reviveBlocks(legacyBlocks ? JSON.parse(legacyBlocks) : []),
      };
    }
  } catch {
    // Denied or corrupt storage: the session runs from memory, exactly as designed.
  }
  return null;
};

export const saveState = (s: EditorState): void => {
  try {
    const payload: Persisted = {
      docs: s.docs.map(({ id, name, theme, roots }) => ({ id, name, theme, roots })),
      activeId: s.activeId,
      blocks: s.blocks,
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(payload));
  } catch {
    // Persistence is best-effort; the session's truth is memory.
  }
};
