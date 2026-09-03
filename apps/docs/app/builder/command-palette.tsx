"use client";

/**
 * ⌘K (2026-08-20) — one field over the command table, plus the two things a builder's
 * palette must also reach: the components it can insert HERE (the grammar decides, so the
 * list is different on every selection) and the documents it can switch to.
 *
 * It is deliberately not a fuzzy-scored matcher. A palette that reorders as you type is a
 * palette you cannot build muscle memory for; every typed word must appear, and the order
 * is the table's own.
 *
 * The rows are `Row`s (2026-08-23). They used to be `Box`es painting `var(--neutral-a3)` for
 * the highlighted one, which is the palette redrawing the row family's lit fill by hand — and
 * it had already drifted, because that fill grew material remaps and a high-contrast arm while
 * this copy stayed one flat step. The keyboard model stays here, where it belongs: the list
 * knows what its items mean, and `highlighted` is how it tells the row it is the one driving.
 */

import * as React from "react";

import { Box, Dialog, DialogContent, DialogTitle, Kbd, Row, ScrollArea, Stack, Text, TextField } from "@kookie-ui/react";

import {
  COMMANDS,
  armed,
  chordLabel,
  insertCommands,
  matches,
  templateCommands,
  type Command,
  type CommandContext,
} from "./commands";

type Row = { key: string; title: string; group: string; hint?: string; run: () => void };

export function CommandPalette({
  open,
  onOpenChange,
  ctx,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ctx: CommandContext;
}) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const rows: Row[] = React.useMemo(() => {
    if (!open) return [];
    const asRow = (c: Command): Row => ({
      key: c.id,
      title: c.title,
      group: c.group,
      ...(c.chord ? { hint: chordLabel(c.chord) } : {}),
      run: () => c.run(ctx),
    });
    const commands = COMMANDS.filter((c) => armed(c, ctx) && matches(c, query)).map(asRow);
    const templates = templateCommands()
      .filter((c) => armed(c, ctx) && matches(c, query))
      .map((c): Row => ({ key: c.id, title: c.title, group: "Templates", run: () => c.run(ctx) }));
    const inserts = insertCommands(ctx)
      .filter((c) => matches(c, query))
      .map(asRow);
    const asQuery = (title: string): Command => ({ id: "", title, group: "Insert", enabled: () => true, run: () => {} });
    /* Blocks and templates are insertion by another name, and a document switch changes what
       preview is previewing. None of them are on the command table, so `armed` cannot reach
       them and the mode has to be asked once, here, where the rows are built. */
    const blocks: Row[] = (ctx.preview ? [] : ctx.state.blocks)
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => matches(asQuery(`Insert block ${b.name}`), query))
      .map(({ b, i }) => ({
        key: `block:${i}`,
        title: `Insert ${b.name}`,
        group: "Blocks",
        run: () => ctx.ui.insertBlockByIndex(i),
      }));
    const documents: Row[] = (ctx.preview ? [] : ctx.state.docs)
      .filter((d) => d.id !== ctx.state.activeId)
      .filter((d) => matches(asQuery(`Switch to ${d.name}`), query))
      .map((d) => ({
        key: `doc:${d.id}`,
        title: `Switch to ${d.name}`,
        group: "Documents",
        run: () => ctx.dispatch({ type: "docSwitch", id: d.id }),
      }));
    return [...commands, ...templates, ...inserts, ...blocks, ...documents];
  }, [open, query, ctx]);

  React.useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, rows.length - 1)));
  }, [rows.length]);

  const run = (row: Row | undefined) => {
    if (!row) return;
    onOpenChange(false);
    // After the dialog's own close work, so a command that opens another dialog is not
    // immediately dismissed by this one's teardown.
    window.setTimeout(() => row.run(), 0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(rows.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(rows[active]);
    }
  };

  /* Keep the highlighted row in view — a keyboard list that scrolls out from under you is
     a keyboard list nobody finishes using. */
  React.useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let lastGroup = "";

  return (
    <Dialog size="3" open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Stack gap="3">
          <DialogTitle style={{ position: "absolute", clipPath: "inset(50%)" }}>Commands</DialogTitle>
          {/* NO `size` (2026-09-03). It stated `2`, which IS the default — a second home for
              the baseline, and the shape this file's own neighbour already names: a default
              restated is a default with two homes, and the one that is not the config drifts. */}
          <TextField
            autoFocus
            placeholder="Search commands and components…"
            aria-label="Search commands"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <ScrollArea style={{ maxHeight: "min(52vh, 420px)" }}>
            <div ref={listRef}>
              {rows.length === 0 ? (
                <Box py="4">
                  <Text size="2" emphasis="medium">
                    Nothing matches “{query}”.
                  </Text>
                </Box>
              ) : (
                <Stack gap="1">
                  {rows.map((row, i) => {
                    const header = row.group !== lastGroup ? row.group : null;
                    lastGroup = row.group;
                    return (
                      <React.Fragment key={row.key}>
                        {header ? (
                          <Box pt={i === 0 ? "1" : "3"} pb="1">
                            <Text size="2" emphasis="quiet">
                              {header}
                            </Text>
                          </Box>
                        ) : null}
                        <Row
                          data-active={i === active}
                          highlighted={i === active}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => run(row)}
                          trailing={row.hint ? <Kbd>{row.hint}</Kbd> : null}
                        >
                          <Text size="2">{row.title}</Text>
                        </Row>
                      </React.Fragment>
                    );
                  })}
                </Stack>
              )}
            </div>
          </ScrollArea>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
