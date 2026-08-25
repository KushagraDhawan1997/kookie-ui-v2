"use client";

import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { slot } from "../../system/render.ts";
import { glyphStroke } from "../../tokens/config.ts";

/**
 * One node of the tree's data. The API is DATA-DRIVEN, not JSX composition, and that is §33's
 * flat-list architecture speaking: the visible nodes render as a flat sequence of rows with
 * ARIA level attributes, so the machine must know the hierarchy as a value — a nested JSX
 * walk would be the child-scanning the Shell deleted (v1's displayName inspection), brittle
 * against any wrapper an app composes in between.
 */
export type TreeNode = {
  /** Identifies the node in the expansion and selection sets. Unique across the whole tree. */
  id: string;
  /** The row's content. */
  label: React.ReactNode;
  /**
   * What typeahead matches. Required only when `label` is not a plain string — a tree cannot
   * read words out of an element.
   */
  textValue?: string;
  /** Child nodes. Present (even empty) means the row is expandable and shows a disclosure. */
  children?: readonly TreeNode[];
};

export type TreeProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "children" | "onSelect"
> & {
  /** The hierarchy, as data. See `TreeNode`. */
  items: readonly TreeNode[];
  /** The rows' index — the row family's own `size`, stamped per row. Rests at 2. */
  size?: Size;
  /** Uncontrolled starting expansion. */
  defaultExpandedIds?: readonly string[];
  /** Controlled expansion, paired with `onExpandedChange`. */
  expandedIds?: readonly string[];
  /** Fires when a node opens or closes, with the whole expanded set. */
  onExpandedChange?: (ids: string[]) => void;
  /**
   * Several rows selectable at once (§33): Shift-arrow and Shift-click extend a range,
   * Cmd/Ctrl-click toggles. Announced as `aria-multiselectable`. Off, a click replaces.
   */
  multiselectable?: boolean;
  /** Uncontrolled starting selection. */
  defaultSelectedIds?: readonly string[];
  /** Controlled selection, paired with `onSelectionChange`. */
  selectedIds?: readonly string[];
  /** Fires when the selection changes, with the whole selected set. */
  onSelectionChange?: (ids: string[]) => void;
  ref?: React.Ref<HTMLDivElement>;
};

/** A visible node, flattened: the row the machine actually renders and walks. */
type FlatRow = {
  node: TreeNode;
  level: number;
  setsize: number;
  posinset: number;
  parentId: string | null;
};

const flatten = (
  items: readonly TreeNode[],
  expanded: ReadonlySet<string>,
): FlatRow[] => {
  const out: FlatRow[] = [];
  const walk = (nodes: readonly TreeNode[], level: number, parentId: string | null) => {
    nodes.forEach((node, index) => {
      out.push({ node, level, setsize: nodes.length, posinset: index + 1, parentId });
      if (node.children && expanded.has(node.id)) walk(node.children, level + 1, node.id);
    });
  };
  walk(items, 1, null);
  return out;
};

const words = (node: TreeNode): string =>
  typeof node.label === "string" ? node.label : (node.textValue ?? "");

/**
 * Tree (§33) — hierarchical content revealed and hidden by the person using it. The MACHINE
 * only: disclosure, the ARIA tree keyboard, selection. The instruments built on it — a layers
 * panel, a file browser — are blocks, and stay so (§27).
 *
 * The keyboard is the ARIA tree pattern transcribed, not designed: Up/Down walk the VISIBLE
 * rows, Right expands or descends, Left collapses or ascends, Home/End jump, printable keys
 * typeahead. Focus is a roving tabindex — one tab stop for the whole tree.
 *
 * Rows are row-family members rendered here (ShellNavItem's pattern — each member renders its
 * own button wearing `kui-control kui-row`, because `Row` owns its emphasis stamp and a tree's
 * selected rung is not `aria-current`), so the paint, the states and the size join arrive by
 * membership and this file adds no second row recipe. A selected row is `aria-selected` for
 * the announcement, `data-selected` for the shared vocabulary, and the family's `medium`
 * emphasis rung for the paint — so selection and hover stay in one currency and a selected
 * row still moves under the pointer.
 *
 * The disclosure chevron is passive paint with a click handler, deliberately NOT a button:
 * the row IS a button and a control may not nest in a control's element; the keyboard's
 * Left/Right is the accessible route, which is the APG's own answer.
 */
