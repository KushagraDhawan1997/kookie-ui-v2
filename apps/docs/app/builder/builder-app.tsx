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
} from "@kookie-ui/react";

import { CATALOG, canContain, paletteEntries, sanitizeNode, PALETTE_FAMILIES, type CatalogEntry } from "./catalog";
import {
  ancestorChain,
  cloneWithNewIds,
  defaultDocTheme,
  findNode,
  findParent,
  insertNode,
  moveNode,
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
  const [dropTarget, setDropTarget] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

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

  /* Drag from the palette; drop onto the nearest container that accepts the type. */
  const dropParentFor = (el: Element | null, type: string): string | null | undefined => {
    let cursor = el?.closest("[data-b-id]") ?? null;
    while (cursor) {
      const id = cursor.getAttribute("data-b-id")!;
      const target = findNode(doc.roots, id);
      if (target && canContain(target.type, type, typesThrough(doc.roots, id))) return id;
      cursor = cursor.parentElement?.closest("[data-b-id]") ?? null;
    }
    return canContain(null, type, []) ? null : undefined; // null = root; undefined = nowhere
  };

  const onCanvasDragOver = (e: React.DragEvent) => {
    const type = e.dataTransfer.types.includes(DRAG_TYPE) ? "pending" : null;
    if (!type) return;
    e.preventDefault(); // the drop is legal somewhere (root at worst); refined on drop
    const el = e.target as Element;
    const hit = el.closest("[data-b-id]");
    const id = hit?.getAttribute("data-b-id") ?? null;
    if (id !== dropTarget) setDropTarget(id);
  };

  const onCanvasDrop = (e: React.DragEvent) => {
    const type = e.dataTransfer.getData(DRAG_TYPE);
    setDropTarget(null);
    if (!type || !CATALOG[type]) return;
    e.preventDefault();
    const parentId = dropParentFor(e.target as Element, type);
    if (parentId === undefined) return;
    const fresh = CATALOG[type]!.make();
    commitRoots(insertNode(doc.roots, parentId, fresh));
    setSelection(fresh.id);
  };

  /* ── Selection ring: an instrument, measured off the live DOM ─────────────────────── */

  const canvasRef = React.useRef<HTMLDivElement | null>(null);
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
  }, [selection, doc]);

  const onCanvasClick = (e: React.MouseEvent) => {
    const el = (e.target as Element).closest("[data-b-id]");
    setSelection(el ? el.getAttribute("data-b-id") : null);
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
      <Flex align="center" justify="space-between" p="3" gapX="4">
        <Flex align="center" gap="4">
          <Heading size="4" render={<h1 />}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              Builder
            </Link>
          </Heading>
          <Text size="1" emphasis="quiet">
            Compose with tokens; export real code.
          </Text>
        </Flex>
        <Flex align="center" gap="2">
          <Button size="1" emphasis="quiet" bordered disabled={history.past.length === 0} onClick={undo} trailing={<Kbd>⌘Z</Kbd>}>
            Undo
          </Button>
          <Button size="1" emphasis="quiet" bordered disabled={history.future.length === 0} onClick={redo}>
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
                        />
                      ) : null}
                      {PALETTE_FAMILIES.map((family) => (
                        <PaletteGroup
                          key={family}
                          label={family}
                          entries={paletteEntries().filter(([, e]) => e.family === family)}
                          canInsert={(type) => insertionTarget(doc.roots, selection, type) !== null}
                          onInsert={insertType}
                        />
                      ))}
                      <Stack gap="2">
                        <Text size="1" weight="medium">
                          Blocks
                        </Text>
                        {blocks.length === 0 ? (
                          <Text size="1" emphasis="quiet">
                            Select something on the canvas and save it as a block — it becomes a
                            reusable piece here.
                          </Text>
                        ) : (
                          blocks.map((b, i) => (
                            <Flex key={`${b.name}-${i}`} gap="2" align="center" justify="space-between">
                              <Button size="1" emphasis="quiet" bordered onClick={() => insertBlock(b)}>
                                {b.name}
                              </Button>
                              <Button
                                size="1"
                                emphasis="quiet"
                                tone="destructive"
                                onClick={() => setBlocks((list) => list.filter((_, j) => j !== i))}
                              >
                                Remove
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
                          <TreeRows key={r.id} node={r} depth={0} selection={selection} onSelect={setSelection} />
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
        <Box style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          <ScrollArea style={{ height: "100%" }}>
            <Box p="6" onClickCapture={onCanvasClick} onDragOver={onCanvasDragOver} onDrop={onCanvasDrop} onDragLeave={() => setDropTarget(null)} style={{ minHeight: "100%" }}>
              <Box maxWidth="880px" style={{ marginInline: "auto" }}>
                <div ref={canvasRef} style={{ position: "relative" }}>
                  <Theme
                    density={doc.theme.density}
                    pointer={doc.theme.pointer}
                    radius={doc.theme.radius}
                    surfaceLook={doc.theme.surfaceLook}
                    depth={doc.theme.depth}
                    material={doc.theme.material}
                  >
                    <Stack gap="5">
                      {doc.roots.length === 0 ? (
                        <Text size="2" emphasis="quiet">
                          Drop something here, or add it from the palette.
                        </Text>
                      ) : (
                        doc.roots.map((r) => renderNode(r, "canvas"))
                      )}
                    </Stack>
                  </Theme>
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
                        borderRadius: "var(--radius-control-2)",
                        pointerEvents: "none",
                      }}
                    />
                  ) : null}
                  {dropTarget ? <DropHint canvasRef={canvasRef} id={dropTarget} /> : null}
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
                          <Button size="1" emphasis="quiet" tone="destructive" onClick={deleteSelected}>
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
}: {
  label: string;
  entries: [string, CatalogEntry][];
  canInsert: (type: string) => boolean;
  onInsert: (type: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <Stack gap="2">
      <Text size="1" weight="medium">
        {label}
      </Text>
      <Flex gap="2" wrap="wrap">
        {entries.map(([type, entry]) => (
          <Button
            key={type}
            size="1"
            emphasis="quiet"
            bordered
            disabled={!canInsert(type)}
            title={entry.blurb}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(DRAG_TYPE, type);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onInsert(type)}
          >
            {type}
          </Button>
        ))}
      </Flex>
    </Stack>
  );
}

function TreeRows({
  node: n,
  depth,
  selection,
  onSelect,
}: {
  node: BuilderNode;
  depth: number;
  selection: string | null;
  onSelect: (id: string) => void;
}) {
  const label = n.text ? `${n.type} · ${n.text.slice(0, 18)}${n.text.length > 18 ? "…" : ""}` : n.type;
  return (
    <>
      <Box style={{ paddingInlineStart: `calc(${depth} * var(--layout-space-4))` }}>
        <Button
          size="1"
          emphasis="quiet"
          aria-pressed={selection === n.id}
          bordered={selection === n.id}
          onClick={() => onSelect(n.id)}
        >
          {label}
        </Button>
      </Box>
      {n.children?.map((c) => (
        <TreeRows key={c.id} node={c} depth={depth + 1} selection={selection} onSelect={onSelect} />
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
        borderRadius: "var(--radius-control-2)",
        pointerEvents: "none",
      }}
    />
  );
}
