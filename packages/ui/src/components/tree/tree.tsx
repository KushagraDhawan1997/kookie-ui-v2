"use client";

import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { composeRender, slot, type RenderElement } from "../../system/render.ts";
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
  /**
   * NavTree only: where this leaf navigates. A leaf renders as a real link (the default `<a>`,
   * or whatever `renderLink` supplies), which is what separates the NAV vocabulary from the
   * instrument's — activation navigates rather than selects. Ignored by `Tree`.
   *
   * A leaf with neither this nor a `renderLink` destination is NOT a link and is not drawn as
   * one: it renders as plain text in the row's place, with no pointer light and no press to
   * promise. Optional only because `Tree` shares this shape and ignores the field.
   */
  href?: string;
  /**
   * NavTree only: an icon rendered in the row's leading slot. On an expandable row it sits
   * after the disclosure. Ignored by `Tree`, whose leading slot is the disclosure's.
   */
  leading?: React.ReactNode;
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
 * The one glyph the machine draws, shared by both members. Passive paint — never a button
 * (the row is the interactive element and a control may not nest a control's element), and
 * since 2026-08-26 it carries no handler at all: the instrument's Finder split (toggle
 * without selecting) is spelled on the wrapper below, for the reason stated there.
 */
function DisclosureGlyph({ expandable, expanded }: { expandable: boolean; expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="kui-tree-disclosure"
      {...(expandable ? { "data-expandable": "" } : {})}
      {...(expanded ? { "data-expanded": "" } : {})}
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
}

/**
 * THE INSTRUMENT'S DISCLOSURE TARGET (§16, added 2026-08-26 — audit).
 *
 * In `Tree` the chevron is the ONLY pointer route to expanding (the row's own press selects),
 * and it shipped as the glyph itself: `--kui-ct-icon`, i.e. 16 CSS px in every fine cell at
 * sizes 1-2 and 20 on coarse — under WCAG 2.2 SC 2.5.8's 24 floor the system locked, with no
 * equivalent pointer route to fall back on. The §16 expander answers it, exactly as it does
 * for the mark family: an `::after` grown to the box a control of this size already occupies,
 * capped at the touch floor, so the extent is derived rather than guessed. Vertically that
 * extent is `min(--kui-ct-h, 44)`, which is never taller than the row, so a stack of rows
 * cannot steal from its neighbours.
 *
 * IT CANNOT LIVE ON THE GLYPH, and that is why this wrapper is written by hand instead of
 * through `slot()`. Chromium generates no pseudo-element box for an SVG element — measured
 * 2026-08-26: `::after` on `.kui-tree-disclosure` computes (content, position, background all
 * resolve) and never paints, so `elementFromPoint` a few pixels outside the glyph came back
 * with the ROW. The handler therefore sits on the slot wrapper, which is an ordinary
 * `<span>`, and the wrapper is what the stylesheet expands.
 *
 * The handler is attached only when there is something to toggle: a leaf's wrapper must let
 * the press through to the row, which is what selects.
 */
function DisclosureTarget({
  expandable,
  expanded,
  onToggle,
}: {
  expandable: boolean;
  expanded: boolean;
  onToggle?: (() => void) | undefined;
}) {
  return (
    <span
      data-slot="leading"
      className="kui-tree-toggle"
      {...(expandable && onToggle
        ? {
            "data-expandable": "",
            onClick: (event: React.MouseEvent) => {
              event.stopPropagation();
              onToggle();
            },
          }
        : {})}
    >
      <DisclosureGlyph expandable={expandable} expanded={expanded} />
    </span>
  );
}

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
    const collapsing = next.has(id);
    if (collapsing) next.delete(id);
    else next.add(id);
    // A COLLAPSE CAN UNMOUNT THE ROW THAT HOLDS FOCUS (added 2026-08-26, audit).
    //
    // The roving tab stop repaired itself already — `focusRow` falls back — but DOM focus did
    // not: put focus on a descendant row, then collapse its ancestor by that ancestor's
    // chevron, and the focused element leaves the document, which drops focus to `<body>` and
    // throws a keyboard user to the top of the page.
    //
    // MEASURED 2026-08-26, AND THE MEASUREMENT IS THE REASON THIS IS STATED RATHER THAN LEFT
    // TO THE BROWSER: under a real Chromium pointer the defect does NOT appear, because
    // mousedown focuses the button the chevron sits in and that button is exactly the row this
    // repair moves to. It reappears the moment the browser does not do that for us — a
    // programmatic or assistive activation (measured: `activeElement` is `<body>`), and the
    // macOS platform rule that a press does not focus a button, which is Safari's and
    // Firefox's behaviour. The keyboard route was never affected: ArrowLeft collapses the node
    // the caret is already standing on, and that node survives.
    //
    // Read off the DOM rather than off `focusId`, because `focusId` also names the row a
    // previous keyboard walk left behind when focus has since gone somewhere else entirely.
    if (collapsing) {
      const surviving = new Set(flatten(items, next).map((r) => r.node.id));
      for (const [rowId, el] of rowRefs.current) {
        if (el === document.activeElement && !surviving.has(rowId)) {
          moveFocus(id);
          break;
        }
      }
    }
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
          <DisclosureTarget
            expandable={isExpandable}
            expanded={isExpanded}
            onToggle={() => toggle(node.id)}
          />
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
            {disclosure}
            {node.label}
          </button>
        );
      })}
    </div>
  );
}

