"use client";

import * as React from "react";
import {
  Button,
  Card,
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Flex,
  Heading,
  Radio,
  RadioGroup,
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
          setSent(String(new FormData(event.currentTarget).get("frequency")));
        }}
      >
        <Stack gap="5">
          <Heading size="6">Email digest</Heading>
          <Field>
            <FieldLabel>How often</FieldLabel>
            <RadioGroup name="frequency" required>
              <FieldItem>
                <Radio value="daily" />
                <FieldLabel>Every day</FieldLabel>
              </FieldItem>
              <FieldItem>
                <Radio value="weekly" />
                <FieldLabel>Every Monday</FieldLabel>
              </FieldItem>
              <FieldItem>
                <Radio value="never" />
                <FieldLabel>Never</FieldLabel>
              </FieldItem>
            </RadioGroup>
            <FieldDescription>The digest lists new comments and failed deployments.</FieldDescription>
          </Field>
          <Flex gap="3" align="center" justify="space-between">
            <Text size="2" emphasis="quiet">{sent ? `Saved: ${sent}` : "Nothing saved yet."}</Text>
            <Button type="submit" emphasis="loud">
              Save
            </Button>
          </Flex>
        </Stack>
      </form>
    </Card>
  );
}
