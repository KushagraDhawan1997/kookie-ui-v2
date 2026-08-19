/**
 * Every editor action, as DATA (2026-08-20) — ENGINEERING §1.1 applied to behaviour the way
 * `catalog.ts` applies it to components. One row per command, and the three surfaces that
 * invoke commands are renderers over this table:
 *
 *   keyboard   → matches `chord`
 *   ⌘K palette → lists `title` + `group`, filtered by `enabled`
 *   context menu → the same rows, scoped to the selection
 *
 * That is the whole reason the table exists. Before it, "duplicate" lived in a button's
 * onClick, and giving it a shortcut meant writing the logic again in a keydown handler —
 * two spellings of one action, the entropy this repo keeps paying for. A command's logic
 * has exactly one home, and a surface that cannot reach it is a surface that did not ask.
 *
 * Commands never touch the DOM. What they cannot express as a dispatch (open a dialog, put
 * text on the clipboard) they ask of `ctx.ui`, which the app owns.
 */

import { CATALOG, canContain } from "./catalog";
import {
  cloneWithNewIds,
  findNode,
  findParent,
  insertNode,
  moveNode,
  moveNodeTo,
  removeNode,
  unwrapNode,
  wrapNodes,
  type BuilderNode,
} from "./model";
import { canUnwrap, canWrap, insertionTarget, typesThrough } from "./placement";
import {
  activeDoc,
  canRedo,
  canUndo,
  primaryId,
  primaryNode,
  selectedNodes,
  type Action,
  type EditorState,
} from "./store";

/* ── Chords ────────────────────────────────────────────────────────────────────────────
   "mod" is ⌘ on Apple and Ctrl elsewhere — one spelling, both platforms, decided by the
   PLATFORM rather than by which key the user happened to hold. */

export type Chord = string;