export type NavTreeProps = Omit<React.ComponentPropsWithoutRef<"div">, "color" | "children"> & {
  /** The hierarchy, as data. Leaves carry `href`; sections carry `children`. See `TreeNode`. */
  items: readonly TreeNode[];
  /** The rows' index — the row family's own `size`, stamped per row. Rests at 2. */
  size?: Size;
  /** Uncontrolled starting expansion. */
  defaultExpandedIds?: readonly string[];
  /** Controlled expansion, paired with `onExpandedChange`. */
  expandedIds?: readonly string[];
  /** Fires when a section opens or closes, with the whole expanded set. */
  onExpandedChange?: (ids: string[]) => void;
  /**
   * The id of the node for the page the person is ON. That row announces
   * `aria-current="page"` and paints the current identity (accent ink, the medium rung) —
   * ShellNavItem's own pair. Location, not selection: a nav tree has no selection at all.
   */
  currentId?: string | null;
  /**
   * The link escape, per node — how a leaf becomes the app's router link
   * (`renderLink={(node) => <Link href={node.href!} />}`). Without it a leaf renders a plain
   * `<a href>`. The element's own props win, the Button-as-anchor lesson: the machine never
   * writes `type` onto a link.
   */
  renderLink?: (node: TreeNode) => RenderElement;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * NavTree (§33) — the tree machine's NAVIGATION member. Same data, same flatten, same derived
 * indent and disclosure glyph as `Tree`; what differs is the ANNOUNCEMENT, because the ARIA
 * APG separates disclosure navigation from tree views and `role="tree"` on a nav is
 * over-claiming. So: no tree roles anywhere — an expandable section is a real `<button
 * aria-expanded>` whose whole row is the disclosure, a leaf is a real link, the current page
 * is `aria-current="page"`, and the keyboard is the platform's (normal tab order, Enter
 * follows the link) rather than the instrument's roving walk. Selection does not exist here;
 * `currentId` is location.
 *
 * The current row's identity is ShellNavItem's, deliberately: accent stamped always (safe
 * under `undilutedTones` — the fill stays grey, only ink and glyph arrive in colour), the
 * label stood down to the neutral ink unless current (tree.css self-keys the pair; the third
 * member promotes it to the shared layer).
 */
