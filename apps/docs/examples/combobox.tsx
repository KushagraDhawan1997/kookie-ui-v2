"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Text,
} from "@kookie-ui/react";

// Hold the options steady. They reach the matcher by identity, so an array written
// inside the component runs the whole filter again on every render.
const REGIONS = ["Frankfurt", "London", "Mumbai", "São Paulo", "Singapore", "Sydney"];

export default function Example() {
  return (
    <Combobox items={REGIONS} defaultValue="Mumbai">
      <ComboboxInput placeholder="Search regions" aria-label="Region" style={{ maxWidth: "22rem" }} />
      <ComboboxContent>
        <ComboboxEmpty>
          <Text size="2">No region matches.</Text>
        </ComboboxEmpty>
        <ComboboxList>
          {(region: string) => (
            <ComboboxItem key={region} value={region}>
              {region}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
