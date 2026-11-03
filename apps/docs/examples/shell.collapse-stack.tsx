"use client";

import * as React from "react";
import {
  Box,
  Flex,
  Page,
  Shell,
  ShellBack,
  ShellContent,
  ShellNavGroup,
  ShellNavItem,
  ShellPaneHeader,
  ShellScroll,
  ShellSidebar,
  Stack,
  Text,
  Toolbar,
  ToolbarTitle,
} from "@kushagradhawan/kookie-ui-react";

/* Placeholder messages for a team inbox. Not real people. */
const MESSAGES = [
  {
    id: "launch",
    from: "Shruti Bhatia",
    subject: "Launch plan",
    body: [
      "The press kit is final and the landing page is staged.",
      "Two things are left before Thursday: the pricing table copy, and a last pass on the onboarding emails.",
    ],
  },
  {
    id: "invoice",
    from: "Marco Rossi",
    subject: "Invoice",
    body: ["The October invoice is attached. Payment is due on 15 November."],
  },
  {
    id: "review",
    from: "Aiko Tanaka",
    subject: "Review moved",
    body: ["Friday's design review moves to 3pm, in the same room."],
  },
];

// The sidebar is the list you browse, so on a narrow window it collapses into a stack: the list
// first, then the message, with Back in the message's band. On a wide window both show. The
// open message lives in this example's state, as it would live in your router's URL.
export default function Example() {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const message = MESSAGES.find((m) => m.id === openId);
  return (
    <Box m="bleed" flexGrow="1" height="30rem">
      <Shell contained style={{ "--shell-sidebar-w": "13rem" } as React.CSSProperties}>
        <ShellSidebar
          aria-label="Inbox"
          collapse="stack"
          view={openId ? "content" : "sidebar"}
          onViewChange={(view) => {
            if (view === "sidebar") setOpenId(null);
          }}
        >
          <ShellPaneHeader>
            <Toolbar>
              <ToolbarTitle>Inbox</ToolbarTitle>
            </Toolbar>
          </ShellPaneHeader>
          <ShellScroll>
            <ShellNavGroup>
              {MESSAGES.map((m) => (
                <ShellNavItem key={m.id} current={m.id === openId} onClick={() => setOpenId(m.id)}>
                  {m.subject}
                </ShellNavItem>
              ))}
            </ShellNavGroup>
          </ShellScroll>
        </ShellSidebar>
        <ShellContent>
          <ShellPaneHeader>
            <Toolbar>
              <Flex align="center">
                <ShellBack aria-label="Back to Inbox" />
                <ToolbarTitle />
              </Flex>
            </Toolbar>
          </ShellPaneHeader>
          <ShellScroll>
            {message ? (
              <Page title={message.subject} description={message.from}>
                <Stack gap="3">
                  {message.body.map((line) => (
                    <Text key={line} size="3">
                      {line}
                    </Text>
                  ))}
                </Stack>
              </Page>
            ) : (
              <Page title="Inbox" />
            )}
          </ShellScroll>
        </ShellContent>
      </Shell>
    </Box>
  );
}
