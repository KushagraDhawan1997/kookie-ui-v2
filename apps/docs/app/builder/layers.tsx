"use client";

/**
 * Layers — the document's structure, on the package's own Tree (§33).
 *
 * IT WAS HAND-ROLLED UNTIL 2026-09-02, and what the swap deletes is the reason it existed:
 * when this panel was written the package had no tree, so the builder drew one — a `Box`
 * carrying `role="treeitem"` with a `Button` inside it, indent by hand-multiplied padding,
 * every node permanently expanded, `aria-pressed` and `aria-selected` both saying selection,
 * no `aria-setsize`/`aria-posinset`, and no keyboard whatsoever. A tree with no arrow keys is
 * a list you can only reach with a pointer, and the announced structure was wrong on top of
 * it: the focusable element sat INSIDE the treeitem rather than being it, which is the same
 * "generic node between the container and the item" the menu's ScrollArea viewport was fixed
 * for (2026-08-19).
 *
 * Everything the machine owns arrives by using it: the roving tab stop, Up/Down over the
 * VISIBLE rows, Left/Right to collapse and descend, Home/End, typeahead, the Shift range and
 * the Cmd toggle, `aria-level`/`setsize`/`posinset`, and the indent derived as one
 * `--kui-ct-icon` per level rather than a hand-picked space step. Collapsing is NEW here and
 * comes free with the machine — a deep document was previously a wall of rows with no way to
 * fold a branch away.
 *
 * WHAT THIS FILE STILL OWNS IS THE DRAG, and it owns it because §33 refused it: a tree's drop
 * semantics belong to the app whose data it is, and the builder's are the grammar's (`canAccept`
 * decides whether a node may hold another, and the thirds decide whether "here" means before,
 * inside, or after). So the machine draws and walks the rows, and this file composes a drag
 * onto them from the outside — the label carries `draggable`, and the drops are read on the
 * tree's ROOT, which is what keeps the whole row a target including the disclosure's column.
 *
 * The rows are identified BY POSITION, not by an id attribute, and that is not a shortcut: the
 * machine renders exactly the visible rows in flatten order, this file computes the same order
 * to build the data it hands over, so the nth `[role="treeitem"]` under the root IS the nth
 * entry of that list. Marking rows would mean the machine growing an escape it does not need.
 */

import * as React from "react";

import { Box, Text, TextField, Button, Tree, type TreeNode } from "@kookie-ui/react";

import { XIcon } from "../icons";
import type { BuilderNode } from "./model";

export type RowMode = "before" | "into" | "after";
export type RowSpot = { id: string; mode: RowMode };

/** The label a node reads as. The root row says "Canvas": it is a real Stack, and exports as
    one, but its ROLE in the document is the page every other node sits on. */
const labelOf = (n: BuilderNode, depth: number): string =>
  depth === 0
    ? `Canvas · ${n.type}`
    : n.text
      ? `${n.type} · ${n.text.slice(0, 18)}${n.text.length > 18 ? "…" : ""}`
      : n.type;

/** The visible rows in the order the machine will draw them — the same walk `Tree` does, run
    here so a row's DOM position resolves back to a node id. */
type Flat = { id: string; label: string; expandable: boolean };

function flattenVisible(
  nodes: readonly BuilderNode[],
  depth: number,
  expanded: (id: string) => boolean,
  visible: Set<string> | null,
  out: Flat[],
): void {
  for (const n of nodes) {
    if (visible && !visible.has(n.id)) continue;
    const kids = (n.children ?? []).filter((c) => !visible || visible.has(c.id));
    out.push({ id: n.id, label: labelOf(n, depth), expandable: kids.length > 0 });
    if (kids.length > 0 && expanded(n.id)) flattenVisible(n.children ?? [], depth + 1, expanded, visible, out);
  }
}

