"use client";

import { Button, Field, FieldLabel, Flex, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack
      gap="5"
      render={<form onSubmit={(event) => event.preventDefault()} />}
      style={{ maxWidth: "24rem" }}
    >
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <TextField name="name" defaultValue="Website redesign" />
      </Field>
      <Flex gap="2" justify="flex-end">
        <Button type="reset" emphasis="quiet">
          Reset
        </Button>
        <Button type="submit" emphasis="loud">
          Create project
        </Button>
      </Flex>
    </Stack>
  );
}