export function NavTree({
  items,
  size = "2",
  defaultExpandedIds,
  expandedIds,
  onExpandedChange,
  currentId,
  renderLink,
  className,
  ref,
  ...props
}: NavTreeProps) {
  const [expandedState, setExpandedState] = React.useState<ReadonlySet<string>>(
    () => new Set(defaultExpandedIds),
  );
  const expanded = expandedIds !== undefined ? new Set(expandedIds) : expandedState;
  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    if (expandedIds === undefined) setExpandedState(next);
    onExpandedChange?.([...next]);
  };

  const rows = flatten(items, expanded);

  return (
    <div
      {...props}
      ref={ref}
      className={className ? `kui-tree kui-tree-nav ${className}` : "kui-tree kui-tree-nav"}
    >
      {rows.map((row) => {
        const { node, level } = row;
        const isExpandable = node.children !== undefined;
        const isExpanded = isExpandable && expanded.has(node.id);
        const isCurrent = currentId != null && currentId === node.id;
        const shared = {
          "data-size": size,
          // ShellNavItem's stamp verbatim (2026-08-23; see its comment for why the
          // unconditional stamp is safe): the family is what the CURRENT row's ink and
          // glyph read, and undilutedTones keeps every fill grey.
          "data-tone": "accent",
          "data-hover-lit": "",
          ...(isCurrent
            ? { "aria-current": "page" as const, "data-emphasis": "medium" }
            : { "data-emphasis": "quiet" }),
          className: "kui-control kui-row kui-tree-item",
          style: { "--kui-tree-level": level - 1 } as React.CSSProperties,
        };
        // THE GUTTER IS THE LEAF'S TOO (2026-08-26, audit). The glyph is rendered on every
        // row and hidden on the ones that do not expand — the instrument's own rule, and the
        // only thing that makes labels at ONE level share a left edge. NavTree drew it on the
        // section alone, so a top-level link sat a glyph box and a gap to the left of the
        // top-level section beside it, and `visibility: hidden` had nothing to keep a box for.
        // No target and no handler here: the whole section row IS the disclosure, so the
        // instrument's Finder split has no job in this member.
        const gutter = <DisclosureTarget expandable={isExpandable} expanded={isExpanded} />;
        if (isExpandable) {
          return (
            <button
              key={node.id}
              type="button"
              aria-expanded={isExpanded}
              onClick={() => toggle(node.id)}
              {...(shared as React.ComponentPropsWithoutRef<"button">)}
            >
              {gutter}
              {slot(node.leading, "leading")}
              {node.label}
            </button>
          );
        }
        const content = (
          <>
            {gutter}
            {slot(node.leading, "leading")}
            {node.label}
          </>
        );
        /**
         * A LEAF WITH NOWHERE TO GO IS NOT A LINK (added 2026-08-26, audit).
         *
         * `href` is optional on `TreeNode` because `Tree` ignores it, and the fallback was a
         * bare `<a>` with the attribute simply omitted. An anchor without `href` is not a
         * link: it takes no focus, exposes no `link` role and has no accessible action — but
         * it still wore the whole row identity, `data-hover-lit` included, so a destination-
         * less leaf painted like its siblings, washed under the pointer and showed a hand
         * cursor while Tab walked straight past it and a screen reader announced nothing.
         *
         * The honest fallback is to stop claiming: a plain `<span>`, and the interactive
         * stamp withheld. The stylesheet stands the control's cursor and its unselectable
         * text down for the same case, keyed on the element rather than on a private marker,
         * so the paint and the semantics cannot disagree.
         *
         * This is a runtime repair of something the TYPE should refuse — a nav leaf that
         * carries neither `href` nor a `renderLink` destination is not expressible content —
         * and that refusal needs a `NavTreeNode` union exported from the package index.
         */
        const destination = renderLink?.(node) ?? (node.href ? <a href={node.href} /> : undefined);
        if (!destination) {
          const inert: Record<string, unknown> = { ...shared };
          delete inert["data-hover-lit"];
          return (
            <span key={node.id} {...(inert as React.ComponentPropsWithoutRef<"span">)}>
              {content}
            </span>
          );
        }
        return (
          <React.Fragment key={node.id}>
            {composeRender(destination, shared as never, content)}
          </React.Fragment>
        );
      })}
    </div>
  );
}
