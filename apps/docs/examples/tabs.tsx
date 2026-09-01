import { Tabs, TabsList, TabsTab } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList size={size}>
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="activity">Activity</TabsTab>
      </TabsList>
    </Tabs>
  );
}
