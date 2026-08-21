import {
  Box,
  Button,
  Flex,
  Shell,
  ShellContent,
  ShellHeader,
  ShellSidebar,
  ShellTrigger,
  Stack,
  Text,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Box height="14rem">
      <Shell>
        <ShellHeader>
          <Flex align="center" gap="3" px="3" py="2">
            <ShellTrigger
              target="sidebar"
              render={<Button size="1" emphasis="quiet" aria-label="Toggle navigation" />}
            >
              Nav
            </ShellTrigger>
            <Text size="2" weight="medium">Kookie Studio</Text>
          </Flex>
        </ShellHeader>
        <ShellSidebar aria-label="Primary">
          <Stack gap="1" p="3">
            <Text size="2" weight="medium">Projects</Text>
            <Text size="2" emphasis="medium">Deploys</Text>
            <Text size="2" emphasis="medium">Settings</Text>
          </Stack>
        </ShellSidebar>
        <ShellContent>
          <Stack gap="2" p="4">
            <Text size="2" emphasis="medium">The content pane scrolls itself; the shell never does.</Text>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
