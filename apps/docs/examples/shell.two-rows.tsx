"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit02Icon } from "@hugeicons/core-free-icons";
import {
  Avatar,
  Box,
  Flex,
  Row,
  SegmentedControl,
  SegmentedItem,
  Shell,
  ShellContent,
  ShellPaneHeader,
  ShellScroll,
  Stack,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const CHATS = [
  ["MP", "Mira Patel"], ["AR", "Arjun Rao"], ["LO", "Lena Ortiz"], ["SB", "Shruti Bhatia"],
  ["MG", "Marta Gil"], ["LP", "Leo Pons"], ["JK", "Jun Kim"], ["NA", "Nadia Ali"],
  ["TW", "Tom Weber"], ["EC", "Elena Costa"], ["RS", "Ravi Singh"], ["HB", "Hana Berg"],
];

// Under a floating band the list starts below it: the pane publishes the band's reach.
const clearsBand = { paddingBlockStart: "calc(var(--kui-pane-inset-block-start) - var(--kui-sf-p))" };

// A header holds its rows one under the other: the toolbar, then the filter under it. Both rows
// float as one, and the list scrolls under them. A phone's width.
export default function Example() {
  return (
    <Flex m="bleed" flexGrow="1" height="30rem" justify="center" minWidth="0">
      <Box width="24rem" maxWidth="100%" minWidth="0">
        <Shell contained>
          <ShellContent>
            <ShellPaneHeader float>
              <Toolbar backdrop>
                <ToolbarTitle>Chats</ToolbarTitle>
                <ToolbarButton iconOnly aria-label="New chat">
                  <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={iconStroke} aria-hidden />
                </ToolbarButton>
              </Toolbar>
              <SegmentedControl backdrop defaultValue="all" aria-label="Show">
                <SegmentedItem value="all">All</SegmentedItem>
                <SegmentedItem value="unread">Unread</SegmentedItem>
                <SegmentedItem value="groups">Groups</SegmentedItem>
              </SegmentedControl>
            </ShellPaneHeader>
            <ShellScroll fade>
              <Stack style={clearsBand}>
                {CHATS.map(([initials, name]) => (
                  <Row key={name} leading={<Avatar fallback={initials} />} render={<a href={`#${initials}`} />}>
                    {name}
                  </Row>
                ))}
              </Stack>
            </ShellScroll>
          </ShellContent>
        </Shell>
      </Box>
    </Flex>
  );
}
