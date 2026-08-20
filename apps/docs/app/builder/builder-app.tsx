"use client";

/**
 * The builder (2026-08-19): a constrained composition editor over @kookie-ui/react. Not a
 * freeform canvas — the canvas is a LIVE render of the real component tree inside a real
 * <Theme>, and every gesture is tree surgery: insert into a container, reorder, retune an
 * axis. Nothing here can state a value the system would refuse, because the palette, the
 * inspector and the drop rules all derive from the catalog, and the catalog derives from
 * the package.
 *
 * The chrome is @kookie-ui/react end to end (the docs' own stance: a builder for the
 * system not built from the system argues against itself). The two exceptions are editor
 * instruments, not UI: the selection ring (a token-coloured overlay) and the tree indent
 * (a per-depth inset), both stated in `style` — §13's escape, spelled where review sees it.
 *
 * Truth is memory; storage is persistence (the docs' storage-denied lesson). The document
 * and blocks live in state, are written through to localStorage best-effort, and load
 * sanitized against today's catalog.
 */

import * as React from "react";
import Link from "next/link";

import {
  Box,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  Grid,
  Heading,
  Kbd,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  ScrollArea,
  Separator,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
  TextField,
  Theme,
  tiers,
} from "@kookie-ui/react";

import { RedoIcon, UndoIcon, XIcon } from "../icons";
import { CATALOG, canContain, gapStepsFor, paletteEntries, sanitizeNode, seatVocabularyFor, sizeStepsFor, PALETTE_FAMILIES, type CatalogEntry, type SeatVocabulary } from "./catalog";
import {
  cloneWithNewIds,
  defaultDocTheme,
  findNode,
  matchingIds,
  findParent,
  insertNode,
  moveNodeTo,
  node,
  removeNode,
  setSlot,
  updateProps,
  updatePropsMany,
  updateText,
  withStableIds,
  type BuilderDoc,
  type BuilderNode,
  type DocTheme,
} from "./model";
import { dropSpot, rowsOf } from "./geometry";
import { canAccept, insertableInto, insertionTarget, placeNodes, typesThrough } from "./placement";
import { renderNode } from "./render";
import { deriveParams, serializeBlock, serializeDocument } from "./serialize";
import { TEMPLATES, templateDoc } from "./templates";
import { Inspector, MultiInspector, ThemePanel } from "./inspector";
import {
  activeDoc,
  canRedo,
  canUndo,
  initialState,
  loadState,
  makeDoc,
  primaryId,
  primaryNode,
  reducer,
  saveState,
  type Block,
} from "./store";
import {
  COMMANDS,
  chordLabel,
  chordMatches,
  decodeNodes,
  encodeNodes,
  setBuffer,
  type CommandContext,
  type CommandUi,
} from "./commands";
import { CommandPalette } from "./command-palette";
import { reviewDocument, type Finding } from "./review";
import { ReviewPanel } from "./review-panel";
import { Breadcrumb, CanvasBoundary, ContextMenu, DocumentBar, ShortcutSheet, TemplatePicker, Toast } from "./chrome";

/** The rungs the magnifier steps through — a closed list, like everything else here. */
const ZOOMS: number[] = [0.5, 0.67, 0.8, 1, 1.25, 1.5, 2];

const DRAG_TYPE = "application/x-kookie-component";
const MOVE_TYPE = "application/x-kookie-move";

/* Selection chrome (Figma's grammar): a shape outline tracing the element's own corners,
   a square-cornered bounding box, a size chip, and corner handles WHERE THE NODE CAN
   ACTUALLY RESIZE — a handle that writes nothing is the lie this file already deleted once.
   Purple on purpose: the one hue no token in the system uses, so selection can never be
   read as focus. */
const SEL_COLOR = "#a855f7";
/** How far a gap band pulls back on every side. Capped per axis at a quarter of that
    dimension, so a hairline gutter still shows a band rather than insetting itself away. */
const GAP_BAND_INSET = 6;
/** The floor a gap band's HIT area grows to. The paint stays the true gutter minus its
    inset; the target does not, because the bottom of the space scale paints a hairline. */
const GAP_BAND_HIT = 11;

type DragPayload ={ kind: "insert"; type: string } | { kind: "move"; id: string } | { kind: "block"; index: number };

/** A resolved drop: tree coordinates plus the instrument that shows them — the gap line,
    or (for an empty container) the dashed box on `boxId`. */
type DropSpot = {
  parentId: string | null;
  index: number;
  line: { x: number; y: number; w: number; h: number } | null;
  boxId: string | null;
};

/** The tier boundaries in px, DERIVED from the package's own table (rem at the 16px root),
    for the width handle's readout. The canvas is a real query container, so the readout is
    a label on real behaviour, not a simulation. */
const TIER_PX = Object.entries(tiers).map(([name, rem]) => [name, parseFloat(rem) * 16] as const);
const activeTier = (w: number): string => {
  let current = "initial";
  for (const [name, px] of TIER_PX) if (w >= px) current = name;
  return current;
};

/** The starter document: enough to show the idea the second the page opens. Ids are the
    STABLE set — this tree is built during render on both server and client, where the
    module counter is not safe (see withStableIds). */
export const starterDoc = (): BuilderDoc => ({
  theme: defaultDocTheme(),
  roots: withStableIds([
    node("Card", { size: "3" }, {
      children: [
        node("Stack", { gap: "5" }, {
          children: [
            node("Stack", { gap: "2" }, {
              children: [
                node("Heading", { size: "6" }, { text: "Rename project" }),
                node("Text", { size: "2", emphasis: "medium" }, { text: "Everyone with access will see the new name." }),
              ],
            }),
            node("TextField", { placeholder: "Project name", "aria-label": "Project name" }),
            node("Flex", { gap: "3", justify: "flex-end" }, {
              children: [
                node("Button", { emphasis: "quiet", bordered: true }, { text: "Cancel" }),
                node("Button", { tone: "accent", emphasis: "loud" }, { text: "Save" }),
              ],
            }),
          ],
        }),
      ],
    }),
  ]),
});



