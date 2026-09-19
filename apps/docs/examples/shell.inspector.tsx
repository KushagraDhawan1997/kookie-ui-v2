import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarRightIcon } from "@hugeicons/core-free-icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  Shell,
  ShellContent,
  ShellInspector,
  ShellTrigger,
  Stack,
  Text,
  iconStroke,
} from "@kookie-ui/react";

// ShellInspector is a details column at the end of the frame. It stays closed until a
// ShellTrigger opens it. Pass `defaultOpen` to start it open.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellContent>
          <Flex align="start" justify="space-between" gap="4">
            <Stack gap="2">
              <Heading size="6">hero-final.png</Heading>
              <Text size="2" emphasis="medium">
                Uploaded to Brand kit.
              </Text>
            </Stack>
            <ShellTrigger
              target="inspector"
              render={<Button iconOnly emphasis="quiet" aria-label="Toggle details" />}
            >
              <HugeiconsIcon icon={SidebarRightIcon} strokeWidth={iconStroke} aria-hidden />
            </ShellTrigger>
          </Flex>
        </ShellContent>
        <ShellInspector aria-label="Details" defaultOpen>
          <Stack gap="4">
            <Heading size="4">Details</Heading>
            <Stack gap="1">
              <Text size="2" emphasis="medium">
                Owner
              </Text>
              <Text size="2">Shruti Bhatia</Text>
            </Stack>
            <Stack gap="1">
              <Text size="2" emphasis="medium">
                Size
              </Text>
              <Text size="2">3.8 MB</Text>
            </Stack>
          </Stack>
        </ShellInspector>
      </Shell>
    </Box>
  );
}
