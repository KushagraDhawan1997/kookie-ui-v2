import {
  Flex,
  SegmentedControl,
  SegmentedItem,
  Stack,
  Tabs,
  TabsList,
  TabsTab,
} from "@kookie-ui/react";

export default function Lookalikes() {
  return (
    <Stack gap="7">
      <Flex justify="center">
        <Tabs defaultValue="usage">
          <TabsList>
            <TabsTab value="usage">Usage</TabsTab>
            <TabsTab value="invoices">Invoices</TabsTab>
            <TabsTab value="limits">Limits</TabsTab>
          </TabsList>
        </Tabs>
      </Flex>
      <Flex justify="center">
        <SegmentedControl
          defaultValue="month"
          aria-label="Date range"
        >
          <SegmentedItem value="day">Day</SegmentedItem>
          <SegmentedItem value="week">Week</SegmentedItem>
          <SegmentedItem value="month">Month</SegmentedItem>
        </SegmentedControl>
      </Flex>
    </Stack>
  );
}
