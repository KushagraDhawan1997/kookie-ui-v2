import { Button, Field, FieldDescription, FieldLabel, Flex, Stack, TextArea } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="4" style={{ maxWidth: "28rem" }}>
      <Field>
        <FieldLabel>Project description</FieldLabel>
        <TextArea rows={4} name="description" placeholder="What is this project for?" />
        <FieldDescription>Members see this on the project overview.</FieldDescription>
      </Field>
      <Flex justify="flex-end">
        <Button emphasis="loud">Save project</Button>
      </Flex>
    </Stack>
  );
}
