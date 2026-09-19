import {
  Button,
  Card,
  Field,
  FieldDescription,
  FieldLabel,
  Flex,
  Heading,
  Stack,
  Text,
  TextField,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "28rem" }}>
      <Stack gap="5">
        <Stack gap="1">
          <Heading size="5">Workspace name</Heading>
          <Text size="2" emphasis="medium">
            Members see this name in invitations and on invoices.
          </Text>
        </Stack>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <TextField defaultValue="Kookie Studio" />
          <FieldDescription>Use 32 characters or fewer.</FieldDescription>
        </Field>
        <Flex justify="flex-end" gap="2">
          <Button emphasis="quiet">Cancel</Button>
          <Button emphasis="loud">Save changes</Button>
        </Flex>
      </Stack>
    </Card>
  );
}
