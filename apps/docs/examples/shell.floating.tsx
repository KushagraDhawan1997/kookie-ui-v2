import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, LayerIcon, Search01Icon } from "@hugeicons/core-free-icons";
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
} from "@kookie-ui/react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Set `flush={false}` on the side panes and leave the content flush. The content then fills
// the whole frame, and the panes float over it as separate panels.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellRail aria-label="Tools" flush={false}>
          <ShellRailList>
            <ShellRailItem label="Home" current>
              {icon(Home01Icon)}
            </ShellRailItem>
            <ShellRailItem label="Search">{icon(Search01Icon)}</ShellRailItem>
          </ShellRailList>
        </ShellRail>
        <ShellSidebar aria-label="Layers" flush={false}>
          <ShellNavGroup label="Layers">
            <ShellNavItem current leading={icon(LayerIcon)}>
              Header
            </ShellNavItem>
            <ShellNavItem leading={icon(LayerIcon)}>Hero image</ShellNavItem>
            <ShellNavItem leading={icon(LayerIcon)}>Footer</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          <Stack gap="2">
            <Heading size="6">Canvas</Heading>
            <Text size="2" emphasis="medium">
              The work area runs under the rail and the sidebar.
            </Text>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
