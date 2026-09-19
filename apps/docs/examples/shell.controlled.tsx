"use client";

import * as React from "react";
import {
  Box,
  Flex,
  Heading,
  Shell,
  ShellContent,
  ShellNavGroup,
  ShellNavItem,
  ShellSidebar,
  Stack,
  Switch,
  Text,
} from "@kookie-ui/react";

// Pass `open` and `onOpenChange` to hold a pane's state yourself, for example to remember
// it between visits. `onOpenChange` fires only when a person opens or closes the pane.
export default function Example() {
  const [open, setOpen] = React.useState(true);
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellSidebar aria-label="Sections" open={open} onOpenChange={setOpen}>
          <ShellNavGroup label="Settings">
            <ShellNavItem current>Profile</ShellNavItem>
            <ShellNavItem>Notifications</ShellNavItem>
            <ShellNavItem>Billing</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          <Stack gap="4">
            <Heading size="6">Profile</Heading>
            <Flex gap="3" align="center" render={<label />}>
              <Switch checked={open} onCheckedChange={setOpen} />
              <Text size="2">Show the sidebar</Text>
            </Flex>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