export function Tree({
  items,
  size = "2",
  defaultExpandedIds,
  expandedIds,
  onExpandedChange,
  multiselectable,
  defaultSelectedIds,
  selectedIds,
  onSelectionChange,
  className,
  ref,
  ...props
}: TreeProps) {
  const [expandedState, setExpandedState] = React.useState<ReadonlySet<string>>(
    () => new Set(defaultExpandedIds),
  );
  const expanded = expandedIds !== undefined ? new Set(expandedIds) : expandedState;
  const setExpanded = (next: Set<string>) => {
    if (expandedIds === undefined) setExpandedState(next);
    onExpandedChange?.([...next]);
  };

  const [selectedState, setSelectedState] = React.useState<ReadonlySet<string>>(
    () => new Set(defaultSelectedIds),
  );
  const selected = selectedIds !== undefined ? new Set(selectedIds) : selectedState;
  const setSelected = (next: Set<string>) => {
    if (selectedIds === undefined) setSelectedState(next);
    onSelectionChange?.([...next]);
  };

  const rows = flatten(items, expanded);

  // The roving tab stop. Falls back to the first visible row, and is repaired when the row
  // it pointed at is collapsed away — a tab stop must always exist while rows do.
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const focusRow = rows.find((r) => r.node.id === focusId) ?? rows[0];
  const rowRefs = React.useRef(new Map<string, HTMLElement>());
  const moveFocus = (id: string) => {
    setFocusId(id);
    rowRefs.current.get(id)?.focus();
  };

  // The Shift range grows from an anchor: the last non-Shift selection act.
  const anchorRef = React.useRef<string | null>(null);

  const select = (row: FlatRow, event: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }) => {
    const id = row.node.id;
    if (multiselectable && event.shiftKey && anchorRef.current !== null) {
      const a = rows.findIndex((r) => r.node.id === anchorRef.current);
      const b = rows.findIndex((r) => r.node.id === id);
      if (a !== -1 && b !== -1) {
        const range = rows.slice(Math.min(a, b), Math.max(a, b) + 1).map((r) => r.node.id);
        setSelected(new Set(range));
        return;
      }
    }
    if (multiselectable && (event.metaKey || event.ctrlKey)) {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      anchorRef.current = id;
      setSelected(next);
      return;
    }
    anchorRef.current = id;
    setSelected(new Set([id]));
  };

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  // Typeahead: printable keys accumulate briefly and match the next row whose words start
  // with the buffer, wrapping past the end — the pattern's own spelling.
  const typeRef = React.useRef({ buffer: "", at: 0 });
  const typeahead = (key: string, fromIndex: number) => {
    const now = performance.now();
    const t = typeRef.current;
    t.buffer = now - t.at > 600 ? key : t.buffer + key;
    t.at = now;
    const start = t.buffer.length === 1 ? fromIndex + 1 : fromIndex;
    for (let step = 0; step < rows.length; step += 1) {
      const row = rows[(start + step) % rows.length];
      if (row && words(row.node).toLowerCase().startsWith(t.buffer.toLowerCase())) {
        moveFocus(row.node.id);
        return;
      }
    }
  };

  const onKeyDown = (event: React.KeyboardEvent, row: FlatRow, index: number) => {
    const { node } = row;
    const parent = row.parentId;
    switch (event.key) {
      case "ArrowDown": {
        const next = rows[index + 1];
        if (next) {
          moveFocus(next.node.id);
          if (multiselectable && event.shiftKey) select(next, event);
        }
        break;
      }
      case "ArrowUp": {
        const prev = rows[index - 1];
        if (prev) {
          moveFocus(prev.node.id);
          if (multiselectable && event.shiftKey) select(prev, event);
        }
        break;
      }
      case "ArrowRight": {
        if (!node.children) return;
        if (!expanded.has(node.id)) toggle(node.id);
        else if (rows[index + 1] && rows[index + 1]!.parentId === node.id)
          moveFocus(rows[index + 1]!.node.id);
        break;
      }
      case "ArrowLeft": {
        if (node.children && expanded.has(node.id)) toggle(node.id);
        else if (parent !== null) moveFocus(parent);
        break;
      }
      case "Home": {
        if (rows[0]) moveFocus(rows[0].node.id);
        break;
      }
      case "End": {
        const last = rows[rows.length - 1];
        if (last) moveFocus(last.node.id);
        break;
      }
      case "Enter":
      case " ": {
        select(row, event);
        break;
      }
      default: {
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          typeahead(event.key, index);
          break;
        }
        return;
      }
    }
    event.preventDefault();
  };

  return (
    <div
      {...props}
      ref={ref}
      role="tree"
      {...(multiselectable ? { "aria-multiselectable": true } : {})}
      className={className ? `kui-tree ${className}` : "kui-tree"}
    >
      {rows.map((row, index) => {
        const { node, level, setsize, posinset } = row;
        const isExpandable = node.children !== undefined;
        const isExpanded = isExpandable && expanded.has(node.id);
        const isSelected = selected.has(node.id);
        const disclosure = (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="kui-tree-disclosure"
            {...(isExpandable ? { "data-expandable": "" } : {})}
            {...(isExpanded ? { "data-expanded": "" } : {})}
            onClick={(event) => {
              // The chevron toggles WITHOUT selecting — Finder's split — so the click must
              // not reach the row's own handler. Activation only; no pointer-time handler.
              event.stopPropagation();
              if (isExpandable) toggle(node.id);
            }}
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth={glyphStroke}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
        // A row renders its own button wearing the family classes — ShellNavItem's pattern,
        // NOT a `<Row>` composition: Row owns its emphasis stamp (quiet, or medium via
        // `current`), and a tree's selected rung must not be spelled through `aria-current`,
        // which means location. Selection here is the machine's own pair: `aria-selected`
        // for the announcement, `data-selected` for the shared vocabulary, and the family's
        // medium rung for the paint — rests at soft, still moves under the pointer.
        return (
          <button
            key={node.id}
            type="button"
            role="treeitem"
            aria-level={level}
            aria-setsize={setsize}
            aria-posinset={posinset}
            {...(isExpandable ? { "aria-expanded": isExpanded } : {})}
            aria-selected={isSelected}
            {...(isSelected ? { "data-selected": "", "data-emphasis": "medium" } : { "data-emphasis": "quiet" })}
            data-size={size}
            data-tone="neutral"
            data-hover-lit=""
            tabIndex={focusRow?.node.id === node.id ? 0 : -1}
            className="kui-control kui-row kui-tree-item"
            style={{ "--kui-tree-level": level - 1 } as React.CSSProperties}
            ref={(el) => {
              if (el) rowRefs.current.set(node.id, el);
              else rowRefs.current.delete(node.id);
            }}
            onFocus={() => setFocusId(node.id)}
            onClick={(event) => select(row, event)}
            onKeyDown={(event) => onKeyDown(event, row, index)}
          >
            {slot(disclosure, "leading")}
            {node.label}
          </button>
        );
      })}
    </div>
  );
}
