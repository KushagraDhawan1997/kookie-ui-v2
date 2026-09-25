"use client";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  Text,
} from "@kushagradhawan/kookie-ui-react";

type Section = { value: string; items: string[] };

// Each group carries its own options. When nothing in a group matches,
// the group and its heading disappear together.
const REGIONS: Section[] = [
  { value: "Europe", items: ["Frankfurt", "London", "Paris", "Stockholm"] },
  { value: "Asia Pacific", items: ["Mumbai", "Singapore", "Sydney", "Tokyo"] },
  { value: "Americas", items: ["São Paulo", "Toronto", "Virginia"] },
];

export default function Example() {
  return (
    <Combobox items={REGIONS}>
      <ComboboxInput placeholder="Search regions" aria-label="Region" style={{ maxWidth: "22rem" }} />
      <ComboboxContent>
        <ComboboxEmpty>
          <Text size="2">No region matches.</Text>
        </ComboboxEmpty>
        <ComboboxList>
          {(section: Section) => (
            <ComboboxGroup key={section.value} items={section.items}>
              <ComboboxLabel>{section.value}</ComboboxLabel>
              <ComboboxCollection>
                {(region: string) => (
                  <ComboboxItem key={region} value={region}>
                    {region}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
