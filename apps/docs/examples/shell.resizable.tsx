import {
  Box,
  Heading,
  Shell,
  ShellContent,
  ShellNavGroup,
  ShellNavItem,
  ShellSidebar,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// Set `resizable` to let people drag the sidebar's edge, or step it with the arrow keys.
// `minWidth` and `maxWidth` limit the drag. Store the width from `onResize` to keep it.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellSidebar aria-label="Files" resizable width={240} minWidth={180} maxWidth={360}>
          <ShellNavGroup label="Files">
            <ShellNavItem current>README.md</ShellNavItem>
            <ShellNavItem>package.json</ShellNavItem>
            <ShellNavItem>src/components/navigation-menu.tsx</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          <Stack gap="2">
            <Heading size="6">README.md</Heading>
            <Text size="2" emphasis="medium">
              Drag the sidebar's edge to show longer file names.
            </Text>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