const isApple = (): boolean =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export const chordMatches = (chord: Chord, e: KeyboardEvent): boolean => {
  const parts = chord.toLowerCase().split("+");
  const key = parts[parts.length - 1]!;
  const want = {
    mod: parts.includes("mod"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt"),
  };
  const mod = isApple() ? e.metaKey : e.ctrlKey;
  // The OTHER modifier must be absent, or ⌃D on a Mac would fire ⌘D's command.
  const otherMod = isApple() ? e.ctrlKey : e.metaKey;
  if (otherMod) return false;
  if (mod !== want.mod || e.shiftKey !== want.shift || e.altKey !== want.alt) return false;
  return e.key.toLowerCase() === key;
};

const GLYPH: Record<string, string> = {
  mod: "⌘",
  shift: "⇧",
  alt: "⌥",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  backspace: "⌫",
  enter: "↩",
  escape: "esc",
  " ": "space",
};

/** The chord as a person reads it — ⌘⇧D on Apple, Ctrl+Shift+D elsewhere. */
export const chordLabel = (chord: Chord): string => {
  const apple = isApple();
  return chord
    .split("+")
    .map((p) => {
      const key = p.toLowerCase();
      if (key === "mod") return apple ? "⌘" : "Ctrl";
      if (!apple && (key === "shift" || key === "alt")) return key === "shift" ? "Shift" : "Alt";
      return GLYPH[key] ?? (key.length === 1 ? key.toUpperCase() : key);
    })
    .join(apple ? "" : "+");
};

/* ── The clipboard ─────────────────────────────────────────────────────────────────────
   Subtrees travel as a JSON envelope on the SYSTEM clipboard, so a copy crosses documents,
   tabs and windows; an in-memory buffer backs it up for the paths where reading the system
   clipboard needs a permission the browser will not grant without a gesture. */

const CLIP_KIND = "kookie-builder/nodes";
type Envelope = { kind: typeof CLIP_KIND; nodes: BuilderNode[] };

let buffer: BuilderNode[] = [];

export const encodeNodes = (nodes: BuilderNode[]): string =>
  JSON.stringify({ kind: CLIP_KIND, nodes } satisfies Envelope, null, 2);

export const decodeNodes = (text: string): BuilderNode[] | null => {
  try {
    const parsed = JSON.parse(text) as Envelope;
    if (parsed?.kind !== CLIP_KIND || !Array.isArray(parsed.nodes)) return null;
    return parsed.nodes;
  } catch {
    return null;
  }
};

export const setBuffer = (nodes: BuilderNode[]): void => {
  buffer = nodes.map(cloneWithNewIds);
};
export const readBuffer = (): BuilderNode[] => buffer.map(cloneWithNewIds);
export const bufferHasContent = (): boolean => buffer.length > 0;

/* ── The context a command runs against ───────────────────────────────────────────────── */

export type CommandUi = {
  openPalette: () => void;
  openExport: () => void;
  openShortcuts: () => void;
  openDocuments: () => void;
  toggleReview: () => void;
  togglePreview: () => void;
  writeClipboard: (text: string) => void;
  /** Ask the system clipboard for a paste; resolves null when it holds nothing we wrote. */
  readClipboard: () => Promise<BuilderNode[] | null>;
  focusInspectorText: () => void;
  saveBlockFromSelection: () => void;
  /** Blocks live in state, but placing one is the app's insertion path. */
  insertBlockByIndex: (index: number) => void;
  downloadDocument: () => void;
  importDocument: () => void;
};

export type CommandContext = {
  state: EditorState;
  dispatch: (a: Action) => void;
  ui: CommandUi;
};

export type CommandGroup = "Edit" | "Arrange" | "Insert" | "Select" | "Document" | "View";

export type Command = {
  id: string;
  title: string;
  group: CommandGroup;
  chord?: Chord;
  /** Extra words the palette should match on — "row" finding "Wrap in Flex". */
  keywords?: string;
  enabled: (ctx: CommandContext) => boolean;
  run: (ctx: CommandContext) => void;
};

/* ── Helpers shared by several commands ────────────────────────────────────────────────── */

const roots = (ctx: CommandContext) => activeDoc(ctx.state).roots;
const hasSelection = (ctx: CommandContext) => ctx.state.selection.length > 0;

/** Insert nodes where the selection says, selecting the first arrival. */
const insertNodes = (ctx: CommandContext, nodes: BuilderNode[]): void => {
  if (nodes.length === 0) return;
  let next = roots(ctx);
  const placed: string[] = [];
  for (const n of nodes) {
    const target = insertionTarget(next, primaryId(ctx.state), n.type);
    if (!target) continue;
    const fresh = cloneWithNewIds(n);
    next = insertNode(next, target.parentId, fresh, target.index);
    placed.push(fresh.id);
  }
  if (placed.length) ctx.dispatch({ type: "edit", roots: next, selection: placed });
};

const wrapIn = (ctx: CommandContext, type: string): void => {
  const ids = ctx.state.selection;
  const wrapper = CATALOG[type]!.make();
  // A wrapper's PRESET children would arrive as a bonus nobody asked for.
  const empty: BuilderNode = { ...wrapper, children: [] };
  ctx.dispatch({ type: "edit", roots: wrapNodes(roots(ctx), ids, empty), selection: [empty.id] });
};

/** Which layout wrappers make sense to offer, in the order a composition reaches for them. */
export const WRAPPERS = ["Stack", "Flex", "Box", "Card", "Grid"] as const;

/* ── The table ─────────────────────────────────────────────────────────────────────────── */

export const COMMANDS: Command[] = [
  /* Edit */
  {
    id: "undo",
    title: "Undo",
    group: "Edit",
    chord: "mod+z",
    enabled: (c) => canUndo(c.state),
    run: (c) => c.dispatch({ type: "undo" }),
  },
  {
    id: "redo",
    title: "Redo",
    group: "Edit",
    chord: "mod+shift+z",
    enabled: (c) => canRedo(c.state),
    run: (c) => c.dispatch({ type: "redo" }),
  },
  {
    id: "duplicate",
    title: "Duplicate",
    group: "Edit",
    chord: "mod+d",
    enabled: hasSelection,
    run: (c) => {
      let next = roots(c);
      const made: string[] = [];
      for (const n of selectedNodes(c.state)) {
        const parent = findParent(next, n.id);
        const siblings = parent ? (parent.children ?? []) : next;
        const at = siblings.findIndex((x) => x.id === n.id) + 1;
        const copy = cloneWithNewIds(n);
        next = insertNode(next, parent?.id ?? null, copy, at);
        made.push(copy.id);
      }
      c.dispatch({ type: "edit", roots: next, selection: made });
    },
  },
  {
    id: "delete",
    title: "Delete",
    group: "Edit",
    chord: "backspace",
    enabled: hasSelection,
    run: (c) => {
      let next = roots(c);
      for (const id of c.state.selection) next = removeNode(next, id);
      c.dispatch({ type: "edit", roots: next, selection: [] });
    },
  },
  {
    id: "copy",
    title: "Copy",
    group: "Edit",
    chord: "mod+c",
    enabled: hasSelection,
    run: (c) => {
      const nodes = selectedNodes(c.state);
      setBuffer(nodes);
      c.ui.writeClipboard(encodeNodes(nodes));
    },
  },
  {
    id: "cut",
    title: "Cut",
    group: "Edit",
    chord: "mod+x",
    enabled: hasSelection,
    run: (c) => {
      const nodes = selectedNodes(c.state);
      setBuffer(nodes);
      c.ui.writeClipboard(encodeNodes(nodes));
      let next = roots(c);
      for (const id of c.state.selection) next = removeNode(next, id);
      c.dispatch({ type: "edit", roots: next, selection: [] });
    },
  },
  {
    id: "paste",
    title: "Paste",
    group: "Edit",
    chord: "mod+v",
    enabled: () => bufferHasContent(),
    run: (c) => {
      void c.ui.readClipboard().then((fromSystem) => {
        const nodes = fromSystem ?? readBuffer();
        insertNodes(c, nodes);
      });
    },
  },
  {
    id: "editText",
    title: "Edit text",
    group: "Edit",
    chord: "enter",
    keywords: "rename label content",
    enabled: (c) => {
      const n = primaryNode(c.state);
      return Boolean(n && CATALOG[n.type]?.children === "text");
    },
    run: (c) => c.ui.focusInspectorText(),
  },

  /* Arrange */
  {
    id: "moveUp",
    title: "Move up",
    group: "Arrange",
    chord: "mod+alt+arrowup",
    keywords: "reorder earlier before",
    enabled: (c) => c.state.selection.length === 1,
    run: (c) => c.dispatch({ type: "edit", roots: moveNode(roots(c), primaryId(c.state)!, -1) }),
  },
  {
    id: "moveDown",
    title: "Move down",
    group: "Arrange",
    chord: "mod+alt+arrowdown",
    keywords: "reorder later after",
    enabled: (c) => c.state.selection.length === 1,
    run: (c) => c.dispatch({ type: "edit", roots: moveNode(roots(c), primaryId(c.state)!, 1) }),
  },
  {
    id: "outdent",
    title: "Move out of container",
    group: "Arrange",
    chord: "mod+alt+arrowleft",
    keywords: "promote unnest parent",
    enabled: (c) => {
      const id = primaryId(c.state);
      if (!id || c.state.selection.length !== 1) return false;
      const parent = findParent(roots(c), id);
      if (!parent) return false;
      const grand = findParent(roots(c), parent.id);
      const node = findNode(roots(c), id)!;
      return canWrapInto(roots(c), grand?.id ?? null, node.type);
    },
    run: (c) => {
      const id = primaryId(c.state)!;
      const parent = findParent(roots(c), id)!;
      const grand = findParent(roots(c), parent.id);
      const siblings = grand ? (grand.children ?? []) : roots(c);
      const at = siblings.findIndex((x) => x.id === parent.id) + 1;
      c.dispatch({ type: "edit", roots: moveNodeTo(roots(c), id, grand?.id ?? null, at) });
    },
  },
  {
    id: "indent",
    title: "Move into previous",
    group: "Arrange",
    chord: "mod+alt+arrowright",
    keywords: "demote nest sibling",
    enabled: (c) => {
      const id = primaryId(c.state);
      if (!id || c.state.selection.length !== 1) return false;
      const prev = previousSibling(roots(c), id);
      const node = findNode(roots(c), id)!;
      return Boolean(prev && canWrapInto(roots(c), prev.id, node.type));
    },
    run: (c) => {
      const id = primaryId(c.state)!;
      const prev = previousSibling(roots(c), id)!;
      c.dispatch({ type: "edit", roots: moveNodeTo(roots(c), id, prev.id) });
    },
  },
  ...WRAPPERS.map(
    (type): Command => ({
      id: `wrapIn${type}`,
      title: `Wrap in ${type}`,
      group: "Arrange",
      ...(type === "Stack" ? { chord: "mod+shift+g" } : {}),
      keywords: type === "Flex" ? "row group" : type === "Stack" ? "column group" : "group",
      enabled: (c) => hasSelection(c) && canWrap(roots(c), c.state.selection, type),
      run: (c) => wrapIn(c, type),
    }),
  ),
  {
    id: "unwrap",
    title: "Unwrap",
    group: "Arrange",
    chord: "mod+shift+u",
    keywords: "dissolve remove container ungroup",
    enabled: (c) => {
      const id = primaryId(c.state);
      return Boolean(id && c.state.selection.length === 1 && canUnwrap(roots(c), id));
    },
    run: (c) => {
      const id = primaryId(c.state)!;
      const kids = (findNode(roots(c), id)?.children ?? []).map((k) => k.id);
      c.dispatch({ type: "edit", roots: unwrapNode(roots(c), id), selection: kids });
    },
  },

  /* Select */
  {
    id: "selectParent",
    title: "Select parent",
    group: "Select",
    chord: "escape",
    enabled: (c) => Boolean(primaryId(c.state)),
    run: (c) => c.dispatch({ type: "selectParent" }),
  },
  {
    id: "selectChild",
    title: "Select first child",
    group: "Select",
    chord: "arrowright",
    enabled: (c) => Boolean(primaryNode(c.state)?.children?.length),
    run: (c) => c.dispatch({ type: "selectChild" }),
  },
  {
    id: "selectPrev",
    title: "Select previous",
    group: "Select",
    chord: "arrowup",
    enabled: () => true,
    run: (c) => c.dispatch({ type: "selectStep", delta: -1 }),
  },
  {
    id: "selectNext",
    title: "Select next",
    group: "Select",
    chord: "arrowdown",
    enabled: () => true,
    run: (c) => c.dispatch({ type: "selectStep", delta: 1 }),
  },
  {
    id: "selectSiblings",
    title: "Select all siblings",
    group: "Select",
    chord: "mod+a",
    enabled: (c) => Boolean(primaryId(c.state)),
    run: (c) => {
      const id = primaryId(c.state)!;
      const parent = findParent(roots(c), id);
      const siblings = parent ? (parent.children ?? []) : roots(c);
      c.dispatch({ type: "select", ids: siblings.map((n) => n.id) });
    },
  },
  {
    id: "deselect",
    title: "Deselect",
    group: "Select",
    enabled: hasSelection,
    run: (c) => c.dispatch({ type: "select", ids: [] }),
  },

  /* Document */
  {
    id: "newDocument",
    title: "New document",
    group: "Document",
    chord: "mod+n",
    enabled: () => true,
    run: (c) => c.dispatch({ type: "docNew" }),
  },
  {
    id: "duplicateDocument",
    title: "Duplicate document",
    group: "Document",
    enabled: () => true,
    run: (c) => c.dispatch({ type: "docDuplicate", id: c.state.activeId }),
  },
  {
    id: "deleteDocument",
    title: "Delete document",
    group: "Document",
    enabled: (c) => c.state.docs.length > 1,
    run: (c) => c.dispatch({ type: "docDelete", id: c.state.activeId }),
  },
  {
    id: "documents",
    title: "Switch document…",
    group: "Document",
    chord: "mod+p",
    enabled: (c) => c.state.docs.length > 1,
    run: (c) => c.ui.openDocuments(),
  },
  {
    id: "export",
    title: "Export code",
    group: "Document",
    chord: "mod+e",
    keywords: "jsx copy react",
    enabled: () => true,
    run: (c) => c.ui.openExport(),
  },
  {
    id: "download",
    title: "Download document (JSON)",
    group: "Document",
    keywords: "save file backup",
    enabled: () => true,
    run: (c) => c.ui.downloadDocument(),
  },
  {
    id: "import",
    title: "Open document (JSON)…",
    group: "Document",
    keywords: "upload load file",
    enabled: () => true,
    run: (c) => c.ui.importDocument(),
  },
  {
    id: "saveBlock",
    title: "Save selection as block",
    group: "Document",
    chord: "mod+b",
    keywords: "component reuse library",
    enabled: (c) => c.state.selection.length === 1,
    run: (c) => c.ui.saveBlockFromSelection(),
  },

  /* View */
  {
    id: "preview",
    title: "Toggle preview",
    group: "View",
    chord: "mod+shift+p",
    keywords: "interact test run play",
    enabled: () => true,
    run: (c) => c.ui.togglePreview(),
  },
  {
    id: "review",
    title: "Toggle review",
    group: "View",
    chord: "mod+shift+r",
    keywords: "audit lint issues composition",
    enabled: () => true,
    run: (c) => c.ui.toggleReview(),
  },
  {
    id: "palette",
    title: "Command palette",
    group: "View",
    chord: "mod+k",
    enabled: () => true,
    run: (c) => c.ui.openPalette(),
  },
  {
    id: "shortcuts",
    title: "Keyboard shortcuts",
    group: "View",
    chord: "mod+/",
    keywords: "keys help",
    enabled: () => true,
    run: (c) => c.ui.openShortcuts(),
  },
];

/** The previous sibling of a node, or null when it is first. */
function previousSibling(list: BuilderNode[], id: string): BuilderNode | null {
  const parent = findParent(list, id);
  const siblings = parent ? (parent.children ?? []) : list;
  const i = siblings.findIndex((n) => n.id === id);
  return i > 0 ? siblings[i - 1]! : null;
}

/** Would `type` be legal directly inside `parentId` (null = document root)? */
function canWrapInto(list: BuilderNode[], parentId: string | null, type: string): boolean {
  const chain = parentId ? typesThrough(list, parentId) : [];
  const parentType = parentId ? (findNode(list, parentId)?.type ?? null) : null;
  return canContain(parentType, type, chain);
}

/** Insertable components for the palette, gated by the grammar at the current selection. */
export const insertCommands = (ctx: CommandContext): Command[] =>
  Object.entries(CATALOG)
    .filter(([, entry]) => !entry.partOf || entry.requiresAncestor)
    .map(([type, entry]): Command => ({
      id: `insert:${type}`,
      title: `Insert ${type}`,
      group: "Insert",
      keywords: entry.blurb,
      enabled: (c) => insertionTarget(activeDoc(c.state).roots, primaryId(c.state), type) !== null,
      run: (c) => {
        const target = insertionTarget(activeDoc(c.state).roots, primaryId(c.state), type)!;
        const fresh = CATALOG[type]!.make();
        c.dispatch({
          type: "edit",
          roots: insertNode(activeDoc(c.state).roots, target.parentId, fresh, target.index),
          selection: [fresh.id],
        });
      },
    }))
    .filter((cmd) => cmd.enabled(ctx));

/** Every command a surface may offer right now, insertables included. */
export const allCommands = (ctx: CommandContext): Command[] => [...COMMANDS, ...insertCommands(ctx)];

/** Fuzzy-ish match: every typed word must appear in the haystack, in any order. Deliberately
    not a scored fuzzy matcher — a palette that reorders under you is a palette you cannot
    build muscle memory for. */
export const matches = (cmd: Command, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = `${cmd.title} ${cmd.group} ${cmd.keywords ?? ""}`.toLowerCase();
  return q.split(/\s+/).every((word) => hay.includes(word));
};
