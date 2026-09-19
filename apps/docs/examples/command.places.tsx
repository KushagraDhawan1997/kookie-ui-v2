"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Book02Icon, CreditCardIcon, Home01Icon, Settings02Icon } from "@hugeicons/core-free-icons";
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
  iconStroke,
} from "@kookie-ui/react";

type Place = { value: string; label: string; href: string; glyph: typeof Home01Icon };

// A row that goes somewhere renders as a real link with `render`. It
// still opens in a new tab on a middle-click, and a screen reader
// announces it as a link.
const PLACES: Place[] = [
  { value: "dashboard", label: "Dashboard", href: "#dashboard", glyph: Home01Icon },
  { value: "billing", label: "Billing", href: "#billing", glyph: CreditCardIcon },
  { value: "settings", label: "Workspace settings", href: "#settings", glyph: Settings02Icon },
  { value: "docs", label: "Documentation", href: "#docs", glyph: Book02Icon },
];

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <Command items={PLACES} open={open} onOpenChange={setOpen}>
      <CommandTrigger render={<Button emphasis="medium">Go to…</Button>} />
      <CommandContent aria-label="Go to a page">
        <CommandInput aria-label="Search pages" placeholder="Search pages…" />
        <CommandList>
          {(place: Place) => (
            <CommandItem
              key={place.value}
              value={place}
              leading={<HugeiconsIcon icon={place.glyph} strokeWidth={iconStroke} aria-hidden />}
              render={<a href={place.href} />}
            >
              {place.label}
            </CommandItem>
          )}
        </CommandList>
        <CommandEmpty>
          <Text size="2" emphasis="medium">
            No page matches.
          </Text>
        </CommandEmpty>
      </CommandContent>
    </Command>
  );
}
