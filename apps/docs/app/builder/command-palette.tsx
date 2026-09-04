"use client";

/**
 * ⌘K (2026-08-20) — one field over the command table, plus the two things a builder's
 * palette must also reach: the components it can insert HERE (the grammar decides, so the
 * list is different on every selection) and the documents it can switch to.
 *
 * IT IS THE PACKAGE'S `Command` SINCE 2026-09-04, and this file is the forcing case DECISIONS
 * §44 names by path. It used to be a palette assembled out of Dialog, TextField, ScrollArea and
 * Row, with its own keyboard model written out longhand — an `active` index, arrow keys, an
 * Enter branch, a `scrollIntoView` effect to keep the highlight in view, and a reset on open.
 * Every line of that is the thing §44 says an app must never write twice: "a row highlighted
 * from the first frame, the highlight surviving a keystroke, Enter running the highlighted row,
 * and the announcement tying the field to the list". Ninety lines went with it, and what is
 * left is what was always genuinely this app's — WHICH rows exist.
 *
 * WHAT STAYED, and why each one is the app's rather than the system's:
 *
 *  - **The matcher.** It is deliberately not a fuzzy-scored one: a palette that reorders as you
 *    type is a palette you cannot build muscle memory for, so every typed word must appear and
 *    the order is the table's own. §44 refuses fuzzy reordering for the same reason and hands
 *    the matcher through as `filter`, so `matches` moved from a call the palette made itself to
 *    a function the panel calls — same rule, one home.
 *  - **Who is eligible.** `armed` is a question about this editor's state, and the mode gate on
 *    blocks and documents is a question about preview. Neither is text matching, so both are
 *    still asked here, once, while the rows are built.
 *  - **The deferred run.** A command that opens another dialog must not be dismissed by this
 *    one's teardown, so the row's work happens after the close.
 *
 * The rows are `Row`s and always were (2026-08-23) — they are `CommandItem`s now, which is the
 * same family member with the highlight coming from the primitive rather than from a prop this
 * file computed.
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

import { EmptyState } from "../../blocks/empty-state";
import {
  COMMANDS,
  armed,
  chordLabel,
  insertCommands,
  matches,
  templateCommands,
  type Command as EditorCommand,
  type CommandContext,
} from "./commands";

/** One row. `keywords` and `group` are here because they are what the matcher reads, not
    because anything paints them — the caption comes from the group it sits in. */
type PaletteRow = {
  key: string;
  title: string;
  group: string;
  keywords?: string;
  hint?: string;
  run: () => void;
};

/** A caption and its rows. Base UI narrows inside a group and drops the group when nothing in
    it survives, which is what the old header-on-change loop was doing by hand.

    `key` IS NOT THE CAPTION, and that was a real defect for one run (2026-09-04): the command
    table is written in reading order rather than grouped, so one name can open two runs — and
    keying the section by its caption put two children with the key `Select` in the list, which
    React reports and then resolves by guessing. The old spelling never hit it because it keyed
    every ROW into one flat list and drew captions as it went. Base UI reads nothing off a group
    but its `items`, so the extra field costs nothing. */
type PaletteSection = { key: string; caption: string; items: PaletteRow[] };

export function CommandPalette({
  open,
  onOpenChange,
  ctx,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ctx: CommandContext;
}) {
  const sections: PaletteSection[] = React.useMemo(() => {
    if (!open) return [];
    const asRow = (c: EditorCommand): PaletteRow => ({
      key: c.id,
      title: c.title,
      group: c.group,
      ...(c.keywords ? { keywords: c.keywords } : {}),
      ...(c.chord ? { hint: chordLabel(c.chord) } : {}),
      run: () => c.run(ctx),
    });

    /* Blocks and templates are insertion by another name, and a document switch changes what
       preview is previewing. None of them are on the command table, so `armed` cannot reach
       them and the mode has to be asked once, here, where the rows are built. */
    const rows: PaletteRow[] = [
      ...COMMANDS.filter((c) => armed(c, ctx)).map(asRow),
      ...templateCommands()
        .filter((c) => armed(c, ctx))
        .map((c): PaletteRow => ({ ...asRow(c), group: "Templates" })),
      ...insertCommands(ctx).map(asRow),
      ...(ctx.preview ? [] : ctx.state.blocks).map(
        (b, i): PaletteRow => ({
          key: `block:${i}`,
          title: `Insert ${b.name}`,
          group: "Blocks",
          // The old spelling matched against "Insert block <name>", so typing "block" found a
          // saved block. The word is a keyword now rather than a sentence nobody renders.
          keywords: "block",
          run: () => ctx.ui.insertBlockByIndex(i),
        }),
      ),
      ...(ctx.preview ? [] : ctx.state.docs)
        .filter((d) => d.id !== ctx.state.activeId)
        .map(
          (d): PaletteRow => ({
            key: `doc:${d.id}`,
            title: `Switch to ${d.name}`,
            group: "Documents",
            run: () => ctx.dispatch({ type: "docSwitch", id: d.id }),
          }),
        ),
    ];

    /* Consecutive runs, not a keyed bucket: the command table is written in the order it should
       be read, and grouping by key would re-sort it. This is exactly what the old
       header-on-change loop produced, and it produces the same sections for the same reason. */
    const out: PaletteSection[] = [];
    for (const row of rows) {
      const last = out[out.length - 1];
      if (last && last.caption === row.group) last.items.push(row);
      else out.push({ key: `${row.group}:${out.length}`, caption: row.group, items: [row] });
    }
    return out;
  }, [open, ctx]);

  /* THE PANEL'S MATCHER IS TYPED `unknown`, because Base UI's list can hold groups as well as
     items and only this file knows which is which. The guard is what makes the cast unnecessary
     — and the `true` arm is not a fudge: if a group ever reaches this, an item matcher has no
     opinion about it and must not remove it, because the group's own rows are what decide
     whether it survives. */
  const isRow = (v: unknown): v is PaletteRow =>
    typeof v === "object" && v !== null && typeof (v as PaletteRow).title === "string";

  const run = (row: PaletteRow) => {
    onOpenChange(false);
    // After the dialog's own close work, so a command that opens another dialog is not
    // immediately dismissed by this one's teardown.
    window.setTimeout(() => row.run(), 0);
  };

  return (
    <Command items={sections} open={open} onOpenChange={onOpenChange}>
      <CommandContent
        aria-label="Commands"
        filter={(item, query) => (isRow(item) ? matches(item, query) : true)}
      >
        <CommandInput aria-label="Search commands" placeholder="Search commands and components…" />
        <CommandList>
          {(section: PaletteSection) => (
            <CommandGroup key={section.key} items={section.items}>
              <CommandGroupLabel>{section.caption}</CommandGroupLabel>
              <CommandCollection>
                {(row: PaletteRow) => (
                  <CommandItem
                    key={row.key}
                    value={row}
                    onClick={() => run(row)}
                    {...(row.hint ? { trailing: <Kbd>{row.hint}</Kbd> } : {})}
                  >
                    {row.title}
                  </CommandItem>
                )}
              </CommandCollection>
            </CommandGroup>
          )}
        </CommandList>
        {/* The query is deliberately not quoted back. It was — "Nothing matches “{query}”" — and
            reaching it now would mean controlling Base UI's input from outside the panel, which
            is the machine this component exists to stop apps from touching. What the sentence
            has to say is what to do next, and that does not need the word you typed. */}
        <CommandEmpty>
          <EmptyState
            title="Nothing matches"
            description="Every word you type has to appear. Try one word, or a shorter one."
          />
        </CommandEmpty>
      </CommandContent>
    </Command>
  );
}
