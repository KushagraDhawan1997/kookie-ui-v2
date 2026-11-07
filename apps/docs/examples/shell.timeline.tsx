"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Scissor01Icon, ZoomInAreaIcon, ZoomOutAreaIcon } from "@hugeicons/core-free-icons";
import {
  Box,
  Flex,
  Row,
  Shell,
  ShellContent,
  ShellPaneHeader,
  ShellScroll,
  Stack,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Scissor01Icon) => <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />;

const MARKS = ["0:00", "0:05", "0:10", "0:15", "0:20", "0:25", "0:30"];
const TRACKS = [
  "V3 Titles", "V2 B-roll", "V1 Interview", "A1 Interview", "A2 Room tone", "A3 Music",
  "A4 Effects", "A5 Voice-over", "A6 Ambience", "A7 Foley",
];

// Under a floating band the tracks start below it: the pane publishes the band's reach.
const clearsBand = { paddingBlockStart: "calc(var(--kui-pane-inset-block-start) - var(--kui-sf-p))" };

// A timeline's toolbar, then the time ruler under it. The ruler stays with the toolbar while
// the tracks scroll under both.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellContent>
          <ShellPaneHeader float>
            <Toolbar backdrop>
              <ToolbarTitle>Timeline</ToolbarTitle>
              <Flex gap="1">
                <ToolbarButton iconOnly aria-label="Split clip">{icon(Scissor01Icon)}</ToolbarButton>
                <ToolbarButton iconOnly aria-label="Zoom out">{icon(ZoomOutAreaIcon)}</ToolbarButton>
                <ToolbarButton iconOnly aria-label="Zoom in">{icon(ZoomInAreaIcon)}</ToolbarButton>
              </Flex>
            </Toolbar>
            <Flex justify="space-between" aria-label="Time ruler">
              {MARKS.map((mark) => (
                <Text key={mark} size="2" emphasis="medium">
                  {mark}
                </Text>
              ))}
            </Flex>
          </ShellPaneHeader>
          <ShellScroll fade>
            <Stack style={clearsBand}>
              {TRACKS.map((track) => (
                <Row key={track} render={<div />}>
                  {track}
                </Row>
              ))}
            </Stack>
          </ShellScroll>
        </ShellContent>
      </Shell>
    </Box>
  );
}
