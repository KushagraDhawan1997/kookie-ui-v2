"use client";

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
  type TypeSize,
} from "@kookie-ui/react";
import * as React from "react";

type Action = { value: string; label: string; chord?: string };
type Section = { value: string; items: Action[] };

const SECTIONS: Section[] = [
  {
    value: "Actions",
    items: [
      { value: "new", label: "New project", chord: "N" },
      { value: "import", label: "Import from GitHub" },
      { value: "invite", label: "Invite a teammate" },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "appearance", label: "Appearance" },
      { value: "shortcuts", label: "Keyboard shortcuts", chord: "?" },
    ],
  },
];

export default function Example({ size = "3" }: { size?: TypeSize }) {
  void size;
  const [open, setOpen] = React.useState(false);

  return (
    <Command items={SECTIONS} open={open} onOpenChange={setOpen}>
      <CommandTrigger render={<Button emphasis="medium">Open command palette</Button>} />
      <CommandContent aria-label="Command palette">
        <CommandInput aria-label="Search commands" placeholder="Search for commands…" />
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
                    {...(action.chord ? { trailing: <Kbd>{action.chord}</Kbd> } : {})}
                  >
                    {action.label}
                  </CommandItem>
                )}
              </CommandCollection>
            </CommandGroup>
          )}
        </CommandList>
        <CommandEmpty>No commands match that.</CommandEmpty>
      </CommandContent>
    </Command>
  );
}
