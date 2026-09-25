import { Stack, Tabs, TabsList, TabsTab } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Stack gap="5">
      {sizes.map((size) => (
        <Tabs key={size} defaultValue="files">
          <TabsList size={size}>
            <TabsTab value="files">Files</TabsTab>
            <TabsTab value="people">People</TabsTab>
            <TabsTab value="billing">Billing</TabsTab>
          </TabsList>
        </Tabs>
      ))}
    </Stack>
  );
}
