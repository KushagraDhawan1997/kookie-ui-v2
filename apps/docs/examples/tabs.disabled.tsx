import { Tabs, TabsList, TabsTab } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTab value="general">General</TabsTab>
        <TabsTab value="members">Members</TabsTab>
        <TabsTab value="sso" disabled>
          Single sign-on
        </TabsTab>
      </TabsList>
    </Tabs>
  );
}
