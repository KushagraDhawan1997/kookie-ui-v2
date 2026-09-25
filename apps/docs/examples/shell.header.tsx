import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon, Home01Icon, Rocket01Icon, SidebarLeftIcon } from "@hugeicons/core-free-icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  Shell,
  ShellContent,
  ShellHeader,
  ShellNavGroup,
  ShellNavItem,
  ShellSidebar,
  ShellTrigger,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// ShellHeader is a full-width bar above every column. A ShellTrigger in it opens and
// closes the sidebar, so people can get the sidebar back after they close it.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellHeader>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="3">
              <ShellTrigger
                target="sidebar"
                render={<Button iconOnly emphasis="quiet" aria-label="Toggle navigation" />}
              >
                {icon(SidebarLeftIcon)}
              </ShellTrigger>
              <Text size="2" weight="medium">
                Acme Studio
              </Text>
            </Flex>
            <Button emphasis="loud">New project</Button>
          </Flex>
        </ShellHeader>
        <ShellSidebar aria-label="Sections">
          <ShellNavGroup label="Workspace">
            <ShellNavItem current leading={icon(Home01Icon)}>
              Overview
            </ShellNavItem>
            <ShellNavItem leading={icon(Folder01Icon)}>Projects</ShellNavItem>
            <ShellNavItem leading={icon(Rocket01Icon)}>Deploys</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          <Stack gap="2">
            <Heading size="6">Overview</Heading>
            <Text size="2" emphasis="medium">
              Two deploys finished this morning.
            </Text>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
