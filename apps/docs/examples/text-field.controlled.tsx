"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button, Stack, Text, TextField, iconStroke } from "@kushagradhawan/kookie-ui-react";

const FILES = ["Invoice March.pdf", "Invoice April.pdf", "Brand guide.pdf", "Roadmap.key"];

export default function Example() {
  const [query, setQuery] = React.useState("invoice");
  const matches = FILES.filter((file) => file.toLowerCase().includes(query.toLowerCase()));

  return (
    <Stack gap="3" style={{ maxWidth: "22rem" }}>
      <TextField
        type="search"
        aria-label="Filter files"
        placeholder="Filter files"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        leading={<HugeiconsIcon icon={Search01Icon} strokeWidth={iconStroke} aria-hidden />}
        trailing={
          query && (
            <Button iconOnly emphasis="quiet" aria-label="Clear filter" onClick={() => setQuery("")}>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
            </Button>
          )
        }
      />
      <Text size="2" emphasis="medium">
        {matches.length} of {FILES.length} files match
      </Text>
    </Stack>
  );
}
