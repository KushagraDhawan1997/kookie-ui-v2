"use client";
// SCRATCH — deleted after the screenshot. Three scales of one material over the photograph.
import * as React from "react";
import { Theme, Card, Button, Composer, ComposerInput, ComposerRow, ComposerSend, Shell, ShellSidebar, ShellContent, Stack, Flex, Text, Heading, Box } from "@kookie-ui/react";
import { BedSurface, PHOTO_BED } from "../preview/beds";

function Scene({ appearance }: { appearance: "light" | "dark" }) {
  return (
    <Theme appearance={appearance} material="regular">
      <BedSurface bed={PHOTO_BED} backdrop>
        <Stack gap="4" p="4">
          <Flex gap="4" align="start">
            <Button size="2">Button (control)</Button>
            <Card size="2" style={{ width: 260 }}>
              <Stack gap="1">
                <Text size="2" weight="medium">Card (pane)</Text>
                <Text size="2" emphasis="medium">Reads the judged pane cell, unchanged.</Text>
              </Stack>
            </Card>
          </Flex>
          <Composer size="2" style={{ width: 560 }}>
            <ComposerInput placeholder="Composer (region) — denser veil, wider lip" />
            <ComposerRow>
              <Button size="2" emphasis="quiet">Attach</Button>
              <ComposerSend />
            </ComposerRow>
          </Composer>
          <Box height="14rem">
            <Shell contained>
              <ShellSidebar aria-label="Primary" flush={false} backdrop>
                <Stack gap="1" p="3">
                  <Text size="2" weight="medium">Sidebar (region)</Text>
                  <Text size="2" emphasis="medium">Frame 1</Text>
                  <Text size="2" emphasis="medium">Frame 2</Text>
                </Stack>
              </ShellSidebar>
              <ShellContent>
                <Stack gap="2" p="4"><Heading size="6">Canvas</Heading></Stack>
              </ShellContent>
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
