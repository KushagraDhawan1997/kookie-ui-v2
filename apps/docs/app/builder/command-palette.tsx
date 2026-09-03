"use client";

/**
 * ⌘K (2026-08-20; on the package's `Command` since 2026-09-03) — one field over the command
 * table, plus the two things a builder's palette must also reach: the components it can insert
 * HERE (the grammar decides, so the list is different on every selection) and the documents it
 * can switch to.
 *
 * It was the forcing case for `Command` (§44) and composed a palette by hand until the day
 * after the component shipped: Dialog, TextField, ScrollArea and Row with its own keyboard
 * model — arrow keys, Enter, a `scrollIntoView` on the lit row — written here, where §44 says
 * an app must never write it. The machine is the package's now: the roving highlight, Enter
 * running the lit row, the field's announcement and the list's scrolling all arrive by
 * membership, and this file keeps only what §44 says stays the app's — WHAT the rows are, what
 * each one means, and what it does.
 *
 * The matcher is still this app's, handed through `filter`. It is deliberately not a fuzzy
 * scorer: a palette that reorders as you type is a palette you cannot build muscle memory for,
 * so every typed word must appear and the order is the table's own — `matches` in commands.ts,
 * held by its own law.
 */

import * as React from "react";

import {
  Command,
  CommandCollection,
  CommandContent,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  Kbd,
} from "@kookie-ui/react";

import {
  COMMANDS,
  armed,
  chordLabel,
  insertCommands,
  matches,
  templateCommands,
  type Command as TableCommand,
  type CommandContext,
} from "./commands";

/** One row the palette offers. `value`/`label` is the shape Base UI reads a label from without
    being told; `group` and `keywords` are what the matcher reads. */
type Row = {
  value: string;
  label: string;
  group: string;
  keywords?: string;
  hint?: string;
  run: () => void;
};
type Section = { value: string; items: Row[] };

/* The matcher wants every word, in any order, against the title, the group and the keywords —
   `matches`'s own contract. It takes the row's words under the table's names, so the one
   function serves both the table's commands and the rows built here that are not on it. */
const filter = (item: unknown, query: string): boolean => {
  const row = item as Row;
  return matches({ title: row.label, group: row.group, ...(row.keywords ? { keywords: row.keywords } : {}) }, query);
};

export function CommandPalette({
  open,
  onOpenChange,
  ctx,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ctx: CommandContext;
}) {
  /* The list of EVERYTHING the palette can offer; the panel decides what survives the query.
     Built only while open, and memoised — `items` crosses to Base UI's matcher by identity,
     so a fresh array per render would re-run the filter pass on every unrelated render of the
     app that holds the palette. */
  const sections: Section[] = React.useMemo(() => {
    if (!open) return [];
    const asRow = (c: TableCommand): Row => ({
      value: c.id,
      label: c.title,
      group: c.group,
      ...(c.keywords ? { keywords: c.keywords } : {}),
      ...(c.chord ? { hint: chordLabel(c.chord) } : {}),
      run: () => c.run(ctx),
    });
    const commands = COMMANDS.filter((c) => armed(c, ctx)).map(asRow);
    const templates = templateCommands()
      .filter((c) => armed(c, ctx))
      .map((c): Row => ({ value: c.id, label: c.title, group: "Templates", run: () => c.run(ctx) }));
    const inserts = insertCommands(ctx).map(asRow);
    /* Blocks and templates are insertion by another name, and a document switch changes what
       preview is previewing. None of them are on the command table, so `armed` cannot reach
       them and the mode has to be asked once, here, where the rows are built. */
    const blocks: Row[] = (ctx.preview ? [] : ctx.state.blocks).map((b, i) => ({
      value: `block:${i}`,
      label: `Insert ${b.name}`,
      group: "Blocks",
      keywords: "block",
      run: () => ctx.ui.insertBlockByIndex(i),
    }));
    const documents: Row[] = (ctx.preview ? [] : ctx.state.docs)
      .filter((d) => d.id !== ctx.state.activeId)
      .map((d) => ({
        value: `doc:${d.id}`,
        label: `Switch to ${d.name}`,
        group: "Documents",
        run: () => ctx.dispatch({ type: "docSwitch", id: d.id }),
      }));
    /* Grouped in the order the rows arrive — the table's own order, then the rows built here
       — so a section's position is the table's decision and never a sort. */
    const bySection = new Map<string, Row[]>();
    for (const row of [...commands, ...templates, ...inserts, ...blocks, ...documents]) {
      const list = bySection.get(row.group) ?? [];
      list.push(row);
      bySection.set(row.group, list);
    }
    return [...bySection].map(([value, items]) => ({ value, items }));
  }, [open, ctx]);

  const run = (row: Row) => {
    onOpenChange(false);
    // After the dialog's own close work, so a command that opens another dialog is not
    // immediately dismissed by this one's teardown.
    window.setTimeout(() => row.run(), 0);
  };

  /* NO `size` (2026-09-03). It would state `2`, which IS the default — a second home for the
     baseline, the shape this app swept on 2026-09-02. The index prices the whole palette
     (§44): the box, the field, the rows and the captions move together. */
  return (
    <Command items={sections} open={open} onOpenChange={(next) => onOpenChange(next)}>
      <CommandContent aria-label="Commands" filter={filter}>
        <CommandInput aria-label="Search commands" placeholder="Search commands and components…" />
        <CommandList>
          {(section: Section) => (
            <CommandGroup key={section.value} items={section.items}>
              <CommandGroupLabel>{section.value}</CommandGroupLabel>
              <CommandCollection>
                {(row: Row) => (
                  <CommandItem
                    key={row.value}
                    value={row}
                    onClick={() => run(row)}
                    {...(row.hint ? { trailing: <Kbd>{row.hint}</Kbd> } : {})}
                  >
                    {row.label}
                  </CommandItem>
                )}
              </CommandCollection>
            </CommandGroup>
          )}
        </CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>
      </CommandContent>
    </Command>
  );
}
