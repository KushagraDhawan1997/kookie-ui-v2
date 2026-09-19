import { HugeiconsIcon } from "@hugeicons/react";
import { CommandLineIcon } from "@hugeicons/core-free-icons";
import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  Shell,
  ShellBottom,
  ShellContent,
  ShellTrigger,
  Stack,
  Text,
  iconStroke,
} from "@kookie-ui/react";

// ShellBottom is a full-width pane under the columns, for a console or a log. It stays
// closed until a ShellTrigger opens it.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellContent>
          <Flex align="start" justify="space-between" gap="4">
            <Stack gap="2">
              <Heading size="6">Deploy #214</Heading>
              <Text size="2" emphasis="medium">
                Building the main branch.
              </Text>
            </Stack>
            <ShellTrigger
              target="bottom"
              render={
                <Button
                  emphasis="medium"
                  leading={<HugeiconsIcon icon={CommandLineIcon} strokeWidth={iconStroke} aria-hidden />}
                />
              }
            >
              Build log
            </ShellTrigger>
          </Flex>
        </ShellContent>
        <ShellBottom aria-label="Build log" defaultOpen>
          <Stack gap="2">
            <Code>Installing dependencies…</Code>
            <Code>Compiled 412 modules in 8.4s</Code>
          </Stack>
        </ShellBottom>
      </Shell>
    </Box>
  );
}
