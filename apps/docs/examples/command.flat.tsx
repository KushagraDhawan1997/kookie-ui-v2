"use client";

import * as React from "react";
import {
  Button,
  Command,
  CommandContent,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTrigger,
  Text,
} from "@kushagradhawan/kookie-ui-react";

type Action = { value: string; label: string };

// A short palette does not need groups. Pass a flat array to `items`, and
// `CommandList` calls its function once for each row that matches.
const ACTIONS: Action[] = [
  { value: "new-project", label: "New project" },
  { value: "invite", label: "Invite a teammate" },
  { value: "billing", label: "Open billing" },
  { value: "api-keys", label: "Manage API keys" },
  { value: "sign-out", label: "Sign out" },
];

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <Command items={ACTIONS} open={open} onOpenChange={setOpen}>
      <CommandTrigger render={<Button emphasis="medium">Open command palette</Button>} />
      <CommandContent aria-label="Command palette">
        <CommandInput aria-label="Search commands" placeholder="Search for commands…" />
        <CommandList>
          {(action: Action) => (
            <CommandItem key={action.value} value={action}>
              {action.label}
            </CommandItem>
          )}
        </CommandList>
        <CommandEmpty>
          <Text size="2" emphasis="medium">
            No commands match.
          </Text>
        </CommandEmpty>
      </CommandContent>
    </Command>
  );
}
