"use client";

import * as React from "react";
import { Button, Flex, Stack, Tabs, TabsList, TabsPanel, TabsTab, Text } from "@kookie-ui/react";

export default function Example() {
  const [tab, setTab] = React.useState("monthly");

  return (
    <Stack gap="4" style={{ maxWidth: "28rem" }}>
      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        <Stack gap="4">
          <TabsList>
            <TabsTab value="monthly">Monthly</TabsTab>
            <TabsTab value="yearly">Yearly</TabsTab>
          </TabsList>
          <TabsPanel value="monthly">
            <Text size="3">£20 per seat, billed every month.</Text>
          </TabsPanel>
          <TabsPanel value="yearly">
            <Text size="3">£192 per seat, billed once a year.</Text>
          </TabsPanel>
        </Stack>
      </Tabs>
      <Flex gap="3" align="center">
        <Button onClick={() => setTab("yearly")}>Show yearly price</Button>
        <Text size="2" emphasis="medium">
          Showing: {tab}
        </Text>
      </Flex>
    </Stack>
  );
}
