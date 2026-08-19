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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Box,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Flex,
  Grid,
  Heading,
  Kbd,
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

import { XIcon } from "../icons";
import { CATALOG, canContain, gapStepsFor, paletteEntries, sanitizeNode, seatVocabularyFor, sizeStepsFor, PALETTE_FAMILIES, type CatalogEntry, type SeatVocabulary } from "./catalog";
import {
  ancestorChain,
  cloneWithNewIds,
  defaultDocTheme,
  findNode,
  findParent,
  insertNode,
  moveNode,
  moveNodeTo,
  node,
  removeNode,
  updateProps,
  updateText,
  withStableIds,
  type BuilderDoc,
  type BuilderNode,
  type DocTheme,
} from "./model";
import { renderNode } from "./render";
import { serializeDocument } from "./serialize";
import { Inspector, ThemePanel } from "./inspector";

const DOC_KEY = "kookie-builder-doc-v1";
const BLOCKS_KEY = "kookie-builder-blocks-v1";
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

type Block = { name: string; node: BuilderNode };

/** The starter document: enough to show the idea the second the page opens. Ids are the
    STABLE set — this tree is built during render on both server and client, where the
    module counter is not safe (see withStableIds). */
const starterDoc = (): BuilderDoc => ({
  theme: defaultDocTheme(),
  roots: withStableIds([
    node("Card", { size: "3" }, {
      children: [
        node("Stack", { gap: "4" }, {
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

/* ── History: undo is a stack of documents, because every model op is pure ─────────────── */

type History = { past: BuilderDoc[]; present: BuilderDoc; future: BuilderDoc[] };

/** The ancestor TYPES above-and-including a prospective parent — what `canContain` asks. */
const typesThrough = (roots: BuilderNode[], parentId: string | null): string[] => {
  if (parentId === null) return [];
  const parent = findNode(roots, parentId);
  if (!parent) return [];
  return [...ancestorChain(roots, parentId).map((a) => a.type), parent.type];
};

/** Where a palette insertion lands, relative to the selection: the selected node if it
    accepts, else the nearest accepting ancestor (inserted after the selection's branch),
    else the document root. Null means nowhere — the palette button disables. */
const insertionTarget = (
  roots: BuilderNode[],
  selection: string | null,
  type: string,
): { parentId: string | null; index?: number } | null => {
  if (selection) {
    const chain = [...ancestorChain(roots, selection), findNode(roots, selection)].filter(
      (x): x is BuilderNode => x !== null,
    );
    for (let i = chain.length - 1; i >= 0; i--) {
      const parent = chain[i]!;
      const chainTypes = chain.slice(0, i + 1).map((c) => c.type);
      if (canContain(parent.type, type, chainTypes)) {
        // Inserting into an ancestor lands beside the branch the selection is on, not at
        // the end — the gesture means "next to what I'm looking at".
        const branch = chain[i + 1];
        const at = branch ? (parent.children?.findIndex((c) => c.id === branch.id) ?? -1) + 1 : 0;
        return at > 0 ? { parentId: parent.id, index: at } : { parentId: parent.id };
      }
    }
  }
  return canContain(null, type, []) ? { parentId: null } : null;
};

export function BuilderApp() {
  const [history, setHistory] = React.useState<History>(() => ({ past: [], present: starterDoc(), future: [] }));
  const [selection, setSelection] = React.useState<string | null>(null);
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [blockName, setBlockName] = React.useState("");
  const [drop, setDrop] = React.useState<DropSpot | null>(null);
  const [dropRow, setDropRow] = React.useState<string | null>(null);
  /** What is being dragged, held in a ref because HTML5 DnD only surfaces payload DATA on
      drop — during dragover only the type names are readable, and the grammar needs the
      component type to say yes or no while hovering. Same-window drags own this fully. */
  const dragRef = React.useRef<DragPayload | null>(null);
  const [copied, setCopied] = React.useState(false);
  /** null = full width. A dragged width makes the canvas narrower than its column, and
      because the canvas is a container, every per-tier value inside responds for real. */
  const [canvasW, setCanvasW] = React.useState<number | null>(null);

  const doc = history.present;
  const selected = selection ? findNode(doc.roots, selection) : null;

  const commit = React.useCallback((next: BuilderDoc) => {
    setHistory((h) => ({ past: [...h.past.slice(-63), h.present], present: next, future: [] }));
  }, []);
  const commitRoots = React.useCallback(
    (roots: BuilderNode[]) => commit({ ...history.present, roots }),
    [commit, history.present],
  );
  const undo = React.useCallback(() => {
    setHistory((h) => {
      const prev = h.past[h.past.length - 1];
      return prev ? { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future] } : h;
    });
  }, []);
  const redo = React.useCallback(() => {
    setHistory((h) => {
      const next = h.future[0];
      return next ? { past: [...h.past, h.present], present: next, future: h.future.slice(1) } : h;
    });
  }, []);

  /* Storage: load once after mount (hydration must match the server's default branch),
     sanitize against today's catalog, re-mint ids so the id counter cannot collide. */
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(DOC_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BuilderDoc;
        const roots = (parsed.roots ?? [])
          .map(sanitizeNode)
          .filter((n): n is BuilderNode => n !== null)
          .map(cloneWithNewIds);
        setHistory({ past: [], present: { theme: { ...defaultDocTheme(), ...parsed.theme }, roots }, future: [] });
      }
      const rawBlocks = localStorage.getItem(BLOCKS_KEY);
      if (rawBlocks) {
        const parsed = JSON.parse(rawBlocks) as Block[];
        setBlocks(
          parsed
            .map((b) => ({ name: String(b.name), node: b.node && sanitizeNode(b.node) }))
            .filter((b): b is Block => b.node !== null && b.node !== undefined && b.name.length > 0),
        );
      }
    } catch {
      // Storage denied or corrupt: the session runs from memory, exactly as designed.
    }
  }, []);
  /* The write-through must not run before the load has landed. Both effects fire on mount in
     declaration order, so an unguarded write saved the STARTER document — the value this
     render still holds — straight over the stored one; under StrictMode's double-invocation
     the second pass then read that starter back, and a reload lost the document outright
     (measured: two roots before, one after). Guarding on the initial document's IDENTITY is
     what makes it safe on both passes: there is nothing to persist until the document stops
     being the one nobody has edited. */
  const untouched = React.useRef(history.present);
  React.useEffect(() => {
    if (doc === untouched.current) return;
    try {
      localStorage.setItem(DOC_KEY, JSON.stringify(doc));
    } catch {}
  }, [doc]);
  React.useEffect(() => {
    try {
      localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
    } catch {}
  }, [blocks]);

  /* Undo/redo from the keyboard, everywhere except inside a field. */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  /* ── Gestures ────────────────────────────────────────────────────────────────────── */

  const insertType = (type: string) => {
    const target = insertionTarget(doc.roots, selection, type);
    if (!target) return;
    const fresh = CATALOG[type]!.make();
    commitRoots(insertNode(doc.roots, target.parentId, fresh, target.index));
    setSelection(fresh.id);
  };

  const insertBlock = (block: Block) => {
    const fresh = cloneWithNewIds(block.node);
    const target = insertionTarget(doc.roots, selection, fresh.type) ?? { parentId: null };
    commitRoots(insertNode(doc.roots, target.parentId, fresh, target.index));
    setSelection(fresh.id);
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const parent = findParent(doc.roots, selected.id);
    const siblings = parent ? (parent.children ?? []) : doc.roots;
    const index = siblings.findIndex((c) => c.id === selected.id) + 1;
    const copy = cloneWithNewIds(selected);
    commitRoots(insertNode(doc.roots, parent?.id ?? null, copy, index));
    setSelection(copy.id);
  };

  const deleteSelected = () => {
    if (!selection) return;
    commitRoots(removeNode(doc.roots, selection));
    setSelection(null);
  };

  const saveBlock = () => {
    if (!selected || !blockName.trim()) return;
    setBlocks((b) => [...b, { name: blockName.trim(), node: cloneWithNewIds(selected) }]);
    setBlockName("");
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
    const cs = getComputedStyle(containerEl as HTMLElement);
    const horizontal = cs.display.includes("flex") && cs.flexDirection.startsWith("row");
    let index = 0;
    for (const { r } of measured) {
      const mid = horizontal ? r.left + r.width / 2 : r.top + r.height / 2;
      if ((horizontal ? clientX : clientY) > mid) index += 1;
    }
    const before = measured[index - 1]?.r;
    const after = measured[index]?.r;
    const at = horizontal
      ? before && after
        ? (before.right + after.left) / 2
        : before
          ? before.right + 3
          : after!.left - 3
      : before && after
        ? (before.bottom + after.top) / 2
        : before
          ? before.bottom + 3
          : after!.top - 3;
    const line = horizontal
      ? {
          x: at - wrapRect.left - 1,
          y: Math.min(...measured.map((m) => m.r.top)) - wrapRect.top,
          w: 2,
          h: Math.max(...measured.map((m) => m.r.height)),
        }
      : {
          x: Math.min(...measured.map((m) => m.r.left)) - wrapRect.left,
          y: at - wrapRect.top - 1,
          w: Math.max(...measured.map((m) => m.r.width)),
          h: 2,
        };
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
        if (target && canContain(target.type, d.type, typesThrough(doc.roots, id))) {
          return spotIn(target, clientX, clientY);
        }
      }
      cursor = cursor.parentElement?.closest("[data-b-id]") ?? null;
    }
    return canContain(null, d.type, []) ? spotIn(null, clientX, clientY) : null;
  };

  const onCanvasDragStart = (e: React.DragEvent) => {
    const el = (e.target as Element).closest("[data-b-id]");
    if (!el) return;
    const id = el.getAttribute("data-b-id")!;
    dragRef.current = { kind: "move", id };
    e.dataTransfer.setData(MOVE_TYPE, id);
    e.dataTransfer.effectAllowed = "move";
    setSelection(id);
  };

  const onCanvasDragOver = (e: React.DragEvent) => {
    if (!dragRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = dragRef.current.kind === "move" ? "move" : "copy";
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

  /* Tree rows: drop ON a row means INTO it when its grammar accepts, else right after it. */
  const rowSpot = (rowId: string): { parentId: string | null; index?: number } | null => {
    const d = dragged();
    if (!d) return null;
    const movingNode = d.movingId ? findNode(doc.roots, d.movingId) : null;
    if (movingNode && (rowId === d.movingId || findNode([movingNode], rowId) !== null)) return null;
    const row = findNode(doc.roots, rowId);
    if (!row) return null;
    if (canContain(row.type, d.type, typesThrough(doc.roots, rowId))) return { parentId: rowId };
    const parent = findParent(doc.roots, rowId);
    const siblings = parent ? (parent.children ?? []) : doc.roots;
    const index = siblings.findIndex((c) => c.id === rowId) + 1;
    const chain = parent ? typesThrough(doc.roots, parent.id) : [];
    if (canContain(parent?.id ? parent.type : null, d.type, chain)) {
      return parent ? { parentId: parent.id, index } : { parentId: null, index };
    }
    return null;
  };

  const onRowDrop = (rowId: string) => {
    const d = dragged();
    const spot = rowSpot(rowId);
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

    const rows: DOMRect[][] = [];
    for (const r of [...kids].sort((p, q) => p.top - q.top || p.left - q.left)) {
      const row = rows[rows.length - 1];
      // Same visual row when the boxes overlap vertically at all — robust against items of
      // different heights sitting on one line, which a top-coordinate match is not.
      const sameRow = row && r.top < Math.max(...row.map((x) => x.bottom));
      if (sameRow) row.push(r);
      else rows.push([r]);
    }

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
  React.useLayoutEffect(() => {
    const wrap = canvasRef.current;
    if (!wrap || !selection) {
      setRing(null);
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
        const node = findNode(history.present.roots, selection);
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
  }, [selection]);

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
      const along = ((ev.clientX - startX) * out[0] + (ev.clientY - startY) * out[1]) / Math.sqrt(span);
      const next = Math.min(steps.length - 1, Math.max(-1, from + Math.round(along / RESIZE_STEP_PX)));
      if (next === last) return;
      last = next;
      // -1 is the UNSET rung, which is a real value: a hugging item, a one-column cell.
      const value = next < 0 ? undefined : steps[next]!;
      setResizing({ label: label(value) });
      // Written through the updater form: the document this drag started on goes stale the
      // moment the first step commits, so each step must read the live present.
      const push = !pushed;
      pushed = true;
      setHistory((h) => {
        const present = { ...h.present, roots: updateProps(h.present.roots, selected.id, write(value)) };
        return push ? { past: [...h.past.slice(-63), h.present], present, future: [] } : { ...h, present, future: [] };
      });
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
    if ((e.target as Element).closest("[data-kb-width-handle], [data-kb-resize]")) return;
    // Nearest of stamp-or-field-wrapper: a click on a field's padding lands on the
    // unstamped wrapper, and walking past it would select the field's PARENT.
    const near = (e.target as Element).closest("[data-b-id], .kui-field");
    const el =
      near && !near.hasAttribute("data-b-id")
        ? near.querySelector(":scope > .kui-field-input[data-b-id]")
        : near;
    setSelection(el ? el.getAttribute("data-b-id") : null);
  };

  /* A canvas control never takes real focus: clicking is selection, not operation (the
     same trade drag-to-move already made of text selection — the inspector is where a
     field is edited). Blurring in the focus event itself, rather than preventing the
     mousedown, keeps native drag alive in every engine; the width handle's own focus
     (arrow-key resize) never matches the stamp and survives. */
  const onCanvasFocus = (e: React.FocusEvent) => {
    if ((e.target as Element).closest("[data-b-id]")) (e.target as HTMLElement).blur();
  };

  /* The width handle: drag (or arrow keys) to give the canvas a narrower room. */
  const startWidthDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = canvasRef.current;
    if (!wrap) return;
    const startX = e.clientX;
    const startW = wrap.offsetWidth;
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) =>
      setCanvasW(Math.max(280, Math.round(startW + ev.clientX - startX)));
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
      return serializeDocument(doc);
    } catch (err) {
      return `// ${err instanceof Error ? err.message : String(err)}`;
    }
  }, [doc]);

  const setThemeAxis = (axis: keyof DocTheme, value: string) =>
    commit({ ...doc, theme: { ...doc.theme, [axis]: value } });

  /* Parts the current selection can hold directly — the contextual half of the palette. */
  const contextualParts: [string, CatalogEntry][] = selected
    ? Object.entries(CATALOG).filter(
        ([type, entry]) =>
          entry.partOf && canContain(selected.type, type, typesThrough(doc.roots, selected.id)),
      )
    : [];

  return (
    <Flex direction="column" style={{ height: "100dvh" }}>
      {/* ── Top bar ── */}
      <Flex align="center" justify="space-between" px="4" py="2" gapX="4">
        <Heading size="3" render={<h1 />}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            Builder
          </Link>
        </Heading>
        <Flex align="center" gap="2">
          <Button size="1" emphasis="quiet" disabled={history.past.length === 0} onClick={undo} trailing={<Kbd>⌘Z</Kbd>}>
            Undo
          </Button>
          <Button size="1" emphasis="quiet" disabled={history.future.length === 0} onClick={redo}>
            Redo
          </Button>
          <AlertDialog size="1">
            <AlertDialogTrigger render={<Button size="1" emphasis="quiet">Reset</Button>} />
            <AlertDialogContent>
              <AlertDialogTitle>Start over?</AlertDialogTitle>
              <AlertDialogDescription>The current document is replaced by the starter. Saved blocks stay.</AlertDialogDescription>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                tone="destructive"
                onClick={() => {
                  commit(starterDoc());
                  setSelection(null);
                }}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
          <Dialog size="3">
            <DialogTrigger render={<Button size="1" tone="accent" emphasis="loud">Export code</Button>} />
            <DialogContent>
              <Stack gap="4">
                <Stack gap="2">
                  <DialogTitle>Export</DialogTitle>
                  <DialogDescription>
                    Ready to paste: real imports, only the props you stated, a Theme only where your
                    document differs from the system&apos;s defaults.
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
        </Flex>
      </Flex>
      <Separator />

      {/* ── Three panes ── */}
      <Flex align="stretch" style={{ flex: 1, minHeight: 0 }}>
        {/* Left: add + layers */}
        <Box width="272px" style={{ flex: "none", minHeight: 0 }}>
          <ScrollArea style={{ height: "100%" }}>
            <Box p="3">
              <Tabs defaultValue="add">
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
                              <Button
                                size="1"
                                emphasis="quiet"
                                iconOnly
                                aria-label={`Remove the block ${b.name}`}
                                onClick={() => setBlocks((list) => list.filter((_, j) => j !== i))}
                              >
                                <XIcon />
                              </Button>
                            </Flex>
                          ))
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                </TabsPanel>
                <TabsPanel value="layers">
                  <Box pt="3">
                    <Stack gap="1">
                      {doc.roots.length === 0 ? (
                        <Text size="1" emphasis="quiet">
                          The canvas is empty.
                        </Text>
                      ) : (
                        doc.roots.map((r) => (
                          <TreeRows
                            key={r.id}
                            node={r}
                            depth={0}
                            selection={selection}
                            onSelect={setSelection}
                            dropRow={dropRow}
                            onDragBegin={(id) => {
                              dragRef.current = { kind: "move", id };
                              setSelection(id);
                            }}
                            onDragFinish={endDrag}
                            canRowDrop={(id) => rowSpot(id) !== null}
                            onHoverRow={setDropRow}
                            onRowDrop={onRowDrop}
                          />
                        ))
                      )}
                    </Stack>
                  </Box>
                </TabsPanel>
              </Tabs>
            </Box>
          </ScrollArea>
        </Box>
        <Separator orientation="vertical" />

        {/* Center: the live canvas */}
        <Box style={{ flex: 1, minWidth: 0, minHeight: 0, background: "var(--neutral-2)" }}>
          <ScrollArea style={{ height: "100%" }}>
            <Box
              p="6"
              onClickCapture={onCanvasClick}
              onFocusCapture={onCanvasFocus}
              onDragStartCapture={onCanvasDragStart}
              onDragOver={onCanvasDragOver}
              onDrop={onCanvasDrop}
              onDragLeave={onCanvasDragLeave}
              onDragEnd={endDrag}
              style={{ minHeight: "100%" }}
            >
              <Box maxWidth="880px" style={{ marginInline: "auto" }}>
                {canvasW ? (
                  <Flex gap="2" align="center" justify="flex-end" pb="2">
                    <Text size="1" emphasis="quiet">
                      {`${canvasW}px · ${activeTier(canvasW)}`}
                    </Text>
                    <Button size="1" emphasis="quiet" onClick={() => setCanvasW(null)}>
                      Full width
                    </Button>
                  </Flex>
                ) : null}
                <div
                  ref={canvasRef}
                  style={{ position: "relative", width: canvasW ? `${canvasW}px` : "100%", maxWidth: "100%" }}
                >
                  <Theme
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
                      <Stack gap="5">
                        {doc.roots.length === 0 ? (
                          <Text size="2" emphasis="quiet">
                            Drop something here, or add it from the palette.
                          </Text>
                        ) : (
                          doc.roots.map((r) => renderNode(r, "canvas"))
                        )}
                      </Stack>
                    </Box>
                  </Theme>
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
                  {ring ? (
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
                          ? `${resizing.label} · ${Math.round(ring.width)} × ${Math.round(ring.height)}`
                          : `${Math.round(ring.width)} × ${Math.round(ring.height)}`}
                      </div>
                    </div>
                  ) : null}
                  {drop?.line ? (
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
            </Box>
          </ScrollArea>
        </Box>
        <Separator orientation="vertical" />

        {/* Right: inspect + theme */}
        <Box width="304px" style={{ flex: "none", minHeight: 0 }}>
          <ScrollArea style={{ height: "100%" }}>
            <Box p="3">
              <Tabs defaultValue="inspect">
                <TabsList size="1">
                  <TabsTab value="inspect">Selected</TabsTab>
                  <TabsTab value="theme">Theme</TabsTab>
                </TabsList>
                <TabsPanel value="inspect">
                  <Box pt="3">
                    {selected ? (
                      <Stack gap="4">
                        <Inspector
                          node={selected}
                          onProp={(key, next) => commitRoots(updateProps(doc.roots, selected.id, { [key]: next }))}
                          onText={(next) => commitRoots(updateText(doc.roots, selected.id, next))}
                        />
                        <Separator />
                        <Flex gap="2" wrap="wrap">
                          <Button size="1" emphasis="quiet" bordered onClick={() => commitRoots(moveNode(doc.roots, selected.id, -1))}>
                            Up
                          </Button>
                          <Button size="1" emphasis="quiet" bordered onClick={() => commitRoots(moveNode(doc.roots, selected.id, 1))}>
                            Down
                          </Button>
                          <Button size="1" emphasis="quiet" bordered onClick={duplicateSelected}>
                            Duplicate
                          </Button>
                          <Button size="1" emphasis="quiet" tone="destructive" bordered onClick={deleteSelected}>
                            Delete
                          </Button>
                        </Flex>
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
              </Tabs>
            </Box>
          </ScrollArea>
        </Box>
      </Flex>
    </Flex>
  );
}

/* ── Small pieces ──────────────────────────────────────────────────────────────────────── */

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
}: {
  node: BuilderNode;
  depth: number;
  selection: string | null;
  onSelect: (id: string) => void;
  dropRow: string | null;
  onDragBegin: (id: string) => void;
  onDragFinish: () => void;
  canRowDrop: (id: string) => boolean;
  onHoverRow: (id: string | null) => void;
  onRowDrop: (id: string) => void;
}) {
  const label = n.text ? `${n.type} · ${n.text.slice(0, 18)}${n.text.length > 18 ? "…" : ""}` : n.type;
  const pass = { dropRow, onDragBegin, onDragFinish, canRowDrop, onHoverRow, onRowDrop };
  return (
    <>
      <Box style={{ paddingInlineStart: `calc(${depth} * var(--layout-space-4))`, display: "flex" }}>
        <Button
          size="1"
          emphasis={selection === n.id ? "medium" : "quiet"}
          aria-pressed={selection === n.id}
          bordered={dropRow === n.id}
          onClick={() => onSelect(n.id)}
          draggable
          onDragStart={(e) => {
            onDragBegin(n.id);
            e.dataTransfer.setData(MOVE_TYPE, n.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={onDragFinish}
          onDragOver={(e) => {
            if (!canRowDrop(n.id)) return;
            e.preventDefault();
            e.stopPropagation();
            onHoverRow(n.id);
          }}
          onDragLeave={() => onHoverRow(null)}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRowDrop(n.id);
          }}
          style={{ justifyContent: "flex-start", flex: 1 }}
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
