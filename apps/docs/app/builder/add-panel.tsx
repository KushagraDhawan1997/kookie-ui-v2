"use client";

/**
 * The Add tab (2026-09-14, Kushagra: "we generally add items quickly"; a tab in the sidebar
 * beside Layers). The components insertable at the current selection, as a tree grouped by
 * category the way Apple's HIG groups its components (2026-09-15, replacing drawn previews).
 * Choosing a row inserts at the selection; dragging its name drops where you let go.
 */

import * as React from "react";

import { Box, Button, Tree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

import { EmptyState } from "../../blocks/empty-state";
import { CATALOG } from "./catalog";
import { insertCommands, type CommandContext } from "./commands";
import { CATEGORIES, categoryOf } from "./component-icons";

export function AddPanel({
  ctx,
  active,
  query,
  onClearQuery,
  onDragBegin,
  onDragFinish,
}: {
  ctx: CommandContext;
  /** Only the visible tab computes its rows. */
  active: boolean;
  /** The filter lives in the pane's pinned header, so its value arrives from there. */
  query: string;
  onClearQuery: () => void;
  onDragBegin: (type: string) => void;
  onDragFinish: () => void;
}) {
  const commands = React.useMemo(() => (active ? insertCommands(ctx) : []), [active, ctx]);
  const [collapsed, setCollapsed] = React.useState<ReadonlySet<string>>(() => new Set());

  const q = query.trim().toLowerCase();
  const rows = commands
    .map((c) => ({ type: c.id.slice("insert:".length), run: () => c.run(ctx) }))
    .filter((r) => !q || r.type.toLowerCase().includes(q) || CATALOG[r.type]?.blurb.toLowerCase().includes(q));
  const runs = new Map(rows.map((r) => [r.type, r.run]));

  const groups = [...CATEGORIES.map((c) => c.name), "Other"]
    .map((name) => ({
      name,
      category: CATEGORIES.find((c) => c.name === name),
      types: rows.filter((r) => categoryOf(r.type) === name).map((r) => r.type),
    }))
    .filter((g) => g.types.length > 0);

  const label = (type: string) => (
    <span
      // The drag starts on the label: the row's own element is the tree's.
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData("text/plain", type);
        e.dataTransfer.effectAllowed = "copy";
        onDragBegin(type);
      }}
      onDragEnd={onDragFinish}
      style={{ flex: 1, minInlineSize: 0, textAlign: "start" }}
    >
      {type}
    </span>
  );

  const items: TreeNode[] = groups.map((g) => ({
    id: `cat:${g.name}`,
    label: g.name,
    ...(g.category ? { leading: <g.category.Icon /> } : {}),
    // Only the category wears a glyph: a second level where some rows have one reads ragged.
    children: g.types.map((type): TreeNode => ({ id: `insert:${type}`, textValue: type, label: label(type) })),
  }));

  // A filter forces every category open, so a match is never folded away.
  const expandedIds = groups.filter((g) => q || !collapsed.has(g.name)).map((g) => `cat:${g.name}`);

  const toggle = (name: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  if (rows.length === 0) {
    return (
      <Box py="6">
        <EmptyState
          title={q ? "Nothing here is called that" : "Nothing fits here"}
          description={
            q
              ? "The filter reads a component's name and what it is for. Try a shorter word."
              : "The selected node takes no children. Select its parent, or nothing, to add beside it."
          }
          {...(q
            ? {
                action: (
                  <Button emphasis="quiet" bordered onClick={onClearQuery}>
                    Clear the filter
                  </Button>
                ),
              }
            : {})}
        />
      </Box>
    );
  }

  return (
    <Tree
      aria-label="Components"
      items={items}
      // Nothing stays chosen: choosing a component inserts it, choosing a category folds it.
      selectedIds={[]}
      onSelectionChange={(ids) => {
        const id = ids[ids.length - 1];
        if (!id) return;
        if (id.startsWith("cat:")) toggle(id.slice("cat:".length));
        else runs.get(id.slice("insert:".length))?.();
      }}
      expandedIds={expandedIds}
      onExpandedChange={(ids) => {
        if (q) return;
        const open = new Set(ids);
        setCollapsed(new Set(groups.filter((g) => !open.has(`cat:${g.name}`)).map((g) => g.name)));
      }}
    />
  );
}
