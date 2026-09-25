"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Text,
} from "@kushagradhawan/kookie-ui-react";

type Region = { value: string; label: string };

// People search by the label. The form receives the value, so "London"
// submits as `eu-west-2`.
const REGIONS: Region[] = [
  { value: "eu-central-1", label: "Frankfurt" },
  { value: "eu-west-2", label: "London" },
  { value: "ap-south-1", label: "Mumbai" },
  { value: "ap-southeast-1", label: "Singapore" },
  { value: "us-east-1", label: "Virginia" },
];

export default function Example() {
  return (
    <Combobox items={REGIONS} name="region" defaultValue={REGIONS[1]!}>
      <ComboboxInput placeholder="Search regions" aria-label="Region" style={{ maxWidth: "22rem" }} />
      <ComboboxContent>
        <ComboboxEmpty>
          <Text size="2">No region matches.</Text>
        </ComboboxEmpty>
        <ComboboxList>
          {(region: Region) => (
            <ComboboxItem key={region.value} value={region}>
              {region.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
