import {
  Box,
  Heading,
  Shell,
  ShellContent,
  ShellHeader,
  ShellNavGroup,
  ShellNavItem,
  ShellSidebar,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// Set `flush={false}` on ShellContent and leave the other panes flush. The work area
// becomes its own panel, set in from the frame, while the header and sidebar stay joined.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellHeader>
          <Text size="2" weight="medium">
            Acme Mail
          </Text>
        </ShellHeader>
        <ShellSidebar aria-label="Folders">
          <ShellNavGroup label="Folders">
            <ShellNavItem current>Inbox</ShellNavItem>
            <ShellNavItem>Drafts</ShellNavItem>
            <ShellNavItem>Archive</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent flush={false}>
          <Stack gap="2">
            <Heading size="6">Inbox</Heading>
            <Text size="2" emphasis="medium">
              You have no unread messages.
            </Text>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
