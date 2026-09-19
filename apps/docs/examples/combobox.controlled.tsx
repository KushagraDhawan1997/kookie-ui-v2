"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Stack,
  Text,
} from "@kookie-ui/react";

const TIMEZONES = ["Asia/Kolkata", "Europe/Berlin", "Europe/London", "America/New_York", "Australia/Sydney"];

// `onValueChange` fires when a person picks an option or clears the field.
// It does not fire while they type.
export default function Example() {
  const [timezone, setTimezone] = React.useState<string | null>("Asia/Kolkata");

  return (
    <Stack gap="3" style={{ maxWidth: "22rem" }}>
      <Combobox items={TIMEZONES} value={timezone} onValueChange={setTimezone}>
        <ComboboxInput placeholder="Search time zones" aria-label="Time zone" />
        <ComboboxContent>
          <ComboboxEmpty>
            <Text size="2">No time zone matches.</Text>
          </ComboboxEmpty>
          <ComboboxList>
            {(zone: string) => (
              <ComboboxItem key={zone} value={zone}>
                {zone}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Text size="2" emphasis="medium">
        {timezone ? `Reports are sent at 09:00 in ${timezone}.` : "Pick a time zone for your reports."}
      </Text>
    </Stack>
  );
}