export function Layers({
  roots,
  selection,
  empty,
  onSelect,
  onDragBegin,
  onDragFinish,
  canRowDrop,
  onRowDrop,
  visible,
}: {
  roots: readonly BuilderNode[];
  selection: readonly string[];
  /** Whether the canvas holds anything — the two empty states read differently. */
  empty: boolean;
  onSelect: (ids: string[]) => void;
  onDragBegin: (id: string) => void;
  onDragFinish: () => void;
  canRowDrop: (id: string, mode: RowMode) => boolean;
  onRowDrop: (id: string, mode: RowMode) => void;
  /** The filter's answer, or null for no filter. A row outside it is not drawn — dimming it
      would leave a tree you have to read past to use. */
  visible: Set<string> | null;
}) {
  /* COLLAPSE IS TRACKED, NOT EXPANSION, and the inversion is what keeps a new node visible.
     Holding the expanded set would mean every node inserted under a collapsed-by-default
     parent lands somewhere the author cannot see, and the panel would owe a rule for adding
     ids as the document grows. Naming what is FOLDED AWAY makes "expanded" the default for
     everything that has never been touched, which is what an author expects of a structure
     they are building in front of themselves. */
  const [collapsed, setCollapsed] = React.useState<ReadonlySet<string>>(() => new Set());
  /* A FILTER FORCES EVERYTHING OPEN. The filter keeps a match's ancestors so the path is
     readable (model.ts's own rule), and a kept ancestor that is folded shut hides the very
     match it was kept for. */
  const filtering = visible !== null;
  const isExpanded = React.useCallback(
    (id: string) => filtering || !collapsed.has(id),
    [filtering, collapsed],
  );

  const rows = React.useMemo(() => {
    const out: Flat[] = [];
    flattenVisible(roots, 0, isExpanded, visible, out);
    return out;
  }, [roots, isExpanded, visible]);

  /* Where a drag is hovering: the row's own box, measured, plus which third of it. The
     indicator is drawn from that box rather than painted onto the row, which is the canvas's
     own `DropHint` instrument one panel over — and the reason is the same: the machine owns
     the rows, so an overlay is how this file draws on them without reaching inside. */
  const [hover, setHover] = React.useState<
    { id: string; mode: RowMode; top: number; height: number } | null
  >(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const clear = () => setHover(null);

  /** The row under the pointer, and which third of it — resolved by DOM position. */
  const spotAt = (event: React.DragEvent): { id: string; mode: RowMode; el: HTMLElement } | null => {
    const root = rootRef.current;
    if (!root) return null;
    const el = (event.target as Element | null)?.closest?.("[role='treeitem']") as HTMLElement | null;
    if (!el || !root.contains(el)) return null;
    const index = Array.prototype.indexOf.call(root.querySelectorAll("[role='treeitem']"), el);
    const row = rows[index];
    if (!row) return null;
    const box = el.getBoundingClientRect();
    const y = (event.clientY - box.top) / box.height;
    // The edges are deliberately narrow (a quarter each): "into" is the common intent, and a
    // tree where every hover lands between rows is a tree you fight.
    const mode: RowMode = y < 0.25 ? "before" : y > 0.75 ? "after" : "into";
    return { id: row.id, mode, el };
  };

  const onDragOver = (event: React.DragEvent) => {
    const spot = spotAt(event);
    if (!spot || !canRowDrop(spot.id, spot.mode)) return;
    event.preventDefault();
    event.stopPropagation();
    const root = rootRef.current!;
    const a = spot.el.getBoundingClientRect();
    const b = root.getBoundingClientRect();
    setHover({ id: spot.id, mode: spot.mode, top: a.top - b.top, height: a.height });
  };

  const onDrop = (event: React.DragEvent) => {
    // Recomputed at the drop point rather than read from hover state — the last dragover and
    // the drop are the same place, but the fresh read cannot be stale.
    const spot = spotAt(event);
    event.preventDefault();
    event.stopPropagation();
    clear();
    if (spot) onRowDrop(spot.id, spot.mode);
    else onDragFinish();
  };

  /** The data the machine draws. A node is expandable only when it HAS children the filter
      kept — an empty container showing a disclosure with nothing under it is a control that
      promises what it does not have. */
  const toNodes = React.useCallback(
    (nodes: readonly BuilderNode[], depth: number): TreeNode[] =>
      nodes
        .filter((n) => !visible || visible.has(n.id))
        .map((n): TreeNode => {
          const label = labelOf(n, depth);
          const kids = (n.children ?? []).filter((c) => !visible || visible.has(c.id));
          return {
            id: n.id,
            textValue: label,
            label: (
              <span
                // The DRAG STARTS ON THE LABEL, because `draggable` must sit on an element and
                // the row's own element is the machine's. The drop side does not share the
                // limitation — it reads the root — so a drop still lands anywhere on the row.
                draggable
                onDragStart={(event) => {
                  event.stopPropagation();
                  onDragBegin(n.id);
                  event.dataTransfer.setData("application/x-kookie-move", n.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  clear();
                  onDragFinish();
                }}
                style={{ flex: 1, minInlineSize: 0, textAlign: "start" }}
              >
                {label}
              </span>
            ),
            ...(kids.length > 0 ? { children: toNodes(n.children ?? [], depth + 1) } : {}),
          };
        }),
    [visible, onDragBegin, onDragFinish],
  );

  const items = React.useMemo(() => toNodes(roots, 0), [toNodes, roots]);

  return (
    <Box
      style={{ position: "relative" }}
      // Only a real exit clears the indicator — dragleave also fires on every child hop.
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) clear();
      }}
    >
        {empty ? (
          <Text size="1" emphasis="quiet">
            The canvas is empty.
          </Text>
        ) : rows.length === 0 ? (
          <Text size="1" emphasis="quiet">
            Nothing here is called that.
          </Text>
        ) : (
          <>
            <Tree
              ref={rootRef}
              aria-label="Layers"
              multiselectable
              items={items}
              /* CONTROLLED BOTH WAYS. Selection is the document's, held in the editor's store
                 so the canvas, the jump bar and this panel cannot disagree about what is
                 chosen; expansion is controlled so the filter can force it open. */
              selectedIds={selection}
              onSelectionChange={onSelect}
              expandedIds={rows.filter((r) => isExpanded(r.id)).map((r) => r.id)}
              onExpandedChange={(ids) => {
                // A collapse made while filtering is not recorded: the filter is what is
                // holding the row open, so honouring it would fold a branch the author cannot
                // see closing and surprise them when the filter clears.
                if (filtering) return;
                const open = new Set(ids);
                const next = new Set(collapsed);
                for (const r of rows) {
                  if (!r.expandable) continue;
                  if (open.has(r.id)) next.delete(r.id);
                  else next.add(r.id);
                }
                setCollapsed(next);
              }}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
            {hover ? (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  insetInline: 0,
                  pointerEvents: "none",
                  ...(hover.mode === "into"
                    ? {
                        top: hover.top,
                        height: hover.height,
                        border: "1px dashed var(--focus-ring)",
                        borderRadius: "var(--radius-control-2)",
                      }
                    : {
                        top: hover.mode === "before" ? hover.top - 1 : hover.top + hover.height - 1,
                        height: 2,
                        background: "var(--focus-ring)",
                      }),
                }}
              />
            ) : null}
          </>
      )}
    </Box>
  );
}

/** The filter field, lifted out so the pane's floating header can hold it while the tree
    scrolls behind — the row belongs to the pane's chrome, not to the tree. */
export function LayersFilter({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (next: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
}) {
  return (
    <TextField
      aria-label="Filter layers"
      placeholder="Filter by type or words"
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ flex: 1 }}
      {...(value
        ? {
            trailing: (
              <Button emphasis="quiet" iconOnly aria-label="Clear the filter" onClick={() => onChange("")}>
                <XIcon />
              </Button>
            ),
          }
        : {})}
    />
  );
}
