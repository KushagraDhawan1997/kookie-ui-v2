import { Button, Flex, Stack, Surface, Text, TextField, Theme } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="4" style={{ minWidth: "28rem" }}>
      <Flex gap="2">
        <TextField placeholder="Search invoices" aria-label="Search invoices" />
        <Button>Export</Button>
      </Flex>
      <Theme appearance="dark" density="compact" radius="small">
        <Surface size="2">
          <Stack gap="3">
            <Text size="2" weight="medium">
              Terminal output
            </Text>
            <Flex gap="2">
              <TextField placeholder="Run a command" aria-label="Run a command" />
              <Button emphasis="loud">Run</Button>
            </Flex>
          </Stack>
        </Surface>
      </Theme>
    </Stack>
  );
}
