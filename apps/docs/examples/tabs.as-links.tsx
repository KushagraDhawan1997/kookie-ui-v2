import { Tabs, TabsList, TabsTab } from "@kookie-ui/react";

export default function Example() {
  return (
    <Tabs defaultValue="/settings/profile">
      <TabsList>
        <TabsTab value="/settings/profile" render={<a href="#profile" />}>
          Profile
        </TabsTab>
        <TabsTab value="/settings/security" render={<a href="#security" />}>
          Security
        </TabsTab>
        <TabsTab value="/settings/billing" render={<a href="#billing" />}>
          Billing
        </TabsTab>
      </TabsList>
    </Tabs>
  );
}
