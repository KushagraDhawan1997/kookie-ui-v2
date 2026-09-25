import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Tabs defaultValue="overview" style={{ maxWidth: "32rem" }}>
      <Stack gap="4">
        <TabsList>
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="activity">Activity</TabsTab>
          <TabsTab value="settings">Settings</TabsTab>
        </TabsList>
        <TabsPanel value="overview">
          <Text size="3">Website redesign is 64% complete and due on Friday.</Text>
        </TabsPanel>
        <TabsPanel value="activity">
          <Text size="3">Shruti Bhatia uploaded three files an hour ago.</Text>
        </TabsPanel>
        <TabsPanel value="settings">
          <Text size="3">Only project owners can change these settings.</Text>
        </TabsPanel>
      </Stack>
    </Tabs>
  );
}
