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

import { normalizeSeats, sanitizeNode } from "./catalog";
import {
  CANVAS_TYPE,
  canvasNode,
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
type DocHistory = {
  past: Snapshot[];
  future: Snapshot[];
  /**
   * What the last pushed snapshot was pushed FOR (2026-08-20).
   *
   * Typing is one gesture and belongs in one snapshot. Without this, the inspector's content
   * field committed a history-pushing edit per keystroke: a two-line description cost 120
   * undo presses to take back, and around 200 characters silently evicted every prior
   * snapshot — including the card you built before you started typing — because the stack is
   * capped. The mechanism already existed one file over (a drag pushes once and then rides
   * `editSilent`); it had simply never reached the highest-frequency edit in the editor.
   *
   * Consecutive edits carrying the same key ride the first one's snapshot. Anything else —
   * a different key, an unkeyed edit, a selection, an undo — ends the run, so moving to
   * another field starts a new entry.
   */
  lastKey?: string;
};

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
  /** A tree edit that pushes history. `selection` optionally moves with it. `coalesce` names
      a GESTURE: consecutive edits carrying the same key ride one snapshot, so typing a
      sentence is one undo rather than one per character. */
  | { type: "edit"; roots: BuilderNode[]; selection?: string[]; coalesce?: string }
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
  // Every document has a canvas, including an empty one — there is no state in which the
  // root is missing, so nothing downstream has to ask.
  roots: doc?.roots ?? [canvasNode()],
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
  /** Runs of edits sharing this key ride ONE snapshot — see `DocHistory.lastKey`. */
  coalesce?: string,
): EditorState => {
  const doc = activeDoc(s);
  const updated: StoredDoc = { ...doc, ...next };
  const history = s.histories[s.activeId] ?? emptyHistory();
  const nextSelection = selection ?? s.selection;
  const riding = push && coalesce !== undefined && history.lastKey === coalesce;
  const pushed: DocHistory = riding
    ? // The run's FIRST edit already pushed the state to step back to, so this one changes
      // nothing but the key it rides on. `future` is provably empty here — reaching this
      // branch means the previous action was a coalesced edit, and every push clears the
      // future — which is why the law about it is written about the reachable case (an undo
      // interrupts a run) rather than about a `future: []` nothing can observe.
      { past: history.past, future: history.future, lastKey: coalesce }
    : {
        past: [...history.past, { theme: doc.theme, roots: doc.roots, selection: s.selection }].slice(-HISTORY_DEPTH),
        future: [],
        ...(coalesce !== undefined ? { lastKey: coalesce } : {}),
      };
  return {
    ...s,
    docs: s.docs.map((d) => (d.id === updated.id ? updated : d)),
    selection: nextSelection,
    histories: {
      ...s.histories,
      // Anything that does not carry a key ends the run, so leaving a field and coming back
      // starts a new entry rather than extending the last one.
      [s.activeId]: push ? pushed : endRunIn(history),
    },
  };
};

/** One history with any run ended. */
const endRunIn = (history: DocHistory): DocHistory => {
  if (history.lastKey === undefined) return history;
  const rest: DocHistory = { ...history };
  delete rest.lastKey;
  return rest;
};

/** End a coalescing run without touching anything else — what a selection, an undo or a
    document switch does to a sentence somebody was in the middle of typing. */
const endRun = (s: EditorState): EditorState => {
  const history = s.histories[s.activeId];
  if (!history || history.lastKey === undefined) return s;
  return { ...s, histories: { ...s.histories, [s.activeId]: endRunIn(history) } };
};

/** Selection minus the ids a tree no longer holds — every edit runs it, so a deleted node
    can never stay selected and leave the inspector describing a ghost. */
const prune = (roots: BuilderNode[], selection: string[]): string[] =>
  selection.filter((id) => findNode(roots, id) !== null);

export function reducer(s: EditorState, a: Action): EditorState {
  switch (a.type) {
    case "select": {
      // A selection ends a typing run: the next keystroke is a different sentence.
      s = endRun(s);
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
    case "edit": {
      // Every edit passes here, so this is where a seat that came loose is put right — one
      // home rather than one per operation, and one that covers the operation somebody
      // writes next. Identity-preserving, so an untouched subtree still hands React the same
      // object and the interpreter's memo holds (see `normalizeSeats`).
      const roots = normalizeSeats(a.roots);
      return commit(s, { roots }, prune(roots, a.selection ?? s.selection), true, a.coalesce);
    }
    case "editSilent": {
      const roots = normalizeSeats(a.roots);
      return commit(s, { roots }, prune(roots, s.selection), false);
    }
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
      // Leaving a document ends its typing run, and a NEW document leaves one just as much
      // as switching does. The law found this second path: without it, typing here, opening
      // a document, coming back and typing again extended the snapshot from before the trip.
      s = a.select === false ? s : endRun(s);
      return {
        ...s,
        docs: [...s.docs, doc],
        activeId: a.select === false ? s.activeId : doc.id,
        selection: a.select === false ? s.selection : [],
        histories: { ...s.histories, [doc.id]: emptyHistory() },
      };
    }
    case "docSwitch": {
      if (!s.docs.some((d) => d.id === a.id)) return s;
      // A switch ends the typing run in the document being LEFT. The key lives per document,
      // so without this, leaving mid-sentence and coming back would extend a snapshot taken
      // before the switch — one undo reaching across a gap the person spent in another
      // document. (This line was a comment describing a repair it did not make, which is the
      // exact shape of the `sanitizeNode` tautology fixed the same night.)
      return { ...endRun(s), activeId: a.id, selection: [] };
    }
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
    case "blockSave": {
      // Saving under a name that is already taken REPLACES it. Appending gave two blocks
      // with one name and no way to tell them apart — and it is what closes the round trip
      // the "Open as document" route opens: edit the copy, save it back under the same
      // name, and the block is updated rather than duplicated.
      const at = s.blocks.findIndex((b) => b.name === a.block.name);
      if (at === -1) return { ...s, blocks: [...s.blocks, a.block] };
      return { ...s, blocks: s.blocks.map((b, i) => (i === at ? a.block : b)) };
    }
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

/** Every stored document passes through here, which is why the canvas migration lives here
    and nowhere else: a document saved before the canvas became a node has N roots, and is
    read back as those N inside one. A document saved after has exactly one root already and
    is left alone — checked by SHAPE (one root, of the canvas type) rather than by a version
    number, so a hand-edited or half-migrated file lands on its feet either way. */
const asCanvas = (roots: BuilderNode[]): BuilderNode[] => {
  const only = roots.length === 1 ? roots[0] : null;
  if (only && only.type === CANVAS_TYPE && only.children) return roots;
  return [canvasNode(roots)];
};

const reviveDoc = (d: Persisted["docs"][number]): StoredDoc => ({
  id: d.id || newDocId(),
  name: String(d.name || "Untitled"),
  theme: { ...defaultDocTheme(), ...d.theme },
  roots: asCanvas(
    (d.roots ?? []).map((n) => sanitizeNode(n)).filter((n): n is BuilderNode => n !== null),
  ).map(cloneWithNewIds),
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