export function BuilderApp() {
  const [state, dispatch] = React.useReducer(reducer, undefined, () =>
    initialState(makeDoc("Untitled", starterDoc())),
  );
  /** The live state, for the pointer gestures: a drag reads the document on every frame,
      and the value captured when the gesture began goes stale on its first commit. */
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const [blockName, setBlockName] = React.useState("");
  const [drop, setDrop] = React.useState<DropSpot | null>(null);
  /** Where a drag is hovering in the Layers tree: on a row, and WHERE on it. The thirds are
      the tree convention every file browser uses — the edges mean "between", the middle means
      "inside" — and they are what make the tree a rearrangement surface rather than a list of
      shortcuts. */
  const [dropRow, setDropRow] = React.useState<{ id: string; mode: "before" | "into" | "after" } | null>(null);
  /** What is being dragged, held in a ref because HTML5 DnD only surfaces payload DATA on
      drop — during dragover only the type names are readable, and the grammar needs the
      component type to say yes or no while hovering. Same-window drags own this fully. */
  const dragRef = React.useRef<DragPayload | null>(null);
  const [copied, setCopied] = React.useState(false);
  /** null = full width. A dragged width makes the canvas narrower than its column, and
      because the canvas is a container, every per-tier value inside responds for real. */
  const [canvasW, setCanvasW] = React.useState<number | null>(null);
  /* The editor's own modes. Preview hands the canvas back to the components: no stamps, no
     drag, no selection — the screen you built, actually usable. */
  const [preview, setPreview] = React.useState(false);
  /**
   * The canvas magnifier (2026-08-20). CSS `zoom` rather than a transform, and the choice is
   * what keeps every instrument honest: `zoom` participates in LAYOUT, so the scaled box's
   * own height is right and the overlays — the selection ring, the gap bands, the insertion
   * line — sit OUTSIDE it, unscaled. Their coordinates are screen deltas measured against an
   * unscaled parent, which is exactly what they were before, so not one of those measurements
   * changes. A transform would have left the layout box unscaled and put the overlays inside
   * the scaled space, where every rect would need dividing and every law re-deriving.
   *
   * It is a magnifying glass, not a resize: a `width: 880px` canvas at 50% paints 440 device
   * pixels and still measures 880 CSS pixels, so the container tiers answer the same thing
   * they will answer in an app. That is the property that makes zooming safe here.
   */
  const [zoom, setZoom] = React.useState(1);
  /** The pointer handlers are bound once per gesture and read the CURRENT zoom. */
  const zoomRef = React.useRef(zoom);
  zoomRef.current = zoom;
  /** The Layers filter. It hides rather than dims: a tree you have to read past is a tree
      that costs more than it saves. Ancestors of a match stay, because a match with its path
      cut off is a match nobody can place. */
  const [layerFilter, setLayerFilter] = React.useState("");
  const layerFilterRef = React.useRef<HTMLInputElement | null>(null);
  /** The left pane is controlled so ⌘F can bring the tree forward before focusing it. */
  const [leftTab, setLeftTab] = React.useState("add");
  /** The key listener is mounted once and never re-bound, so it needs the CURRENT mode
      rather than the one that was true when it was attached. */
  const previewRef = React.useRef(preview);
  previewRef.current = preview;
  /** The tiers view: the same document in several rooms at once. Honest here in a way it is
      not in a viewport-keyed system — the tiers are CONTAINER queries, so four boxes on one
      screen resolve four different answers for real, with no emulation anywhere. */
  const [tiersView, setTiersView] = React.useState(false);
  /** The right panel's tab is state, not a derived guess: Base UI warns (correctly) when a
      controlled value flips to undefined, and "is review open" is the same question as
      "which tab is showing". */
  const [rightTab, setRightTab] = React.useState<"inspect" | "theme" | "review">("inspect");
  const reviewOpen = rightTab === "review";
  const setReviewOpen = React.useCallback(
    (next: boolean | ((v: boolean) => boolean)) =>
      setRightTab((tab) => {
        const want = typeof next === "function" ? next(tab === "review") : next;
        return want ? "review" : tab === "review" ? "inspect" : tab;
      }),
    [],
  );
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  /** Which block the export dialog is showing, or null for the whole document. */
  const [exportBlock, setExportBlock] = React.useState<number | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  /** Where a right-click landed, and therefore where the context menu anchors. */
  const [contextPoint, setContextPoint] = React.useState<{ x: number; y: number } | null>(null);

  const doc = activeDoc(state);
  const blocks = state.blocks;
  const selection = primaryId(state);
  const selected = primaryNode(state);
  /** Every selected node, in selection order. The store prunes deleted ids, so a null here
      would be a store bug rather than an ordinary state — filtered anyway, because the
      panel reading it must not be the thing that throws. */
  const visibleRows = React.useMemo(() => matchingIds(doc.roots, layerFilter), [doc.roots, layerFilter]);

  const selectedNodes = React.useMemo(
    () => state.selection.map((id) => findNode(doc.roots, id)).filter((n): n is BuilderNode => n !== null),
    [state.selection, doc.roots],
  );

  const setSelection = React.useCallback(
    (id: string | null, additive = false) =>
      dispatch({ type: "select", ids: id ? [id] : [], additive: additive && id !== null }),
    [],
  );
  const commitRoots = React.useCallback(
    (roots: BuilderNode[], nextSelection?: string[], coalesce?: string) =>
      dispatch({
        type: "edit",
        roots,
        ...(nextSelection ? { selection: nextSelection } : {}),
        ...(coalesce ? { coalesce } : {}),
      }),
    [],
  );
  const undo = React.useCallback(() => dispatch({ type: "undo" }), []);
  const redo = React.useCallback(() => dispatch({ type: "redo" }), []);

  const say = React.useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((t) => (t === message ? null : t)), 2200);
  }, []);

  /* Storage: load once after mount — the server rendered the starter, and hydration must
     match that branch before anything replaces it. Everything read is sanitized against
     today's catalog and re-minted, so an older vocabulary loads as the part of it the
     system still speaks. */
  React.useEffect(() => {
    const stored = loadState("Untitled");
    if (stored) dispatch({ type: "hydrate", state: stored });
  }, []);
  /* The write-through must not run before the load has landed. Both effects fire on mount in
     declaration order, so an unguarded write saved the STARTER document — the value this
     render still holds — straight over the stored one; under StrictMode's double-invocation
     the second pass then read that starter back, and a reload lost the document outright
     (measured: two roots before, one after). Guarding on the initial state's IDENTITY is
     what makes it safe on both passes: there is nothing to persist until the editor stops
     being the one nobody has touched. */
  const untouched = React.useRef(state);
  React.useEffect(() => {
    if (state === untouched.current) return;
    // WRITE-BEHIND. Persisting on every keystroke means serializing the whole document per
    // character — measured at 280 nodes it was a third of the typing cost — and storage was
    // never the truth anyway, so it can land a moment later. The timer is cleared by the
    // next change, so a burst of typing writes once.
    const timer = window.setTimeout(() => saveState(state), 400);
    return () => window.clearTimeout(timer);
  }, [state]);

  /* ── The keyboard, as a renderer over the command table ───────────────────────────────
     One listener; the chords live beside the actions they run, so a shortcut cannot drift
     from what the palette says it does. A field keeps its own keys: an editor that steals
     ⌘A while you are selecting a placeholder is an editor nobody can type in — except the
     ⌘K/⌘E class, which is global on purpose (the palette must open from anywhere). */
  const ctxRef = React.useRef<CommandContext | null>(null);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const t = e.target as HTMLElement | null;
      const typing = Boolean(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable));
      for (const cmd of COMMANDS) {
        if (!cmd.chord || !chordMatches(cmd.chord, e)) continue;
        // A chord the browser delivers as its own event: step aside entirely, because
        // cancelling the keydown is what would suppress that event (see `viaEvent`).
        if (cmd.viaEvent) return;
        if (typing && !cmd.global) return;
        // Preview is the screen, not the editor. Every editing chord stays armed otherwise —
        // measured: with a canvas checkbox focused (Base UI draws one as a <button>, so the
        // typing guard does not see it), Backspace deleted the selected node with no ring,
        // no toast and nothing on screen to say it had happened.
        if (previewRef.current && !cmd.global) return;
        if (!cmd.enabled(ctx)) return;
        e.preventDefault();
        cmd.run(ctx);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Copy / cut / paste ride the real clipboard EVENTS rather than the async clipboard API:
     the events hand over `clipboardData` with no permission prompt and no gesture rules, so
     a subtree crosses documents, tabs and windows as ordinary JSON. */
  React.useEffect(() => {
    const inField = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return Boolean(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable));
    };
    const onCopy = (e: ClipboardEvent, cut: boolean) => {
      const ctx = ctxRef.current;
      if (!ctx || inField(e.target) || ctx.state.selection.length === 0) return;
      // CUT edits; copy does not. Preview refuses the one that does, for the same reason the
      // key handler refuses every editing chord: the mode draws no selection, so a structural
      // edit there is invisible. Measured before this guard: ⌘X in preview removed the
      // selected node with nothing on screen but a toast — and the preview law could not see
      // it, because the clipboard rides the browser's own events rather than the command
      // table the law walks.
      if (cut && previewRef.current) return;
      const nodes = ctx.state.selection
        .map((id) => findNode(activeDoc(ctx.state).roots, id))
        .filter((n): n is BuilderNode => n !== null);
      if (nodes.length === 0) return;
      e.preventDefault();
      e.clipboardData?.setData("text/plain", encodeNodes(nodes));
      setBuffer(nodes);
      if (cut) {
        let next = activeDoc(ctx.state).roots;
        for (const id of ctx.state.selection) next = removeNode(next, id);
        dispatch({ type: "edit", roots: next, selection: [] });
      }
      say(cut ? `Cut ${nodes.length === 1 ? nodes[0]!.type : `${nodes.length} items`}` : `Copied ${nodes.length === 1 ? nodes[0]!.type : `${nodes.length} items`}`);
    };
    const onPaste = (e: ClipboardEvent) => {
      const ctx = ctxRef.current;
      if (!ctx || inField(e.target) || previewRef.current) return;
      const text = e.clipboardData?.getData("text/plain") ?? "";
      const nodes = decodeNodes(text);
      if (!nodes || nodes.length === 0) return;
      e.preventDefault();
      const { roots: next, placed } = placeNodes(activeDoc(ctx.state).roots, primaryId(ctx.state), nodes);
      if (placed.length === 0) {
        say("Nothing here accepts that");
        return;
      }
      dispatch({ type: "edit", roots: next, selection: placed });
    };
    const copy = (e: ClipboardEvent) => onCopy(e, false);
    const cut = (e: ClipboardEvent) => onCopy(e, true);
    window.addEventListener("copy", copy);
    window.addEventListener("cut", cut);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("copy", copy);
      window.removeEventListener("cut", cut);
      window.removeEventListener("paste", onPaste);
    };
  }, [say]);

  /* ── Gestures ────────────────────────────────────────────────────────────────────── */

  const insertType = (type: string) => {
    const target = insertionTarget(doc.roots, selection, type);
    if (!target) return;
    const fresh = CATALOG[type]!.make();
    commitRoots(insertNode(doc.roots, target.parentId, fresh, target.index), [fresh.id]);
  };

  const insertBlock = (block: Block) => {
    const fresh = cloneWithNewIds(block.node);
    const target = insertionTarget(doc.roots, selection, fresh.type) ?? { parentId: null };
    commitRoots(insertNode(doc.roots, target.parentId, fresh, target.index), [fresh.id]);
  };

  /** A block, opened as its own document so it can be edited. Fresh ids, because editing the
      copy must not reach into the block itself or into any screen the block was placed in. */
  const openBlock = (block: Block) => {
    dispatch({
      type: "docNew",
      name: block.name,
      doc: { theme: doc.theme, roots: [cloneWithNewIds(block.node)] },
    });
    say(`Opened ${block.name} — save it under the same name to update the block`);
  };

  const runCommand = (id: string) => {
    const ctx = ctxRef.current;
    const cmd = COMMANDS.find((c) => c.id === id);
    if (ctx && cmd && cmd.enabled(ctx)) cmd.run(ctx);
  };

  /** The TYPED path keeps replace-by-name — that is the route "open a block, edit it, save it
      back" runs through — but it says which of the two happened, because a save that quietly
      overwrote something is a save nobody can audit. */
  const saveBlock = () => {
    if (!selected || !blockName.trim()) return;
    const name = blockName.trim();
    const replaced = state.blocks.some((b) => b.name === name);
    dispatch({ type: "blockSave", block: { name, node: cloneWithNewIds(selected) } });
    setBlockName("");
    say(`${replaced ? "Replaced" : "Saved"} “${name}”`);
  };

  /* ── Drag and drop: ONE mechanism for palette inserts, block inserts and moves ─────
     A drop names a (parent, index) in the tree, never a coordinate. The index comes from
     geometry — which sibling midpoints the pointer has passed, along the container's own
     axis — and is drawn as a line in the gap it names, so the gesture and the surgery
     cannot disagree. The grammar gates the whole walk: a container that refuses the type
     is skipped and its ancestor is asked, exactly like palette insertion. */

  const canvasRef = React.useRef<HTMLDivElement | null>(null);

  const dragged = (): { type: string; movingId: string | null; makeNode: () => BuilderNode } | null => {
    const d = dragRef.current;
    if (!d) return null;
    if (d.kind === "insert") return { type: d.type, movingId: null, makeNode: () => CATALOG[d.type]!.make() };
    if (d.kind === "block") {
      const b = blocks[d.index];
      return b ? { type: b.node.type, movingId: null, makeNode: () => cloneWithNewIds(b.node) } : null;
    }
    const moving = findNode(doc.roots, d.id);
    return moving ? { type: moving.type, movingId: d.id, makeNode: () => moving } : null;
  };

  /** A field's stamp rides its inner input (unknown props spread there — the drag probe's
      own 2026-08-19 lesson), but the box a human sees is the `.kui-field` wrapper around
      it. Keyed on the input's class, never the wrapper's, so a stamped control sitting in
      a field's SLOT keeps its own box. */
  const visibleEl = (el: Element): Element =>
    el.classList.contains("kui-field-input") ? (el.closest(".kui-field") ?? el) : el;

  /** The DOM element that stands for a node — its own stamp, or (for a phantom root like
      Menu) the first stamped element inside it. */
  const elementFor = (n: BuilderNode): Element | null => {
    const wrap = canvasRef.current;
    if (!wrap) return null;
    const own = wrap.querySelector(`[data-b-id="${n.id}"]`);
    if (own) return visibleEl(own);
    for (const c of n.children ?? []) {
      const hit = elementFor(c);
      if (hit) return hit;
    }
    return null;
  };

  /** Where inside `parent` (null = the document root) does this pointer land, and where
      does the line draw? Children are measured along the container's own axis; the moving
      node still counts among them, which is exactly the PRE-move index moveNodeTo speaks. */
  const spotIn = (parent: BuilderNode | null, clientX: number, clientY: number): DropSpot | null => {
    const wrap = canvasRef.current;
    if (!wrap) return null;
    const wrapRect = wrap.getBoundingClientRect();
    const children = parent ? (parent.children ?? []) : doc.roots;
    const containerEl = parent ? elementFor(parent) : wrap;
    if (!containerEl) return null;
    const measured = children
      .map((c) => ({ c, el: elementFor(c) }))
      .filter((x): x is { c: BuilderNode; el: Element } => x.el !== null)
      .map(({ c, el }) => ({ c, r: el.getBoundingClientRect() }));
    if (measured.length === 0) {
      return { parentId: parent?.id ?? null, index: 0, line: null, boxId: parent?.id ?? null };
    }
    /* The arithmetic lives in `geometry.ts` so it can carry a law: the version this
       replaces could only be checked by dragging, and it was wrong for two of the four
       layouts the builder ships. */
    const spot = dropSpot(
      measured.map((m) => m.r),
      containerEl.getBoundingClientRect(),
      clientX,
      clientY,
    );
    if (!spot) return null;
    const line = {
      x: spot.line.x - wrapRect.left,
      y: spot.line.y - wrapRect.top,
      w: spot.line.w,
      h: spot.line.h,
    };
    const index = spot.index;
    return { parentId: parent?.id ?? null, index, line, boxId: null };
  };

  /** Walk up from the hovered element to the nearest container the grammar accepts,
      skipping the moving subtree (a node cannot land inside itself). */
  const resolveDropSpot = (targetEl: Element, clientX: number, clientY: number): DropSpot | null => {
    const d = dragged();
    if (!d) return null;
    const movingNode = d.movingId ? findNode(doc.roots, d.movingId) : null;
    let cursor: Element | null = targetEl.closest("[data-b-id]");
    while (cursor) {
      const id = cursor.getAttribute("data-b-id")!;
      const insideMoving = movingNode && (id === d.movingId || findNode([movingNode], id) !== null);
      if (!insideMoving) {
        const target = findNode(doc.roots, id);
        if (target && canAccept(doc.roots, id, d.type)) {
          return spotIn(target, clientX, clientY);
        }
      }
      cursor = cursor.parentElement?.closest("[data-b-id]") ?? null;
    }
    return canContain(null, d.type, []) ? spotIn(null, clientX, clientY) : null;
  };

  const onCanvasDragStart = (e: React.DragEvent) => {
    if (preview) return;
    const el = (e.target as Element).closest("[data-b-id]");
    if (!el) return;
    const id = el.getAttribute("data-b-id")!;
    dragRef.current = { kind: "move", id };
    e.dataTransfer.setData(MOVE_TYPE, id);
    e.dataTransfer.effectAllowed = "move";
    if (!state.selection.includes(id)) setSelection(id);
  };

  /** A drag that reaches the top or bottom of the canvas scrolls it. Without this a tall
      document can only be reordered as far as one screenful, because the drag owns the
      pointer and the wheel goes to the page. Bounded and proportional: the closer to the
      edge, the faster, and never more than a comfortable line at a time. */
  const autoScroll = (clientY: number) => {
    // The scroller is FOUND rather than marked: the canvas sits inside a ScrollArea whose
    // viewport is the primitive's own assembly (§10 — the parts are not API), so the honest
    // way to reach it is to walk up for the first ancestor that actually scrolls.
    let viewport: HTMLElement | null = canvasRef.current;
    while (viewport) {
      const style = getComputedStyle(viewport);
      if (/(auto|scroll)/.test(style.overflowY) && viewport.scrollHeight > viewport.clientHeight) break;
      viewport = viewport.parentElement;
    }
    if (!viewport) return;
    const box = viewport.getBoundingClientRect();
    const margin = 64;
    const above = clientY - box.top;
    const below = box.bottom - clientY;
    if (above < margin) viewport.scrollTop -= Math.min(24, (margin - above) / 2);
    else if (below < margin) viewport.scrollTop += Math.min(24, (margin - below) / 2);
  };

  const onCanvasDragOver = (e: React.DragEvent) => {
    if (!dragRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = dragRef.current.kind === "move" ? "move" : "copy";
    autoScroll(e.clientY);
    setDrop(resolveDropSpot(e.target as Element, e.clientX, e.clientY));
  };

  const onCanvasDragLeave = (e: React.DragEvent) => {
    // Only a real exit clears the indicator — dragleave also fires on every child hop.
    if (!(e.currentTarget as Element).contains(e.relatedTarget as Node)) setDrop(null);
  };

  const endDrag = () => {
    dragRef.current = null;
    setDrop(null);
    setDropRow(null);
  };

  const onCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const d = dragged();
    // Recomputed at the drop point rather than read from hover state — the last dragover
    // and the drop are the same place, but the fresh read cannot be stale.
    const spot = d ? resolveDropSpot(e.target as Element, e.clientX, e.clientY) : null;
    const movingId = d?.movingId ?? null;
    endDrag();
    if (!d || !spot) return;
    if (movingId) {
      commitRoots(moveNodeTo(doc.roots, movingId, spot.parentId, spot.index));
      setSelection(movingId);
    } else {
      const fresh = d.makeNode();
      commitRoots(insertNode(doc.roots, spot.parentId, fresh, spot.index));
      setSelection(fresh.id);
    }
  };

  /* Tree rows: the thirds. "into" asks the row's own grammar; "before"/"after" ask its
     parent's, and both fall back to the other when the grammar refuses — a drop that CAN
     land somewhere sensible should, rather than doing nothing under the pointer. */
  const rowSpot = (rowId: string, mode: "before" | "into" | "after"): { parentId: string | null; index?: number } | null => {
    const d = dragged();
    if (!d) return null;
    const movingNode = d.movingId ? findNode(doc.roots, d.movingId) : null;
    if (movingNode && (rowId === d.movingId || findNode([movingNode], rowId) !== null)) return null;
    const row = findNode(doc.roots, rowId);
    if (!row) return null;

    const intoOk = canAccept(doc.roots, rowId, d.type);
    const parent = findParent(doc.roots, rowId);
    const siblings = parent ? (parent.children ?? []) : doc.roots;
    const at = siblings.findIndex((c) => c.id === rowId);
    const besideOk = canAccept(doc.roots, parent ? parent.id : null, d.type);

    if (mode === "into" && intoOk) return { parentId: rowId };
    if (mode !== "into" && besideOk) {
      return { parentId: parent?.id ?? null, index: mode === "before" ? at : at + 1 };
    }
    // The fallbacks, in the order that surprises least.
    if (intoOk) return { parentId: rowId };
    if (besideOk) return { parentId: parent?.id ?? null, index: at + 1 };
    return null;
  };

  const onRowDrop = (rowId: string, mode: "before" | "into" | "after") => {
    const d = dragged();
    const spot = rowSpot(rowId, mode);
    const movingId = d?.movingId ?? null;
    endDrag();
    if (!d || !spot) return;
    if (movingId) {
      commitRoots(moveNodeTo(doc.roots, movingId, spot.parentId, spot.index));
      setSelection(movingId);
    } else {
      const fresh = d.makeNode();
      commitRoots(insertNode(doc.roots, spot.parentId, fresh, spot.index));
      setSelection(fresh.id);
    }
  };

  /* ── Selection ring: an instrument, measured off the live DOM ─────────────────────── */

  type Ring = { top: number; left: number; width: number; height: number; radius: string; corner: string };
  const [ring, setRing] = React.useState<Ring | null>(null);
  /** The OTHER selected nodes. The primary keeps the full instrument — handles, chip, gap
      bands — because those gestures write one node's props; a second selection is a member
      of a set, so it gets the trace and nothing that could be dragged. */
  const [alsoRings, setAlsoRings] = React.useState<Ring[]>([]);

  /* ── Gap bands: the space between children, shown and draggable ────────────────────────
     DevTools paints a layout's gutters so you can see the space you cannot click. Same
     idea, our vocabulary: a gap here is a token index, so the band is not a ruler you drag
     to a number — it walks the space scale, and every band moves together because `gap` is
     ONE prop.

     The children are grouped into visual ROWS by their vertical overlap, which makes one
     measurement serve all four layouts: a Stack is N rows of one, a Flex row is one row of
     N, and a wrapped Flex or a Grid is the general case. Nothing here asks the document
     which layout it is — the boxes say it. */
  type Band = { x: number; y: number; w: number; h: number; axis: "x" | "y" };
  const [bands, setBands] = React.useState<Band[]>([]);

  const measureBands = (wrap: HTMLElement, container: Element, node: BuilderNode): Band[] => {
    const kids = (node.children ?? [])
      .map((c) => elementFor(c))
      .filter((el): el is Element => el !== null)
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 || r.height > 0);
    if (kids.length < 2) return [];
    const b = wrap.getBoundingClientRect();
    const box = container.getBoundingClientRect();

    // ONE row-grouping, in `geometry.ts` with the laws. This used to be a second copy of it,
    // comment and all — and the copies had already drifted (this one filters zero-size boxes
    // and requires two children; the drop scan's did neither), so a fix to either could not
    // reach the other.
    const rows: DOMRect[][] = rowsOf(kids).map((row) => row.map((i) => kids[i]!));

    const out: Band[] = [];
    for (const row of rows) {
      const sorted = [...row].sort((p, q) => p.left - q.left);
      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = sorted[i + 1]!.left - sorted[i]!.right;
        if (gap > 0.5)
          out.push({
            x: sorted[i]!.right - b.left,
            y: Math.min(...row.map((r) => r.top)) - b.top,
            w: gap,
            h: Math.max(...row.map((r) => r.bottom)) - Math.min(...row.map((r) => r.top)),
            axis: "x",
          });
      }
    }
    for (let i = 0; i < rows.length - 1; i++) {
      const bottom = Math.max(...rows[i]!.map((r) => r.bottom));
      const gap = Math.min(...rows[i + 1]!.map((r) => r.top)) - bottom;
      if (gap > 0.5) out.push({ x: box.left - b.left, y: bottom - b.top, w: box.width, h: gap, axis: "y" });
    }
    return out;
  };
  /* One key for the whole selection: the effect re-arms when ANY member changes, not only
     when the primary does. */
  const selectionKey = state.selection.join(",");
  React.useLayoutEffect(() => {
    const wrap = canvasRef.current;
    if (!wrap || !selection) {
      setRing(null);
      setAlsoRings([]);
      return;
    }
    // The element does not hold still — the hover rise, the press spring, a reflow — so
    // the instrument tracks it per frame while selected, committing state only on change.
    // Measured before this: a click-time measurement went 1px stale the moment the hover
    // travel landed.
    let raf = 0;
    const tick = () => {
      const stamped = wrap.querySelector(`[data-b-id="${selection}"]`);
      if (!stamped) {
        setRing(null);
      } else {
        const el = visibleEl(stamped);
        const a = el.getBoundingClientRect();
        const b = wrap.getBoundingClientRect();
        // The shape outline traces the element's OWN corners exactly (a pill stays a
        // pill), read off the computed style rather than guessed. Radius alone is HALF the
        // corner: a surface draws its corner as a squircle (§6, the lab port), so the
        // curvature FAMILY has to travel with the number or the trace bulges past a card's
        // real edge. Measured: outline follows corner-shape, so one property carries it.
        // An engine without the property computes "" here and its surfaces draw arcs, so
        // the trace stays right by construction — the same live-or-die pairing surfaces.css
        // states for the knob and the shape.
        const cs = window.getComputedStyle(el as HTMLElement);
        const radius = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius]
          .map((v) => v.split(" ")[0])
          .join(" ");
        const corner = cs.getPropertyValue("corner-shape");
        const next: Ring = { top: a.top - b.top, left: a.left - b.left, width: a.width, height: a.height, radius, corner };
        setRing((prev) =>
          prev &&
          prev.top === next.top &&
          prev.left === next.left &&
          prev.width === next.width &&
          prev.height === next.height &&
          prev.radius === next.radius &&
          prev.corner === next.corner
            ? prev
            : next,
        );
        // The other members of the selection, traced without an instrument on them.
        const others = stateRef.current.selection.filter((id) => id !== selection);
        const nextAlso = others
          .map((id) => wrap.querySelector(`[data-b-id="${id}"]`))
          .filter((n): n is Element => n !== null)
          .map((stampedOther) => {
            const otherEl = visibleEl(stampedOther);
            const r = otherEl.getBoundingClientRect();
            const ocs = window.getComputedStyle(otherEl as HTMLElement);
            return {
              top: r.top - b.top,
              left: r.left - b.left,
              width: r.width,
              height: r.height,
              radius: [ocs.borderTopLeftRadius, ocs.borderTopRightRadius, ocs.borderBottomRightRadius, ocs.borderBottomLeftRadius]
                .map((v) => v.split(" ")[0])
                .join(" "),
              corner: ocs.getPropertyValue("corner-shape"),
            };
          });
        setAlsoRings((prev) =>
          prev.length === nextAlso.length && prev.every((p, i) => JSON.stringify(p) === JSON.stringify(nextAlso[i]))
            ? prev
            : nextAlso,
        );

        const node = findNode(stateRef.current.docs.find((d) => d.id === stateRef.current.activeId)!.roots, selection);
        const nextBands = node && gapStepsFor(node.type) ? measureBands(wrap, el, node) : [];
        setBands((prev) =>
          prev.length === nextBands.length && prev.every((p, i) => JSON.stringify(p) === JSON.stringify(nextBands[i]))
            ? prev
            : nextBands,
        );
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [selection, selectionKey]);

  /* ── Resize: the corner steps the size index ──────────────────────────────────────────
     There is no raw length behind this gesture. The catalog says whether the selected type
     has a size vocabulary at all (`sizeStepsFor`), and the drag walks that index — so the
     box lands on a value the system designed, never on a number the pointer happened to
     stop at. The handle follows the BOX, not the pointer: the ring already re-measures per
     frame, so a step re-renders the real component and the handles arrive with it. */

  const RESIZE_STEP_PX = 30;
  const [resizing, setResizing] = React.useState<{ label: string } | null>(null);
  const sizeSteps = selected ? sizeStepsFor(selected.type) : null;

  /* The SIDE handles say how the node takes its seat. Which vocabulary applies depends on
     the parent's layout, and that is MEASURED: `direction` is responsive, so the document
     cannot answer "is this a row" for the tier currently on screen — the canvas is a real
     query container, so only the DOM knows. A column is deliberately absent: its children
     already stretch across it (the system's own full-width idiom), so there is nothing to
     write and no handle to show. */
  const parentLayout = (): "row" | "column" | "grid" | null => {
    const wrap = canvasRef.current;
    if (!wrap || !selected) return null;
    const own = wrap.querySelector(`[data-b-id="${selected.id}"]`);
    const parentEl = own ? visibleEl(own).parentElement : null;
    if (!parentEl) return null;
    const cs = getComputedStyle(parentEl);
    if (cs.display.includes("grid")) return "grid";
    if (!cs.display.includes("flex")) return null;
    return cs.flexDirection.startsWith("row") ? "row" : "column";
  };
  /* ── What the indices actually come to ────────────────────────────────────────────────
     The one readout no general-purpose builder can show honestly, and the reason is the
     same one that makes review possible: here a distance is an INDEX, so "gap 4" has an
     answer, and the answer moves with density, with the pointer world and with the scale.

     It is MEASURED, never derived. Reading `--layout-space-4` off the theme gives the
     declared value (`calc(12px * var(--scale))`), not what this element got; and rebuilding
     the arithmetic here would be a second home for numbers the package already owns — the
     mistake this repo's audits keep finding. So the panel reads the rendered element. */
  const readoutDoc = React.useDeferredValue(doc);
  type Measured = { label: string; value: string; stated?: string | undefined }[];
  const [measured, setMeasured] = React.useState<Measured>([]);
  React.useEffect(() => {
    const wrap = canvasRef.current;
    // Read the node out of the DEFERRED document, and depend on the selection's ID rather
    // than on the node object. `selected` is derived from the live document, so it changes
    // identity on the very keystroke this effect is trying to stay out of the way of —
    // deferring the document while depending on `selected` is a deferral that does nothing.
    const node = selection ? findNode(readoutDoc.roots, selection) : null;
    if (!wrap || !node) return setMeasured([]);
    const el = wrap.querySelector(`[data-b-id="${node.id}"]`);
    if (!el) return setMeasured([]);
    const target = visibleEl(el);
    const cs = getComputedStyle(target);
    const px = (v: string) => (v && v !== "normal" && parseFloat(v) > 0 ? `${Math.round(parseFloat(v) * 10) / 10}px` : null);
    const stated = (key: string) => {
      const v = node.props[key];
      return typeof v === "string" ? v : undefined;
    };
    // The box comes from the COMPUTED style, not the rect. A rect is in painted pixels, so
    // under the magnifier it states how close you are standing rather than what the component
    // is; dividing it back gets the right number with a pixel of rounding on it, and the
    // computed value is already in CSS pixels and exact. (The package sets `border-box`, so
    // this is the same edge the rect traces.)
    //
    // Measured caveat, stated rather than hidden: `zoom` participates in layout, so text is
    // laid out at the scaled resolution and a box's own height can land a CSS pixel either
    // side of its actual-size value (202 at 100%, 203 at 67%, 201 at 150% on the starter's
    // card). The readout is telling the truth about the zoomed layout; it is the zoomed
    // layout that differs.
    const rows: Measured = [
      { label: "box", value: `${Math.round(parseFloat(cs.width))} × ${Math.round(parseFloat(cs.height))}` },
    ];
    const gap = px(cs.rowGap) ?? px(cs.columnGap);
    if (gap) rows.push({ label: "gap", value: gap, ...(stated("gap") ? { stated: stated("gap") } : {}) });
    const pads = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map((v) => Math.round(parseFloat(v) || 0));
    if (pads.some((p) => p > 0)) {
      const uniform = pads.every((p) => p === pads[0]);
      rows.push({
        label: "padding",
        value: uniform ? `${pads[0]}px` : `${pads[0]} ${pads[1]} ${pads[2]} ${pads[3]}px`,
        ...(stated("p") ? { stated: stated("p") } : {}),
      });
    }
    const radius = px(cs.borderTopLeftRadius);
    if (radius) rows.push({ label: "corner", value: radius });
    // Type only where the node OWNS one. Every element has a computed font size, but a
    // Stack's is inherited — reporting it would be the panel answering a question this node
    // does not ask.
    const font = px(cs.fontSize);
    const ownsType = CATALOG[node.type]?.family === "Type" || CATALOG[node.type]?.family === "Control";
    if (font && ownsType) {
      rows.push({
        label: "type",
        value: `${font} / ${px(cs.lineHeight) ?? "auto"}`,
        ...(stated("size") ? { stated: stated("size") } : {}),
      });
    }
    setMeasured(rows);
    // The theme axes and the canvas width all move these, so the readout re-measures when
    // any of them does — a stale number here would be worse than none. It rides the DEFERRED
    // document for the same reason the review does: reading a computed style forces a
    // style-and-layout flush, and the readout is informational, so it can settle after the
    // character has appeared rather than in front of it.
    //
    // Measured, because the first version of this comment guessed and was wrong: deferring it
    // moves a 320-node document from 21.1ms to 19.9ms per keystroke — real, free, and not
    // where the time goes. The time goes to React reconciling and the browser laying out 320
    // live components; the whole per-edit model path (an edit plus the seat normalizer) costs
    // 0.089ms at that size, and a CPU profile of a typing run names browser layout and
    // React's own frames, not this file's.
  }, [selection, readoutDoc, canvasW, preview, zoom]);

  const [seat, setSeat] = React.useState<SeatVocabulary | null>(null);
  React.useEffect(() => {
    setSeat(selected ? seatVocabularyFor(selected.type, parentLayout()) : null);
  }, [selected, doc, canvasW]);

  const startResize = (e: React.PointerEvent<HTMLDivElement>, out: readonly [number, number]) => {
    const wrap = canvasRef.current;
    if (!wrap || !selected || !sizeSteps) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    // The starting rung is READ, never assumed: `size` is optional in the catalog, so an
    // unstated one is the component's own default — which every component stamps as
    // `data-size`. The DOM is the only place that knows.
    const stampedEl = wrap.querySelector(`[data-b-id="${selected.id}"]`);
    const stamped = stampedEl ? visibleEl(stampedEl).getAttribute("data-size") : null;
    const stated = typeof selected.props?.size === "string" ? (selected.props.size as string) : null;
    const from = Math.max(0, sizeSteps.indexOf(stated ?? stamped ?? sizeSteps[0]!));

    stepDrag(e, sizeSteps, from, out, (v) => ({ size: v }), (v) => `size ${v}`);
  };

  /** The one drag both handle kinds run: walk a closed list, write the rung through the
      model, one gesture = one undo. The handles differ only in which list they walk and
      which prop they write — the same shape `canContain` gives the three drop surfaces. */
  const stepDrag = (
    e: React.PointerEvent<HTMLDivElement>,
    steps: readonly string[],
    from: number,
    out: readonly [number, number],
    write: (value: string | undefined) => Record<string, string | undefined>,
    label: (value: string | undefined) => string,
  ) => {
    if (!selected) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let last = from;
    let pushed = false;
    setResizing({ label: label(steps[from]) });

    const onMove = (ev: PointerEvent) => {
      // Project the travel onto the handle's own outward direction, so a handle grows when
      // dragged away from the box and shrinks when dragged into it. A corner's vector has
      // both components, a side's only one — one expression covers both.
      const span = Math.abs(out[0]) + Math.abs(out[1]);
      // NOT divided by the zoom. This writes a rung INDEX, so the distance per step is
      // ergonomic rather than a length: dividing made it zoom-dependent and backwards —
      // twice as twitchy at 50%, which is exactly when you are zoomed out to see a whole
      // page and precision is hardest. The width handle divides because the value it writes
      // IS a length, and this is where that was copied from.
      const along = ((ev.clientX - startX) * out[0] + (ev.clientY - startY) * out[1]) / Math.sqrt(span);
      const next = Math.min(steps.length - 1, Math.max(-1, from + Math.round(along / RESIZE_STEP_PX)));
      if (next === last) return;
      last = next;
      // -1 is the UNSET rung, which is a real value: a hugging item, a one-column cell.
      const value = next < 0 ? undefined : steps[next]!;
      setResizing({ label: label(value) });
      // Read the LIVE document: the one this drag started on goes stale the moment the
      // first step commits. The first step pushes history, the rest ride it — one gesture,
      // one undo.
      const roots = updateProps(activeDoc(stateRef.current).roots, selected.id, write(value));
      dispatch(pushed ? { type: "editSilent", roots } : { type: "edit", roots });
      pushed = true;
    };
    const onUp = () => {
      setResizing(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  /** Dragging a band walks the space scale. All bands move at once, because `gap` is one
      prop — which is also the honest picture: this layout has ONE gutter, not a set of them.
      A per-tier gap is not dragged: the canvas shows one tier's answer, and silently editing
      one entry of four while the screen may be showing another is worse than sending the
      author to the inspector, where every tier is visible at once. */
  const gapSteps = selected ? gapStepsFor(selected.type) : null;
  const gapIsResponsive = selected !== null && typeof selected.props?.gap === "object";

  const startGapDrag = (e: React.PointerEvent<HTMLDivElement>, axis: "x" | "y") => {
    if (!selected || !gapSteps || gapIsResponsive) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const stated = typeof selected.props?.gap === "string" ? (selected.props.gap as string) : null;
    const from = stated ? gapSteps.indexOf(stated) : -1;
    stepDrag(
      e,
      gapSteps,
      from,
      axis === "x" ? [1, 0] : [0, 1],
      (v) => ({ gap: v }),
      (v) => (v ? `gap ${v}` : "no gap"),
    );
  };

  const startSeatDrag = (e: React.PointerEvent<HTMLDivElement>, out: readonly [number, number]) => {
    if (!selected || !seat) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const stated = typeof selected.props?.[seat.prop] === "string" ? (selected.props[seat.prop] as string) : null;
    const from = stated ? seat.values.indexOf(stated) : -1;
    const wordFor = (v: string | undefined) =>
      seat.prop === "flexGrow" ? (v ? "fill" : "hug") : `spans ${v ? v.replace(/\D+/g, "") : "1"}`;
    stepDrag(e, seat.values, from, out, (v) => ({ [seat.prop]: v }), wordFor);
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    if (preview) return;
    if ((e.target as Element).closest("[data-kb-width-handle], [data-kb-resize]")) return;
    // Nearest of stamp-or-field-wrapper: a click on a field's padding lands on the
    // unstamped wrapper, and walking past it would select the field's PARENT.
    const near = (e.target as Element).closest("[data-b-id], .kui-field");
    const el =
      near && !near.hasAttribute("data-b-id")
        ? near.querySelector(":scope > .kui-field-input[data-b-id]")
        : near;
    // Shift (or ⌘/Ctrl) adds to the selection, which is what makes "wrap these two in a
    // row" reachable with the pointer as well as from the tree.
    setSelection(el ? el.getAttribute("data-b-id") : null, e.shiftKey || e.metaKey || e.ctrlKey);
  };

  /** Right-click selects what is under the pointer (unless it is already in the selection,
      which is what makes "wrap these three" reachable) and opens the menu there. */
  const onContextMenu = (e: React.MouseEvent) => {
    if (preview) return;
    const near = (e.target as Element).closest("[data-b-id], .kui-field");
    const el =
      near && !near.hasAttribute("data-b-id") ? near.querySelector(":scope > .kui-field-input[data-b-id]") : near;
    const id = el?.getAttribute("data-b-id") ?? null;
    if (!id) return;
    e.preventDefault();
    if (!state.selection.includes(id)) setSelection(id);
    setContextPoint({ x: e.clientX, y: e.clientY });
  };

  /* A canvas control never takes real focus: clicking is selection, not operation (the
     same trade drag-to-move already made of text selection — the inspector is where a
     field is edited). Blurring in the focus event itself, rather than preventing the
     mousedown, keeps native drag alive in every engine; the width handle's own focus
     (arrow-key resize) never matches the stamp and survives. */
  const onCanvasFocus = (e: React.FocusEvent) => {
    if (preview) return;
    if ((e.target as Element).closest("[data-b-id]")) (e.target as HTMLElement).blur();
  };

  /* The width handle: drag (or arrow keys) to give the canvas a narrower room. */
  const startWidthDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = canvasRef.current;
    if (!wrap) return;
    const startX = e.clientX;
    // Both halves in the same space. `canvasRef` is styled `canvasW * zoom`, so its
    // `offsetWidth` is PAINTED pixels while `canvasW` is CSS pixels — dividing only the
    // delta left the base scaled, so grabbing the handle at 50% jumped the canvas from 880
    // to 442 and flipped every container tier inside it.
    const startW = wrap.offsetWidth / zoomRef.current;
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    // The pointer travels in SCREEN pixels; the width it writes is CSS pixels, and at 50%
    // one screen pixel is two of them.
    const move = (ev: PointerEvent) =>
      setCanvasW(Math.max(280, Math.round(startW + (ev.clientX - startX) / zoomRef.current)));
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
  };
  const nudgeWidth = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const current = canvasW ?? canvasRef.current?.offsetWidth ?? 880;
    setCanvasW(Math.max(280, current + (e.key === "ArrowRight" ? 16 : -16)));
  };

  const code = React.useMemo(() => {
    try {
      const block = exportBlock === null ? null : blocks[exportBlock];
      return block ? serializeBlock(block.name, block.node, deriveParams(block.node)) : serializeDocument(doc);
    } catch (err) {
      return `// ${err instanceof Error ? err.message : String(err)}`;
    }
  }, [doc, blocks, exportBlock]);

  const setThemeAxis = (axis: keyof DocTheme, value: string) =>
    dispatch({ type: "setTheme", axis, value });

  /* ── The command context: state, dispatch, and the few things a command cannot do on
     its own (open a dialog, reach the clipboard, put a file on disk). ─────────────────── */
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const inspectorTextRef = React.useRef<HTMLInputElement | null>(null);

  const ui: CommandUi = {
    openPalette: () => setPaletteOpen(true),
    openExport: () => setExportOpen(true),
    openShortcuts: () => setShortcutsOpen(true),
    openDocuments: () => setPaletteOpen(true),
    toggleReview: () => setReviewOpen((v) => !v),
    togglePreview: () => setPreview((v) => !v),
    stepZoom: (delta) => {
      // Zooming PINS the canvas width. Without a stated width the zoomed box takes 100% of
      // its parent, and inside a scaled box a percentage resolves in the scaled space — so
      // at 67% the canvas measured 1313 CSS pixels while painting 880, and the container
      // tiers moved. Measured, and the reason this is not just a style. A magnifier may not
      // change what the room is; it may only change how close you stand to it.
      if (canvasRef.current) setCanvasW((w) => w ?? Math.round(canvasRef.current!.offsetWidth / zoomRef.current));
      setZoom((z) => {
        if (delta === null) return 1;
        const at = ZOOMS.indexOf(z);
        const next = (at === -1 ? ZOOMS.indexOf(1) : at) + delta;
        return ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, next))]!;
      });
    },
    writeClipboard: (text) => void navigator.clipboard?.writeText(text).catch(() => {}),
    readClipboard: async () => {
      try {
        const text = await navigator.clipboard.readText();
        return decodeNodes(text);
      } catch {
        // Denied, or nothing readable: the caller falls back to the in-memory buffer.
        return null;
      }
    },
    focusInspectorText: () => inspectorTextRef.current?.focus(),
    focusLayerFilter: () => {
      setLeftTab("layers");
      // The tab has to be on screen before the field can take the caret.
      requestAnimationFrame(() => layerFilterRef.current?.focus());
    },
    insertBlockByIndex: (index) => {
      const block = stateRef.current.blocks[index];
      if (block) insertBlock(block);
    },
    saveBlockFromSelection: () => {
      const node = primaryNode(stateRef.current);
      if (!node) return;
      // The name is DERIVED here, so it collides constantly — every unnamed Card is "Card".
      // Saving under a taken name replaces it, which is right when somebody typed that name
      // and wrong when nobody chose it: two different cards saved with ⌘B would have left
      // one block, with an identical toast both times, no prompt, and no way back (a block
      // save pushes no history). A derived name takes the next free one instead.
      const taken = new Set(stateRef.current.blocks.map((b) => b.name));
      const base = node.text?.trim() || node.type;
      let name = base;
      for (let n = 2; taken.has(name); n++) name = `${base} ${n}`;
      dispatch({ type: "blockSave", block: { name, node: cloneWithNewIds(node) } });
      say(`Saved “${name}”`);
    },
    downloadDocument: () => {
      const current = activeDoc(stateRef.current);
      const blob = new Blob([JSON.stringify({ name: current.name, theme: current.theme, roots: current.roots }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${current.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "document"}.kookie.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    importDocument: () => fileInputRef.current?.click(),
  };
  const ctx: CommandContext = { state, dispatch, ui };
  ctxRef.current = ctx;

  /** The review is ADVISORY, so it yields to typing: React renders the document first and
      re-runs the rules against the settled value. Without this every keystroke paid for a
      full pass over the tree before the character appeared. */
  const reviewedDoc = React.useDeferredValue(doc);
  const findings = React.useMemo(() => reviewDocument(reviewedDoc), [reviewedDoc]);

  /** A finding's fix is a pure function over the tree, so applying one is an ordinary edit:
      undoable, re-reviewed on the next render, and selecting the node it touched so the eye
      lands where the change happened. */
  const applyFix = (finding: Finding) => {
    if (!finding.fix) return;
    // The panel shows findings from the DEFERRED document, so a fix can be clicked against a
    // tree that has moved on — dropping a child into an empty Stack and pressing the
    // still-displayed "Delete it" before the review pass lands would take the child with it.
    // Re-run the rules on the live tree and refuse a finding that is no longer true.
    const live = activeDoc(stateRef.current);
    if (!reviewDocument(live).some((f) => f.id === finding.id)) {
      say("That is already resolved");
      return;
    }
    const roots = finding.fix.apply(live.roots);
    dispatch({ type: "edit", roots, selection: finding.nodeId ? [finding.nodeId] : [] });
    say(finding.fix.title);
  };

  /** What a right-click may insert HERE. The grammar answers, so the menu on a Card and the
      menu inside a Menu offer different things and neither offers something the tree would
      refuse. Parts first — inside a compound they are what you actually reached for. */
  const contextInserts: string[] = React.useMemo(
    () => insertableInto(doc.roots, selected?.id ?? null),
    [selected, doc.roots],
  );

  /* Parts the current selection can hold directly — the contextual half of the palette. */
  const contextualParts: [string, CatalogEntry][] = selected
    ? Object.entries(CATALOG).filter(
        ([type, entry]) =>
          entry.partOf && canContain(selected.type, type, typesThrough(doc.roots, selected.id)),
      )
    : [];

  return (
    <Flex direction="column" style={{ height: "100dvh" }}>
      {/* ── Top bar: identity, the document, the modes, the one loud action ── */}
      <Flex align="center" justify="space-between" px="4" py="2" gapX="4">
        <Flex align="center" gap="3" style={{ minWidth: 0 }}>
          <Heading size="3" render={<h1 />}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              Builder
            </Link>
          </Heading>
          <DocumentBar state={state} dispatch={dispatch} />
        </Flex>
        <Flex align="center" gap="2">
          {toast ? (
            <Text size="1" emphasis="quiet" aria-live="polite">
              {toast}
            </Text>
          ) : null}
          {/* The EDITING controls stand down in preview with the panels. Guarding the
              keyboard and leaving the buttons would be half a guard: a click on undo edits
              the document just as well as ⌘Z does, and preview draws nothing to say it
              happened. */}
          {!preview ? (
            <>
              <Button size="1" emphasis="quiet" disabled={!canUndo(state)} onClick={undo} aria-label="Undo" iconOnly>
                <UndoIcon />
              </Button>
              <Button size="1" emphasis="quiet" disabled={!canRedo(state)} onClick={redo} aria-label="Redo" iconOnly>
                <RedoIcon />
              </Button>
              <Separator orientation="vertical" style={{ height: "20px" }} />
            </>
          ) : null}
          <Button size="1" emphasis="quiet" onClick={() => setPaletteOpen(true)} trailing={<Kbd>{chordLabel("mod+k")}</Kbd>}>
            Commands
          </Button>
          {/* Review lives in the right pane, which preview hides — a button that opens a
              panel nobody can see is a dead control. */}
          {!preview ? (
            <Button
              size="1"
              emphasis={reviewOpen ? "medium" : "quiet"}
              aria-pressed={reviewOpen}
              onClick={() => setReviewOpen((v) => !v)}
            >
              {findings.length ? `Review ${findings.length}` : "Review"}
            </Button>
          ) : null}
          <Button
            size="1"
            emphasis={preview ? "medium" : "quiet"}
            aria-pressed={preview}
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? "Editing off" : "Preview"}
          </Button>
          <Button size="1" tone="accent" emphasis="loud" onClick={() => setExportOpen(true)}>
            Export code
          </Button>
        </Flex>
      </Flex>
      <Separator />

      {/* ── Three panes ── */}
      <Flex align="stretch" style={{ flex: 1, minHeight: 0 }}>
        {/* Left: add + layers. Both side panes stand down in preview — the mode promises the
            screen you built, actually usable, and a screen with an editor's panels beside it
            is the editor with its instruments turned off. The top bar stays, because the way
            out has to be visible. */}
        {!preview ? (
        <Box width="272px" style={{ flex: "none", minHeight: 0 }}>
          <ScrollArea style={{ height: "100%" }}>
            <Box p="3">
              <Tabs value={leftTab} onValueChange={(v) => setLeftTab(String(v))}>
                <TabsList size="1">
                  <TabsTab value="add">Add</TabsTab>
                  <TabsTab value="layers">Layers</TabsTab>
                </TabsList>
                <TabsPanel value="add">
                  <Box pt="3">
                    <Stack gap="4">
                      {contextualParts.length ? (
                        <PaletteGroup
                          label={`Inside ${selected!.type}`}
                          entries={contextualParts}
                          canInsert={() => true}
                          onInsert={insertType}
                          onDragBegin={(payload) => (dragRef.current = payload)}
                          onDragFinish={endDrag}
                        />
                      ) : null}
                      {PALETTE_FAMILIES.map((family) => (
                        <PaletteGroup
                          key={family}
                          label={family}
                          entries={paletteEntries().filter(([, e]) => e.family === family)}
                          canInsert={(type) => insertionTarget(doc.roots, selection, type) !== null}
                          onInsert={insertType}
                          onDragBegin={(payload) => (dragRef.current = payload)}
                          onDragFinish={endDrag}
                        />
                      ))}
                      <Stack gap="2">
                        <Text size="1" weight="medium">
                          Blocks
                        </Text>
                        {blocks.length === 0 ? (
                          <Text size="1" emphasis="quiet">
                            Save a selection as a block and it lands here.
                          </Text>
                        ) : (
                          blocks.map((b, i) => (
                            <Flex key={`${b.name}-${i}`} gap="1" align="center">
                              <Button
                                size="1"
                                emphasis="quiet"
                                draggable
                                onDragStart={(e) => {
                                  dragRef.current = { kind: "block", index: i };
                                  e.dataTransfer.setData(DRAG_TYPE, b.node.type);
                                  e.dataTransfer.effectAllowed = "copy";
                                }}
                                onDragEnd={endDrag}
                                onClick={() => insertBlock(b)}
                                style={{ justifyContent: "flex-start", flex: 1 }}
                              >
                                {b.name}
                              </Button>
                              <Menu size="1">
                                <MenuTrigger
                                  render={
                                    <Button size="1" emphasis="quiet" aria-label={`Actions for ${b.name}`}>
                                      ⋯
                                    </Button>
                                  }
                                />
                                <MenuContent>
                                  <MenuItem onClick={() => insertBlock(b)}>Insert</MenuItem>
                                  {/* A block was write-only: you could save one and place
                                      one, and there was no way back into it — so a typo in
                                      a saved card meant rebuilding it. It opens as its own
                                      document now, with fresh ids so editing the copy
                                      cannot reach into the block or into any screen the
                                      block was already placed in. Re-saving under the same
                                      name replaces it. */}
                                  <MenuItem onClick={() => openBlock(b)}>Open as document</MenuItem>
                                  <MenuItem
                                    onClick={() => {
                                      setExportBlock(i);
                                      setExportOpen(true);
                                    }}
                                  >
                                    Export as component
                                  </MenuItem>
                                  <MenuItem tone="destructive" onClick={() => dispatch({ type: "blockRemove", index: i })}>
                                    Remove
                                  </MenuItem>
                                </MenuContent>
                              </Menu>
                            </Flex>
                          ))
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                </TabsPanel>
                <TabsPanel value="layers">
                  <Box pt="3">
                    {/* A tree, said in the markup: assistive technology gets the structure
                        the eye gets from the indent, and the rows carry their own level. */}
                    <Stack gap="2">
                    {doc.roots.length > 0 ? (
                      <TextField
                        size="1"
                        aria-label="Filter layers"
                        placeholder="Filter by type or words"
                        ref={layerFilterRef}
                        value={layerFilter}
                        onChange={(e) => setLayerFilter(e.target.value)}
                        {...(layerFilter
                          ? {
                              trailing: (
                                <Button
                                  size="1"
                                  emphasis="quiet"
                                  iconOnly
                                  aria-label="Clear the filter"
                                  onClick={() => setLayerFilter("")}
                                >
                                  <XIcon />
                                </Button>
                              ),
                            }
                          : {})}
                      />
                    ) : null}
                    <Stack gap="1" render={<div role="tree" aria-label="Layers" />}>
                      {doc.roots.length === 0 ? (
                        <Text size="1" emphasis="quiet">
                          The canvas is empty.
                        </Text>
                      ) : visibleRows !== null && visibleRows.size === 0 ? (
                        <Text size="1" emphasis="quiet">
                          Nothing here is called that.
                        </Text>
                      ) : (
                        doc.roots.map((r) => (
                          <TreeRows
                            key={r.id}
                            node={r}
                            depth={0}
                            selection={state.selection}
                            onSelect={(id, additive) => setSelection(id, additive)}
                            dropRow={dropRow}
                            onDragBegin={(id) => {
                              dragRef.current = { kind: "move", id };
                              setSelection(id);
                            }}
                            onDragFinish={endDrag}
                            canRowDrop={(id, mode) => rowSpot(id, mode) !== null}
                            onHoverRow={setDropRow}
                            onRowDrop={onRowDrop}
                            visible={visibleRows}
                          />
                        ))
                      )}
                    </Stack>
                    </Stack>
                  </Box>
                </TabsPanel>
              </Tabs>
            </Box>
          </ScrollArea>
        </Box>
        ) : null}
        {!preview ? <Separator orientation="vertical" /> : null}

        {/* Center: the jump bar, then the live canvas */}
        <Flex direction="column" style={{ flex: 1, minWidth: 0, minHeight: 0, background: "var(--neutral-2)" }}>
          <Breadcrumb
            roots={doc.roots}
            selection={preview ? [] : state.selection}
            hidePath={preview}
            onSelect={(id) => setSelection(id)}
            extra={
              <Flex align="center" gap="2">
                <Flex align="center" gap="1">
                  <Button
                    size="1"
                    emphasis="quiet"
                    iconOnly
                    aria-label="Zoom out"
                    disabled={zoom === ZOOMS[0]}
                    onClick={() => ctx.ui.stepZoom(-1)}
                  >
                    −
                  </Button>
                  {/* The reading is the button: pressing it goes back to actual size, which
                      is the only zoom anybody asks for by name. */}
                  <Button size="1" emphasis="quiet" aria-label="Actual size" onClick={() => ctx.ui.stepZoom(null)}>
                    {`${Math.round(zoom * 100)}%`}
                  </Button>
                  <Button
                    size="1"
                    emphasis="quiet"
                    iconOnly
                    aria-label="Zoom in"
                    disabled={zoom === ZOOMS[ZOOMS.length - 1]}
                    onClick={() => ctx.ui.stepZoom(1)}
                  >
                    +
                  </Button>
                </Flex>
                <Button
                  size="1"
                  emphasis={tiersView ? "medium" : "quiet"}
                  aria-pressed={tiersView}
                  onClick={() => setTiersView((v) => !v)}
                >
                  Compare tiers
                </Button>
                {canvasW ? (
                  <>
                    <Text size="1" emphasis="quiet">
                      {`${canvasW}px · ${activeTier(canvasW)}`}
                    </Text>
                    <Button size="1" emphasis="quiet" onClick={() => setCanvasW(null)}>
                      Full width
                    </Button>
                  </>
                ) : null}
              </Flex>
            }
          />
          <Separator />
          <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            <Box
              p="6"
              onClickCapture={onCanvasClick}
              onContextMenu={onContextMenu}
              onFocusCapture={onCanvasFocus}
              onDragStartCapture={onCanvasDragStart}
              onDragOver={onCanvasDragOver}
              onDrop={onCanvasDrop}
              onDragLeave={onCanvasDragLeave}
              onDragEnd={endDrag}
              style={{ minHeight: "100%" }}
            >
              {tiersView ? (
                <TierCompare doc={doc} />
              ) : (
              <Box maxWidth="880px" style={{ marginInline: "auto" }}>
                <div
                  ref={canvasRef}
                  style={{
                    position: "relative",
                    // The PAINTED width. The overlays live in this box and measure in screen
                    // pixels, so it has to be the size the content actually occupies.
                    width: canvasW ? `${Math.round(canvasW * zoom)}px` : "100%",
                    maxWidth: "100%",
                  }}
                >
                  {/* The zoomed box holds ONLY the rendered document. Every overlay below is
                      its sibling, so their coordinates stay in unscaled pixels. */}
                  <div
                    style={
                      zoom === 1
                        ? undefined
                        : ({ zoom, width: canvasW ? `${canvasW}px` : "100%" } as React.CSSProperties)
                    }
                  >
                  <Theme
                    appearance={doc.theme.appearance}
                    density={doc.theme.density}
                    pointer={doc.theme.pointer}
                    radius={doc.theme.radius}
                    depth={doc.theme.depth}
                    material={doc.theme.material}
                  >
                    {/* The canvas is a REAL query container (§2's opt-in, layout-sized by
                        the width handle), so a per-tier value inside it answers the canvas's
                        room — which is what it will answer in an app column. */}
                    <Box container width="100%">
                      <CanvasBoundary tree={doc.roots} onRecover={undo} canRecover={canUndo(state)}>
                        <Stack gap="5">
                          {doc.roots.length === 0 ? (
                            <TemplatePicker
                              onPick={(id) => {
                                const template = TEMPLATES.find((t) => t.id === id);
                                if (!template) return;
                                const roots = templateDoc(template).roots.map(cloneWithNewIds);
                                dispatch({ type: "edit", roots, selection: [] });
                                // A document nobody has named takes the template's name — but a
                                // named one keeps its own, because that name was a decision.
                                if (/^Untitled/.test(activeDoc(stateRef.current).name)) {
                                  dispatch({ type: "docRename", id: stateRef.current.activeId, name: template.name });
                                }
                              }}
                            />
                          ) : (
                            doc.roots.map((r) => renderNode(r, preview ? "export" : "canvas"))
                          )}
                        </Stack>
                      </CanvasBoundary>
                    </Box>
                  </Theme>
                  </div>
                  <div
                    data-kb-width-handle
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Canvas width"
                    tabIndex={0}
                    onPointerDown={startWidthDrag}
                    onKeyDown={nudgeWidth}
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      right: "-18px",
                      width: "12px",
                      cursor: "ew-resize",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        width: "4px",
                        height: "44px",
                        borderRadius: "2px",
                        background: "var(--color-border)",
                      }}
                    />
                  </div>
                  {!preview
                    ? alsoRings.map((r, i) => (
                        <div
                          key={i}
                          aria-hidden
                          style={
                            {
                              position: "absolute",
                              top: r.top,
                              left: r.left,
                              width: r.width,
                              height: r.height,
                              outline: `1px solid ${SEL_COLOR}`,
                              outlineOffset: "-1px",
                              borderRadius: r.radius,
                              cornerShape: r.corner,
                              opacity: 0.55,
                              pointerEvents: "none",
                            } as React.CSSProperties
                          }
                        />
                      ))
                    : null}
                  {ring && !preview ? (
                    <div aria-hidden style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
                      {/* Both lines are drawn as OUTLINES on a zero-border box: an outline
                          is painted outside the box without joining it, so the traced
                          rectangle is the element's own — a border would add its width to
                          the box and overshoot by 2px in each axis. */}
                      {/* The shape outline: the element's box and its own corners. */}
                      <div
                        style={
                          {
                            position: "absolute",
                            top: ring.top,
                            left: ring.left,
                            width: ring.width,
                            height: ring.height,
                            outline: `1px solid ${SEL_COLOR}`,
                            outlineOffset: "-1px",
                            borderRadius: ring.radius,
                            // Not in React's CSSProperties yet; assigned through CSSOM,
                            // where an engine that lacks it drops it harmlessly.
                            cornerShape: ring.corner,
                          } as React.CSSProperties
                        }
                      />
                      {/* The bounding box: always rectangular, whatever the shape. */}
                      <div
                        style={{
                          position: "absolute",
                          top: ring.top,
                          left: ring.left,
                          width: ring.width,
                          height: ring.height,
                          outline: `1px solid ${SEL_COLOR}`,
                          outlineOffset: "-1px",
                        }}
                      />
                      {/* The gutters: a soft fill, never an outline — an outline here would
                          read as another boundary beside the selection's own. */}
                      {bands.map((g, i) => {
                        // Inset on all four sides so the band reads as an object lying in the
                        // gutter rather than a rung fused to the selection outline. Each axis
                        // caps its own inset at a quarter of that dimension, which is what
                        // keeps a 2px gap from insetting itself out of existence: the band
                        // then shrinks WITH the gap instead of disappearing at the bottom of
                        // the scale. It is a target and a location, not a ruler — the drag
                        // states the rung, and the chip names it.
                        const px = Math.min(GAP_BAND_INSET, g.w / 4);
                        const py = Math.min(GAP_BAND_INSET, g.h / 4);
                        const h = g.h - py * 2;
                        const w = g.w - px * 2;
                        // The PAINT may be a hairline; the target may not. At the bottom of
                        // the space scale an inset band is 1-2px, so the hit area grows to a
                        // floor around the true gutter while the paint stays honest — §16's
                        // own move for the mark family, and the shape the corner handles here
                        // already use (14px box, 6px square).
                        const hitH = g.axis === "x" ? g.h : Math.max(g.h, GAP_BAND_HIT);
                        const hitW = g.axis === "x" ? Math.max(g.w, GAP_BAND_HIT) : g.w;
                        return (
                          <div
                            key={i}
                            data-kb-resize
                            onPointerDown={(e) => startGapDrag(e, g.axis)}
                            style={{
                              position: "absolute",
                              top: g.y - (hitH - g.h) / 2,
                              left: g.x - (hitW - g.w) / 2,
                              width: hitW,
                              height: hitH,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              pointerEvents: gapIsResponsive ? "none" : "auto",
                              cursor: gapIsResponsive ? "default" : g.axis === "x" ? "ew-resize" : "ns-resize",
                              touchAction: "none",
                            }}
                          >
                            <div
                              style={{
                                width: w,
                                height: h,
                                background: `${SEL_COLOR}22`,
                                // A capsule: half the SHORT side, which is the system's own
                                // spelling of `full` (§6 states the control capsule as h/2
                                // rather than leaving CSS to clamp a huge number). Stating it
                                // this way also self-limits — a 1px band cannot over-round.
                                borderRadius: Math.min(w, h) / 2,
                              }}
                            />
                          </div>
                        );
                      })}
                      {/* Corner handles, shown only where a size vocabulary exists — their
                          PRESENCE is the information, so a node the system cannot resize
                          shows none rather than a grip that writes nothing. */}
                      {sizeSteps
                        ? (
                            [
                              [ring.top, ring.left, [-1, -1], "nwse-resize"],
                              [ring.top, ring.left + ring.width, [1, -1], "nesw-resize"],
                              [ring.top + ring.height, ring.left, [-1, 1], "nesw-resize"],
                              [ring.top + ring.height, ring.left + ring.width, [1, 1], "nwse-resize"],
                            ] as [number, number, [number, number], string][]
                          ).map(([y, x, out, cursor], i) => (
                            <div
                              key={i}
                              data-kb-resize
                              onPointerDown={(e) => startResize(e, out)}
                              style={{
                                position: "absolute",
                                top: y - 7,
                                left: x - 7,
                                width: 14,
                                height: 14,
                                cursor,
                                pointerEvents: "auto",
                                touchAction: "none",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 4,
                                  background: "#fff",
                                  outline: `1px solid ${SEL_COLOR}`,
                                }}
                              />
                            </div>
                          ))
                        : null}
                      {/* Side handles, on the inline axis only, and only where the parent's
                          measured layout gives this node something to say about its seat. */}
                      {seat
                        ? (
                            [
                              [ring.left, [-1, 0]],
                              [ring.left + ring.width, [1, 0]],
                            ] as [number, [number, number]][]
                          ).map(([x, out], i) => (
                            <div
                              key={i}
                              data-kb-resize
                              onPointerDown={(e) => startSeatDrag(e, out)}
                              style={{
                                position: "absolute",
                                top: ring.top + ring.height / 2 - 11,
                                left: x - 7,
                                width: 14,
                                height: 22,
                                cursor: "ew-resize",
                                pointerEvents: "auto",
                                touchAction: "none",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  insetBlock: 4,
                                  insetInline: 5,
                                  background: "#fff",
                                  outline: `1px solid ${SEL_COLOR}`,
                                }}
                              />
                            </div>
                          ))
                        : null}
                      <div
                        style={{
                          position: "absolute",
                          top: ring.top + ring.height + 8,
                          left: ring.left + ring.width / 2,
                          transform: "translateX(-50%)",
                          background: SEL_COLOR,
                          color: "#fff",
                          font: "500 11px/1 var(--font-body, system-ui)",
                          padding: "4px 6px",
                          borderRadius: "3px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {/* Mid-drag the chip names the RUNG, because that is what the
                            gesture is writing; the pixels are only its consequence. */}
                        {resizing
                          ? `${resizing.label} · ${Math.round(ring.width / zoom)} × ${Math.round(ring.height / zoom)}`
                          : `${Math.round(ring.width / zoom)} × ${Math.round(ring.height / zoom)}`}
                      </div>
                    </div>
                  ) : null}
                  {drop?.line && !preview ? (
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: drop.line.x,
                        top: drop.line.y,
                        width: drop.line.w,
                        height: drop.line.h,
                        background: "var(--focus-ring)",
                        borderRadius: "1px",
                        pointerEvents: "none",
                      }}
                    />
                  ) : null}
                  {drop && !drop.line && drop.boxId ? <DropHint canvasRef={canvasRef} id={drop.boxId} /> : null}
                </div>
              </Box>
              )}
            </Box>
          </ScrollArea>
        </Flex>
        {!preview ? <Separator orientation="vertical" /> : null}

        {/* Right: inspect + theme + review */}
        {!preview ? (
        <Box width="304px" style={{ flex: "none", minHeight: 0 }}>
          <ScrollArea style={{ height: "100%" }}>
            <Box p="3">
              <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as typeof rightTab)}>
                <TabsList size="1">
                  <TabsTab value="inspect">Selected</TabsTab>
                  <TabsTab value="theme">Theme</TabsTab>
                  <TabsTab value="review">{findings.length ? `Review ${findings.length}` : "Review"}</TabsTab>
                </TabsList>
                <TabsPanel value="inspect">
                  <Box pt="3">
                    {selected ? (
                      <Stack gap="5">
                        {/* One panel or the other, never both: two `size` pickers over one
                            selection is a panel arguing with itself about what it edits. */}
                        {state.selection.length > 1 ? (
                          <MultiInspector
                            nodes={selectedNodes}
                            onProp={(key, next) =>
                              commitRoots(updatePropsMany(doc.roots, state.selection, { [key]: next }))
                            }
                          />
                        ) : (
                          <Inspector
                            node={selected}
                            textRef={inspectorTextRef}
                            measured={measured}
                            /* Typing is ONE gesture: every keystroke in a field rides the
                               first one's snapshot, keyed per node and per prop so moving to
                               another field starts a new entry. Without it a two-line
                               description cost 120 undo presses and ~200 characters evicted
                               the whole structural history. */
                            onProp={(key, next, continuous) =>
                              commitRoots(
                                updateProps(doc.roots, selected.id, { [key]: next }),
                                undefined,
                                continuous ? `prop:${selected.id}:${key}` : undefined,
                              )
                            }
                            onText={(next) =>
                              commitRoots(updateText(doc.roots, selected.id, next), undefined, `text:${selected.id}`)
                            }
                            onSelect={(id) => setSelection(id)}
                            onSlot={(slot, type) => {
                              const child = type ? CATALOG[type]!.make() : null;
                              commitRoots(setSlot(doc.roots, selected.id, slot, child), child ? [child.id] : [selected.id]);
                            }}
                          />
                        )}
                        <Separator />
                        <Stack gap="2">
                          <Text size="1" weight="medium">
                            Arrange
                          </Text>
                          <Flex gap="1" wrap="wrap">
                            {["moveUp", "moveDown", "duplicate", "wrapInStack", "wrapInFlex", "unwrap", "delete"].map((id) => {
                              const cmd = COMMANDS.find((c) => c.id === id)!;
                              const on = ctxRef.current ? cmd.enabled(ctxRef.current) : false;
                              return (
                                <Button
                                  key={id}
                                  size="1"
                                  emphasis="quiet"
                                  bordered
                                  {...(id === "delete" ? { tone: "destructive" as const } : {})}
                                  disabled={!on}
                                  onClick={() => runCommand(id)}
                                >
                                  {cmd.title}
                                </Button>
                              );
                            })}
                          </Flex>
                        </Stack>
                        <Stack gap="2">
                          <Text size="1" weight="medium">
                            Save as block
                          </Text>
                          <Flex gap="2">
                            <TextField
                              size="1"
                              placeholder="Block name"
                              aria-label="Block name"
                              value={blockName}
                              onChange={(e) => setBlockName(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && saveBlock()}
                            />
                            <Button size="1" emphasis="medium" disabled={!blockName.trim()} onClick={saveBlock}>
                              Save
                            </Button>
                          </Flex>
                        </Stack>
                      </Stack>
                    ) : (
                      <Text size="1" emphasis="quiet">
                        Click something on the canvas, or pick it in Layers.
                      </Text>
                    )}
                  </Box>
                </TabsPanel>
                <TabsPanel value="theme">
                  <Box pt="3">
                    <ThemePanel theme={doc.theme} onAxis={setThemeAxis} />
                  </Box>
                </TabsPanel>
                <TabsPanel value="review">
                  <Box pt="3">
                    <ReviewPanel
                      findings={findings}
                      selection={state.selection}
                      onSelect={(id) => setSelection(id)}
                      onFix={applyFix}
                    />
                  </Box>
                </TabsPanel>
              </Tabs>
            </Box>
          </ScrollArea>
        </Box>
        ) : null}
      </Flex>

      {/* ── The editor's own dialogs ── */}
      <ContextMenu
        point={contextPoint}
        onOpenChange={(open) => !open && setContextPoint(null)}
        run={(id) => {
          setContextPoint(null);
          runCommand(id);
        }}
        enabled={(id) => {
          const cmd = COMMANDS.find((c) => c.id === id);
          return Boolean(cmd && ctxRef.current && cmd.enabled(ctxRef.current));
        }}
        titleOf={(id) => COMMANDS.find((c) => c.id === id)?.title ?? id}
        inserts={contextInserts}
        onInsert={(type) => {
          setContextPoint(null);
          insertType(type);
        }}
      />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} ctx={ctx} />
      <ShortcutSheet open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <Dialog
        size="3"
        open={exportOpen}
        onOpenChange={(open) => {
          setExportOpen(open);
          if (!open) setExportBlock(null);
        }}
      >
        <DialogContent>
          <Stack gap="5">
            <Stack gap="2">
              <DialogTitle>{exportBlock === null ? "Export" : `Export ${blocks[exportBlock]?.name ?? "block"}`}</DialogTitle>
              <DialogDescription>
                {exportBlock === null
                  ? "Ready to paste: real imports, only the props you stated, a Theme only where your document differs from the system's defaults."
                  : "A component with your words as props and every axis frozen — what the block's author decided stays decided."}
              </DialogDescription>
            </Stack>
            <Card size="2">
              <Box overflow="auto" style={{ maxHeight: "50vh" }}>
                <Text size="1" render={<pre />} style={{ fontFamily: "var(--font-mono)" }}>
                  {code}
                </Text>
              </Box>
            </Card>
            <Flex gap="3" justify="flex-end">
              <Button emphasis="quiet" bordered onClick={() => ui.downloadDocument()}>
                Download JSON
              </Button>
              <DialogClose render={<Button emphasis="quiet" bordered>Close</Button>} />
              <Button
                emphasis="loud"
                onClick={() => {
                  void navigator.clipboard?.writeText(code).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  });
                }}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </Flex>
          </Stack>
        </DialogContent>
      </Dialog>
      {/* A document arrives as a file: read, sanitized against today's catalog by the store's
          own reviver, and opened as a NEW document rather than over the current one. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          void file.text().then((text) => {
            try {
              const parsed = JSON.parse(text) as { name?: string; theme?: DocTheme; roots?: BuilderNode[] };
              const roots = (parsed.roots ?? [])
                .map((n) => sanitizeNode(n))
                .filter((n): n is BuilderNode => n !== null)
                .map(cloneWithNewIds);
              if (roots.length === 0) {
                say("That file holds nothing this system can place");
                return;
              }
              dispatch({
                type: "docNew",
                name: parsed.name || file.name.replace(/\.[^.]+$/, ""),
                doc: { theme: { ...defaultDocTheme(), ...parsed.theme }, roots },
              });
              say(`Opened ${parsed.name || file.name}`);
            } catch {
              say("That file is not a builder document");
            }
          });
        }}
      />
      {/* The selection, announced. The canvas deliberately never takes focus — a click there
          is selection, not operation — so without this a screen-reader user gets no signal
          that anything happened. The jump bar states the same fact visually. */}
      <Box
        aria-live="polite"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}
      >
        {selected
          ? `${selected.type} selected${state.selection.length > 1 ? `, ${state.selection.length} in total` : ""}`
          : "Nothing selected"}
      </Box>
      <Toast message={toast} />
    </Flex>
  );
}

