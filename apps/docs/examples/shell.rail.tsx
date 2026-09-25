import { HugeiconsIcon } from "@hugeicons/react";
import {
  Folder01Icon,
  Home01Icon,
  Notification02Icon,
  Search01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import {
  Box,
  Heading,
  Shell,
  ShellContent,
  ShellNavGroup,
  ShellNavItem,
  ShellRail,
  ShellRailItem,
  ShellRailList,
  ShellSidebar,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// A ShellRail is a narrow column of icons for the top-level areas of an app. The sidebar
// beside it lists the pages in the chosen area. Give each `<nav>` its own `aria-label`.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellRail aria-label="Areas">
          <ShellRailList>
            <ShellRailItem label="Home" current>
              {icon(Home01Icon)}
            </ShellRailItem>
            <ShellRailItem label="Search">{icon(Search01Icon)}</ShellRailItem>
            <ShellRailItem label="Inbox">{icon(Notification02Icon)}</ShellRailItem>
          </ShellRailList>
          <ShellRailList>
            <ShellRailItem label="Settings">{icon(Settings02Icon)}</ShellRailItem>
          </ShellRailList>
        </ShellRail>
        <ShellSidebar aria-label="Pages">
          <ShellNavGroup label="Home">
            <ShellNavItem current>Overview</ShellNavItem>
            <ShellNavItem leading={icon(Folder01Icon)}>Recent files</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          <Stack gap="2">
            <Heading size="6">Overview</Heading>
            <Text size="2" emphasis="medium">
              The rail picks the area. The sidebar shows the pages inside it.
            </Text>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
