import {
  Button,
  Card,
  Checkbox,
  Field,
  FieldItem,
  FieldLabel,
  Flex,
  Heading,
  Stack,
  Text,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Card size="3">
      <Stack gap="6">
        <Stack gap="2">
          <Heading size="6">New project</Heading>
          <Text size="3" emphasis="medium">Anyone in the workspace can open it.</Text>
        </Stack>

        <Stack gap="5">
          <Field size="3">
            <FieldLabel>Project name</FieldLabel>
            <TextField required />
          </Field>
          <Field size="3">
            <FieldItem>
              <Checkbox />
              <FieldLabel>Keep it private for now</FieldLabel>
            </FieldItem>
          </Field>
        </Stack>

        <Flex justify="flex-end" gap="3">
          <Button size="3">Cancel</Button>
          <Button size="3" tone="accent" emphasis="loud">Create project</Button>
        </Flex>
      </Stack>
    </Card>
  );
}
