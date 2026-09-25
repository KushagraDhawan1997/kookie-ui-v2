"use client";

import * as React from "react";
import { Checkbox, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const FILES = ["brief.pdf", "hero-final.png", "walkthrough.mp4"];

export default function Example() {
  const [selected, setSelected] = React.useState<string[]>(["brief.pdf"]);
  const all = selected.length === FILES.length;
  const some = selected.length > 0 && !all;

  const toggle = (file: string, checked: boolean) =>
    setSelected((rest) => (checked ? [...rest, file] : rest.filter((f) => f !== file)));

  return (
    <Stack gap="5">
      <Flex gap="3" align="center">
        <Checkbox
          id="all-files"
          checked={all}
          indeterminate={some}
          onCheckedChange={(checked) => setSelected(checked ? FILES : [])}
        />
        <Text size="2" weight="medium" render={<label htmlFor="all-files" />}>
          Select all files
        </Text>
      </Flex>
      {FILES.map((file) => (
        <Flex key={file} gap="3" align="center">
          <Checkbox
            id={`file-${file}`}
            checked={selected.includes(file)}
            onCheckedChange={(checked) => toggle(file, checked)}
          />
          <Text size="2" render={<label htmlFor={`file-${file}`} />}>
            {file}
          </Text>
        </Flex>
      ))}
    </Stack>
  );
}