/* ── Small pieces ──────────────────────────────────────────────────────────────────────── */

/**
 * The same document in four rooms at once.
 *
 * This is a comparison a viewport-keyed system cannot honestly show: it would have to
 * emulate four windows. Here the tiers are CONTAINER queries, so four boxes on one screen
 * resolve four different answers for real — every per-tier value in the document is doing
 * its actual work, in the actual browser, side by side.
 *
 * Read-only on purpose. Editing in one of four copies raises "which one am I editing", and
 * the answer would have to be arbitrary.
 */
function TierCompare({ doc }: { doc: BuilderDoc }) {
  // DERIVED from the package's own table, plus one sample BELOW the first boundary — the
  // `initial` answer is a tier too, and it is the one people forget to look at.
  const rooms: [string, string][] = [["initial", "22rem"], ...(Object.entries(tiers) as [string, string][])];
  return (
    <Stack gap="6">
      {rooms.map(([name, width]) => (
        <Stack key={name} gap="2">
          <Flex align="center" gap="2">
            <Text size="1" weight="medium">
              {name}
            </Text>
            <Text size="1" emphasis="quiet">
              {width}
            </Text>
          </Flex>
          <Theme
            appearance={doc.theme.appearance}
            density={doc.theme.density}
            pointer={doc.theme.pointer}
            radius={doc.theme.radius}
            depth={doc.theme.depth}
            material={doc.theme.material}
          >
            <Box container width={width} style={{ maxWidth: "100%" }}>
              <Stack gap="5">{doc.roots.map((r) => renderNode(r, "export"))}</Stack>
            </Box>
          </Theme>
        </Stack>
      ))}
    </Stack>
  );
}

