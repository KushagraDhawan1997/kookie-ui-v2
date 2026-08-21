import { Tabs, TabsList, TabsTab } from "@kookie-ui/react";

export default function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="activity">Activity</TabsTab>
      </TabsList>
    </Tabs>
  );
}
