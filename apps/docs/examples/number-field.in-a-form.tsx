"use client";

import * as React from "react";
import {
  Button,
  Card,
  Field,
  FieldDescription,
  FieldLabel,
  Flex,
  Heading,
  NumberField,
  Stack,
  Text,
} from "@kookie-ui/react";

export default function Example() {
  const [sent, setSent] = React.useState<string | null>(null);

  return (
    <Card style={{ maxWidth: "24rem" }}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSent(`${data.get("nodes")} nodes, ${data.get("memory")} GB each`);
        }}
      >
        <Stack gap="5">
          <Heading size="6">Scale the cluster</Heading>
          <Field>
            <FieldLabel>Nodes</FieldLabel>
            <NumberField name="nodes" defaultValue={3} min={1} max={32} required />
          </Field>
          <Field>
            <FieldLabel>Memory per node</FieldLabel>
            <NumberField name="memory" defaultValue={8} min={2} max={64} step={2} required />
            <FieldDescription>In gigabytes, in steps of 2.</FieldDescription>
          </Field>
          <Flex gap="3" align="center" justify="space-between">
            <Text size="2" emphasis="quiet">
              {sent ?? "Nothing applied yet."}
            </Text>
            <Button type="submit" emphasis="loud">
              Apply
            </Button>
          </Flex>
        </Stack>
      </form>
    </Card>
  );
}
