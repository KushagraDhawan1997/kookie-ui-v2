"use client";

import * as React from "react";
import {
  Box,
  Button,
  Heading,
  Shell,
  ShellContent,
  ShellHeader,
  ShellNotice,
  ShellNavGroup,
  ShellNavItem,
  ShellSidebar,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// ShellNotice puts a Notice in its own row above the header, across every column. The
// dismissal is your state: store it wherever it must survive. Here it lasts for the session.
export default function Example() {
  const [dismissed, setDismissed] = React.useState(false);

  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        {dismissed ? null : (
          <ShellNotice
            tone="warning"
            action={<Button>Read the plan</Button>}
            onDismiss={() => setDismissed(true)}
          >
            Scheduled maintenance on Sunday from 02:00 to 03:00 UTC.
          </ShellNotice>
        )}
        <ShellHeader>
          <Text size="2" weight="medium">
            Acme Studio
          </Text>
        </ShellHeader>
        <ShellSidebar aria-label="Sections">
          <ShellNavGroup label="Workspace">
            <ShellNavItem current>Overview</ShellNavItem>
            <ShellNavItem>Projects</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          {dismissed ? (
            <Button emphasis="quiet" bordered onClick={() => setDismissed(false)}>
              Show the notice again
            </Button>
          ) : (
            <Heading size="6">Overview</Heading>
          )}
        </ShellContent>
      </Shell>
    </Box>
  );
}
