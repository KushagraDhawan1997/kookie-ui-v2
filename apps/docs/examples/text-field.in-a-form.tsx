"use client";

import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Flex,
  Stack,
  TextField,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack
      gap="5"
      style={{ maxWidth: "24rem" }}
      render={<form onSubmit={(event) => event.preventDefault()} />}
    >
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <TextField name="name" defaultValue="Website redesign" required />
      </Field>
      <Field>
        <FieldLabel>Project URL</FieldLabel>
        <TextField name="url" type="url" placeholder="https://example.com" />
        <FieldDescription>We link to it from the project page.</FieldDescription>
      </Field>
      <Flex gap="2" justify="end">
        <Button type="reset">Reset</Button>
        <Button type="submit" emphasis="loud">
          Create project
        </Button>
      </Flex>
    </Stack>
  );
}
