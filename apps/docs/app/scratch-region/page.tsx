"use client";
// SCRATCH — deleted at ship. The three scales of one material over the photograph.
import * as React from "react";
import { Theme, Card, Button, Composer, ComposerInput, ComposerRow, ComposerSend, Shell, ShellSidebar, ShellContent, Stack, Flex, Text, Heading, Box, Popover, PopoverTrigger, PopoverContent, Menu, MenuTrigger, MenuContent, MenuItem } from "@kushagradhawan/kookie-ui-react";
import { BedSurface, PHOTO_BED } from "../preview/beds";

function Scene({ appearance }: { appearance: "light" | "dark" }) {
  return (
    <Theme appearance={appearance} material="regular">
      <BedSurface bed={PHOTO_BED} backdrop>
        <Stack gap="4" p="4">
          <Flex gap="4" align="start">
            <Button size="2">Button (control)</Button><Button size="2" emphasis="quiet">Quiet</Button>
            <Card size="2" style={{ width: 240 }}>
              <Stack gap="1">
                <Text size="2" weight="medium">Card (pane)</Text>
                <Text size="2" emphasis="medium">A muted line over the photo.</Text>
              </Stack>
            </Card>
            <Popover defaultOpen><PopoverTrigger render={<Button size="2" emphasis="quiet">Popover</Button>} />
              <PopoverContent><Box p="2" style={{ width: 200 }}><Text size="2" emphasis="medium">Popover (pane) — a muted line over the photo.</Text></Box></PopoverContent></Popover>
            <Menu defaultOpen><MenuTrigger render={<Button size="2" emphasis="quiet">Menu</Button>} />
              <MenuContent><MenuItem>Rename</MenuItem><MenuItem>Duplicate</MenuItem><MenuItem>Move to…</MenuItem></MenuContent></Menu>
          </Flex>
          <Composer size="2" style={{ width: 560 }}>
            <ComposerInput aria-label="Message" defaultValue="Composer (region) — the quick brown fox jumps over the lazy dog." />
            <ComposerRow>
              <Button size="2" emphasis="quiet">Attach</Button>
              <Text size="1" emphasis="medium">muted meta</Text>
              <ComposerSend />
            </ComposerRow>
          </Composer>
          <Box height="12rem">
            <Shell contained>
              <ShellSidebar aria-label="Primary" flush={false} backdrop>
                <Stack gap="1" p="3">
                  <Text size="2" weight="medium">Sidebar (region)</Text>
                  <Text size="2" emphasis="medium">Frame 1</Text>
                  <Text size="2" emphasis="medium">Frame 2</Text>
                </Stack>
              </ShellSidebar>
              <ShellContent><Stack gap="2" p="4"><Heading size="6">Canvas</Heading></Stack></ShellContent>
            </Shell>
          </Box>
        </Stack>
      </BedSurface>
    </Theme>
  );
}

export default function Page() {
  return (
    <Stack gap="0">
      <div id="light"><Scene appearance="light" /></div>
      <div id="dark"><Scene appearance="dark" /></div>
    </Stack>
  );
}
