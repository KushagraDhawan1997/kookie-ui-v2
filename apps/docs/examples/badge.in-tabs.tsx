import { Badge, Tabs, TabsList, TabsTab } from "@kushagradhawan/kookie-ui-react";

// A badge in a tab label counts what waits on the other side of the tab.
export default function Example() {
  return (
    <Tabs defaultValue="open">
      <TabsList>
        <TabsTab value="open">
          Open <Badge>14</Badge>
        </TabsTab>
        <TabsTab value="review">
          In review <Badge tone="warning">3</Badge>
        </TabsTab>
        <TabsTab value="closed">Closed</TabsTab>
      </TabsList>
    </Tabs>
  );
}
