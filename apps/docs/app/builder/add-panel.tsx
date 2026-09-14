"use client";

/**
 * The Add tab (2026-09-14, Kushagra: "we generally add items quickly… I need to be able to see
 * what I'm adding"; then: a tab in the sidebar beside Layers rather than a popover). The
 * components insertable at the current selection, each drawn by the real component. Layout
 * primitives and compound parts have nothing to look at, so they are named rather than drawn.
 * Click inserts at the selection; drag drops where you let go.
 */

import * as React from "react";

import { Box, Button, Flex, Stack, Surface, Text } from "@kookie-ui/react";

import { EmptyState } from "../../blocks/empty-state";
import { LayersFilter } from "./layers";
import { CATALOG } from "./catalog";
import { insertCommands, type CommandContext } from "./commands";
import { renderNode } from "./render";

const DRAWN = ["Control", "Surface", "Indicator", "Type"] as const;

class PreviewBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function AddPanel({
  ctx,
  active,
  onDragBegin,
  onDragFinish,
}: {
  ctx: CommandContext;
  /** Only the visible tab draws its previews. */
  active: boolean;
  onDragBegin: (type: string) => void;
  onDragFinish: () => void;
}) {
  const [query, setQuery] = React.useState("");

  const commands = React.useMemo(() => (active ? insertCommands(ctx) : []), [active, ctx]);

  /* One made node per type — the preview is the node the click would insert. Keyed on the
     insertable set, so an unrelated edit does not remount every preview. */
  const typeKey = commands.map((c) => c.id).join("|");
  const previews = React.useMemo(() => {
    const out = new Map<string, React.ReactElement>();
    for (const id of typeKey ? typeKey.split("|") : []) {
      const type = id.slice("insert:".length);
      const entry = CATALOG[type];
      if (!entry || entry.partOf || !(DRAWN as readonly string[]).includes(entry.family)) continue;
      out.set(type, renderNode(entry.make(), "export"));
    }
    return out;
  }, [typeKey]);

  const q = query.trim().toLowerCase();
  const rows = commands
    .map((c) => ({ type: c.id.slice("insert:".length), run: () => c.run(ctx) }))
    .filter((r) => !q || r.type.toLowerCase().includes(q) || CATALOG[r.type]?.blurb.toLowerCase().includes(q));

  const drawn = DRAWN.map((family) => ({
    family,
    items: rows.filter((r) => previews.has(r.type) && CATALOG[r.type]?.family === family),
  })).filter((s) => s.items.length > 0);
  const named = rows.filter((r) => !previews.has(r.type));

  const dragProps = (type: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", type);
      e.dataTransfer.effectAllowed = "copy";
      onDragBegin(type);
    },
    onDragEnd: onDragFinish,
  });

  return (
    <Stack gap="6">
      <Flex>
        <LayersFilter
          value={query}
          onChange={setQuery}
          label="Filter components"
          placeholder="Filter by name or purpose"
        />
      </Flex>
      {drawn.map((section) => (
        <Stack key={section.family} gap="3">
          <Text size="2" emphasis="medium">
            {section.family}
          </Text>
          <Stack gap="4">
            {section.items.map((r) => (
              /* A div acting as the button: a drawn Button inside a <button> would be a nested
                 <button>. The preview is inert, so it takes no focus or pointer. */
              <Stack
                key={r.type}
                gap="2"
                role="button"
                tabIndex={0}
                aria-label={`Insert ${r.type}`}
                onClick={r.run}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    r.run();
                  }
                }}
                style={{ cursor: "pointer" }}
                {...dragProps(r.type)}
              >
                <Surface size="1">
                  <div
                    inert
                    style={{
                      blockSize: 96,
                      display: "grid",
                      placeItems: "center",
                      overflow: "clip",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        zoom: 0.85,
                        inlineSize: "calc(100% / 0.85)",
                        display: "grid",
                        justifyItems: "center",
                      }}
                    >
                      <PreviewBoundary>{previews.get(r.type)}</PreviewBoundary>
                    </div>
                  </div>
                </Surface>
                <Text size="2">{r.type}</Text>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ))}
      {named.length > 0 ? (
        <Stack gap="3">
          <Text size="2" emphasis="medium">
            Layout and parts
          </Text>
          <Flex gap="2" wrap="wrap">
            {named.map((r) => (
              <Button key={r.type} emphasis="quiet" bordered onClick={r.run} {...dragProps(r.type)}>
                {r.type}
              </Button>
            ))}
          </Flex>
        </Stack>
      ) : null}
      {rows.length === 0 ? (
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
                    <Button emphasis="quiet" bordered onClick={() => setQuery("")}>
                      Clear the filter
                    </Button>
                  ),
                }
              : {})}
          />
        </Box>
      ) : null}
    </Stack>
  );
}
