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
} from "@kookie-ui/react";

type Setting = { value: string; label: string };

const SETTINGS: Setting[] = [
  { value: "email", label: "Email notifications" },
  { value: "digest", label: "Weekly digest" },
  { value: "mentions", label: "Mentions only" },
];

// Running a row closes the palette. When a row toggles a setting, people
// often want to change several. Call `cancel()` for the `item-press`
// reason and the palette stays open.
export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>({ email: true });

  return (
    <Command
      items={SETTINGS}
      open={open}
      onOpenChange={(next, details) => {
        if (!next && details.reason === "item-press") {
          details.cancel();
          return;
        }
        setOpen(next);
      }}
    >
      <CommandTrigger render={<Button emphasis="medium">Notification settings</Button>} />
      <CommandContent aria-label="Notification settings">
        <CommandInput aria-label="Search settings" placeholder="Search settings…" />
        <CommandList>
          {(setting: Setting) => (
            <CommandItem
              key={setting.value}
              value={setting}
              trailing={
                <Text size="2" emphasis="medium">
                  {enabled[setting.value] ? "On" : "Off"}
                </Text>
              }
              onClick={() => setEnabled((all) => ({ ...all, [setting.value]: !all[setting.value] }))}
            >
              {setting.label}
            </CommandItem>
          )}
        </CommandList>
        <CommandEmpty>
          <Text size="2" emphasis="medium">
            No settings match.
          </Text>
        </CommandEmpty>
      </CommandContent>
    </Command>
  );
}
