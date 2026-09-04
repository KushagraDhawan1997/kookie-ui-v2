"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  FolderOpenIcon,
  GithubIcon,
  Link01Icon,
  Moon02Icon,
  PlusSignIcon,
  Search01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import {
  Button,
  Command,
  CommandCollection,
  CommandContent,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTrigger,
  Kbd,
  iconStroke,
  type TypeSize,
} from "@kookie-ui/react";
import * as React from "react";

import { EmptyState } from "../blocks/empty-state";

// The package ships no icon set, so the glyphs are yours. `iconStroke` is the weight the system
// draws its own with, so your set matches them. No size: the row sizes the slot's svg.
const icon = (glyph: typeof PlusSignIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

type Action = {
  value: string;
  label: string;
  glyph?: React.ReactNode;
  /** The chord that also runs it, shown at the far edge. */
  chord?: string;
  /** The one meaning a row may carry. */
  tone?: "destructive";
  /** Nothing to run right now — visible, announced, not reachable. */
  disabled?: boolean;
  /** A row that is a PLACE rather than a verb becomes a real anchor. */
  href?: string;
};
type Section = { value: string; items: Action[] };

/* Hold the array stable — it crosses to the matcher by identity, so an inline literal re-runs
   the whole filter pass on every unrelated render of whatever holds the palette. */
const SECTIONS: Section[] = [
  {
    value: "Actions",
    items: [
      { value: "new", label: "New project", glyph: icon(PlusSignIcon), chord: "N" },
      { value: "open", label: "Open recent", glyph: icon(FolderOpenIcon), chord: "O" },
      { value: "invite", label: "Invite a teammate", glyph: icon(UserAdd01Icon) },
      // Disabled is a STATE, not a variant: the row still reads and still announces, and the
      // keyboard skips it.
      { value: "import", label: "Import from GitHub", glyph: icon(GithubIcon), disabled: true },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "appearance", label: "Appearance", glyph: icon(Moon02Icon) },
      // A row that goes somewhere is a real anchor, so it middle-clicks, opens in a new tab and
      // announces as a link. The row stays one target — an anchor nested inside it would be two.
      { value: "docs", label: "Open documentation", glyph: icon(Link01Icon), href: "https://example.com/docs" },
    ],
  },
  {
    value: "Danger",
    items: [
      // The only meaning a row may carry. It tints the words, and the system decides how.
      { value: "delete", label: "Delete this project", glyph: icon(Delete02Icon), tone: "destructive" },
    ],
  },
];

export default function Example({ size = "3" }: { size?: TypeSize }) {
  void size;
  const [open, setOpen] = React.useState(false);

  return (
    /* `size` prices the whole palette — the panel, the field, the rows and the captions — because
       the component owns all of it. Groups are the only divider: the list is a listbox, and a
       group divides it in the accessibility tree as well as on screen. */
    <Command items={SECTIONS} open={open} onOpenChange={setOpen}>
      <CommandTrigger render={<Button emphasis="medium">Open command palette</Button>} />
      <CommandContent aria-label="Command palette">
        <CommandInput
          aria-label="Search commands"
          placeholder="Search for commands…"
          leading={icon(Search01Icon)}
        />
        <CommandList>
          {(section: Section) => (
            <CommandGroup key={section.value} items={section.items}>
              <CommandGroupLabel>{section.value}</CommandGroupLabel>
              <CommandCollection>
                {(action: Action) => (
                  <CommandItem
                    key={action.value}
                    value={action}
                    onClick={() => setOpen(false)}
                    {...(action.glyph ? { leading: action.glyph } : {})}
                    {...(action.chord ? { trailing: <Kbd>{action.chord}</Kbd> } : {})}
                    {...(action.tone ? { tone: action.tone } : {})}
                    {...(action.disabled ? { disabled: true } : {})}
                    {...(action.href
                      ? { render: <a href={action.href} target="_blank" rel="noreferrer" /> }
                      : {})}
                  >
                    {action.label}
                  </CommandItem>
                )}
              </CommandCollection>
            </CommandGroup>
          )}
        </CommandList>
        {/* CommandEmpty places what you give it and dresses none of it, so what goes in is an
            empty state rather than a sentence — the same block the docs site's own search uses. */}
        <CommandEmpty>
          <EmptyState
            title="No commands match"
            description="Try a shorter word, or check what you typed."
          />
        </CommandEmpty>
      </CommandContent>
    </Command>
  );
}
