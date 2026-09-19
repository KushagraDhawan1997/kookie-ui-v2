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
  Flex,
  Kbd,
  Text,
} from "@kookie-ui/react";

type Action = { value: string; label: string };

const ACTIONS: Action[] = [
  { value: "new-file", label: "New file" },
  { value: "search", label: "Search in project" },
  { value: "deploy", label: "Deploy to production" },
  { value: "settings", label: "Open settings" },
];

// Your app decides which keys open the palette. Listen for them yourself
// and set `open`. Without a CommandTrigger, the palette renders no button.
export default function Example() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Flex gap="3" align="center">
      <Button emphasis="medium" onClick={() => setOpen(true)} trailing={<Kbd>⌘K</Kbd>}>
        Search
      </Button>
      <Text size="2" emphasis="medium">
        Or press <Kbd>⌘</Kbd> <Kbd>K</Kbd> anywhere on the page.
      </Text>
      <Command items={ACTIONS} open={open} onOpenChange={setOpen}>
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
    </Flex>
  );
}
