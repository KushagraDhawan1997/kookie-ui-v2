"use client";

import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Button,
  Flex,
  Stack,
} from "@kookie-ui/react";

const sections = [
  { value: "general", title: "General", body: "Project name, slug and default branch." },
  { value: "members", title: "Members", body: "Eight people have access to this project." },
  { value: "danger", title: "Danger zone", body: "Transfer or delete the project." },
];

// Pass `value` and `onValueChange` when the app decides what is open. Here two buttons open
// and close every section at once.
export default function Example() {
  const [open, setOpen] = React.useState<string[]>(["general"]);
  return (
    <Stack gap="4" style={{ minWidth: "22rem" }}>
      <Flex gap="2">
        <Button emphasis="medium" onClick={() => setOpen(sections.map((s) => s.value))}>
          Expand all
        </Button>
        <Button emphasis="medium" onClick={() => setOpen([])}>
          Collapse all
        </Button>
      </Flex>
      <Accordion multiple value={open} onValueChange={(next) => setOpen(next as string[])}>
        {sections.map((section) => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger>{section.title}</AccordionTrigger>
            <AccordionPanel>{section.body}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Stack>
  );
}
