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
import { CATALOG, canContain, paletteEntries, sanitizeNode, PALETTE_FAMILIES, type CatalogEntry } from "./catalog";
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

type DragPayload = { kind: "insert"; type: string } | { kind: "move"; id: string } | { kind: "block"; index: number };

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
  React.useEffect(() => {
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

  /** The DOM element that stands for a node — its own stamp, or (for a phantom root like
      Menu) the first stamped element inside it. */
  const elementFor = (n: BuilderNode): Element | null => {
    const wrap = canvasRef.current;
    if (!wrap) return null;
    const own = wrap.querySelector(`[data-b-id="${n.id}"]`);
    if (own) return own;
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

  const [ring, setRing] = React.useState<{ top: number; left: number; width: number; height: number } | null>(null);
  React.useLayoutEffect(() => {
    const wrap = canvasRef.current;
    if (!wrap || !selection) {
      setRing(null);
      return;
    }
    const measure = () => {
      const el = wrap.querySelector(`[data-b-id="${selection}"]`);
      if (!el) {
        setRing(null);
        return;
      }
      const a = el.getBoundingClientRect();
      const b = wrap.getBoundingClientRect();
      setRing({ top: a.top - b.top, left: a.left - b.left, width: a.width, height: a.height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [selection, doc, canvasW]);

  const onCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as Element).closest("[data-kb-width-handle]")) return;
    const el = (e.target as Element).closest("[data-b-id]");
    setSelection(el ? el.getAttribute("data-b-id") : null);
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
                    surfaceLook={doc.theme.surfaceLook}
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
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: ring.top - 3,
                        left: ring.left - 3,
                        width: ring.width + 6,
                        height: ring.height + 6,
                        border: "var(--focus-ring-width) solid var(--focus-ring)",
                        borderRadius: "8px",
                        pointerEvents: "none",
                      }}
                    />
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
