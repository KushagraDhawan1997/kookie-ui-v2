"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Stack,
  Text,
} from "@kookie-ui/react";

const REGIONS = { fra: "Frankfurt", iad: "Washington, D.C.", sin: "Singapore" };
type Region = keyof typeof REGIONS;

// Hold the value in your own state with `value` and `onValueChange`. The callback can
// receive `null` when the chosen option leaves the list, so handle that case.
export default function Example() {
  const [region, setRegion] = React.useState<Region>("fra");
  return (
    <Stack gap="3" style={{ minWidth: "18rem" }}>
      <Select
        value={region}
        onValueChange={(value) => setRegion((value ?? "fra") as Region)}
        items={REGIONS}
      >
        <SelectTrigger aria-label="Region" />
        <SelectContent>
          <SelectItem value="fra">Frankfurt</SelectItem>
          <SelectItem value="iad">Washington, D.C.</SelectItem>
          <SelectItem value="sin">Singapore</SelectItem>
        </SelectContent>
      </Select>
      <Text size="2" emphasis="medium">
        New projects deploy to {REGIONS[region]}.
      </Text>
    </Stack>
  );
}