function PaletteGroup({
  label,
  entries,
  canInsert,
  onInsert,
  onDragBegin,
  onDragFinish,
}: {
  label: string;
  entries: [string, CatalogEntry][];
  canInsert: (type: string) => boolean;
  onInsert: (type: string) => void;
  onDragBegin: (payload: DragPayload) => void;
  onDragFinish: () => void;
}) {
  if (entries.length === 0) return null;
  return (
    <Stack gap="2">
      <Text size="1" weight="medium">
        {label}
      </Text>
      <Grid columns="repeat(2, minmax(0, 1fr))" gap="1">
        {entries.map(([type, entry]) => (
          <Button
            key={type}
            size="1"
            emphasis="quiet"
            disabled={!canInsert(type)}
            title={entry.blurb}
            draggable
            onDragStart={(e) => {
              onDragBegin({ kind: "insert", type });
              e.dataTransfer.setData(DRAG_TYPE, type);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onDragEnd={onDragFinish}
            onClick={() => onInsert(type)}
            style={{ justifyContent: "flex-start" }}
          >
            {type}
          </Button>
        ))}
      </Grid>
    </Stack>
  );
}

function TreeRows({
  node: n,
  depth,
  selection,
  onSelect,
  dropRow,
  onDragBegin,
  onDragFinish,
  canRowDrop,
  onHoverRow,
  onRowDrop,
  visible,
}: {
  node: BuilderNode;
  depth: number;
  selection: string[];
  onSelect: (id: string, additive: boolean) => void;
  dropRow: { id: string; mode: "before" | "into" | "after" } | null;
  onDragBegin: (id: string) => void;
  onDragFinish: () => void;
  canRowDrop: (id: string, mode: "before" | "into" | "after") => boolean;
  onHoverRow: (spot: { id: string; mode: "before" | "into" | "after" } | null) => void;
  onRowDrop: (id: string, mode: "before" | "into" | "after") => void;
  /** The filter's answer, or null for no filter. A row outside it is not drawn — dimming it
      would leave a tree you have to read past to use. */
  visible: Set<string> | null;
}) {
  if (visible && !visible.has(n.id)) return null;
  /** Which third of the row the pointer is in. The edges are deliberately narrow (a quarter
      each): "into" is the common intent, and a tree where every hover lands between rows is
      a tree you fight. */
  const thirdOf = (e: React.DragEvent<HTMLElement>): "before" | "into" | "after" => {
    const box = e.currentTarget.getBoundingClientRect();
    const y = (e.clientY - box.top) / box.height;
    return y < 0.25 ? "before" : y > 0.75 ? "after" : "into";
  };
  const label = n.text ? `${n.type} · ${n.text.slice(0, 18)}${n.text.length > 18 ? "…" : ""}` : n.type;
  const pass = { dropRow, onDragBegin, onDragFinish, canRowDrop, onHoverRow, onRowDrop, visible };
  return (
    <>
      <Box
        role="treeitem"
        aria-level={depth + 1}
        aria-selected={selection.includes(n.id)}
        {...(n.children?.length ? { "aria-expanded": true } : {})}
        style={{ paddingInlineStart: `calc(${depth} * var(--layout-space-4))`, display: "flex" }}
      >
        <Button
          size="1"
          emphasis={selection.includes(n.id) ? "medium" : "quiet"}
          aria-pressed={selection.includes(n.id)}
          bordered={dropRow?.id === n.id && dropRow.mode === "into"}
          onClick={(e) => onSelect(n.id, e.shiftKey || e.metaKey || e.ctrlKey)}
          draggable
          onDragStart={(e) => {
            onDragBegin(n.id);
            e.dataTransfer.setData(MOVE_TYPE, n.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={onDragFinish}
          onDragOver={(e) => {
            const mode = thirdOf(e);
            if (!canRowDrop(n.id, mode)) return;
            e.preventDefault();
            e.stopPropagation();
            if (dropRow?.id !== n.id || dropRow.mode !== mode) onHoverRow({ id: n.id, mode });
          }}
          onDragLeave={() => onHoverRow(null)}
          onDrop={(e) => {
            const mode = thirdOf(e);
            e.preventDefault();
            e.stopPropagation();
            onRowDrop(n.id, mode);
          }}
          style={{
            justifyContent: "flex-start",
            flex: 1,
            // The between-rows line: drawn on the row itself, so it cannot drift from the
            // row it names the way a separately positioned overlay could.
            ...(dropRow?.id === n.id && dropRow.mode !== "into"
              ? { boxShadow: `inset 0 ${dropRow.mode === "before" ? "" : "-"}2px 0 0 ${SEL_COLOR}` }
              : {}),
          }}
        >
          {label}
        </Button>
      </Box>
      {n.children?.map((c) => (
        <TreeRows key={c.id} node={c} depth={depth + 1} selection={selection} onSelect={onSelect} {...pass} />
      ))}
    </>
  );
}

/** The drop highlight — the same instrument as the ring, dashed. */
function DropHint({ canvasRef, id }: { canvasRef: React.RefObject<HTMLDivElement | null>; id: string }) {
  const [rect, setRect] = React.useState<{ top: number; left: number; width: number; height: number } | null>(null);
  React.useLayoutEffect(() => {
    const wrap = canvasRef.current;
    const el = wrap?.querySelector(`[data-b-id="${id}"]`);
    if (!wrap || !el) {
      setRect(null);
      return;
    }
    const a = el.getBoundingClientRect();
    const b = wrap.getBoundingClientRect();
    setRect({ top: a.top - b.top, left: a.left - b.left, width: a.width, height: a.height });
  }, [canvasRef, id]);
  if (!rect) return null;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: rect.top - 2,
        left: rect.left - 2,
        width: rect.width + 4,
        height: rect.height + 4,
        border: "1px dashed var(--focus-ring)",
        borderRadius: "8px",
        pointerEvents: "none",
      }}
    />
  );
}
