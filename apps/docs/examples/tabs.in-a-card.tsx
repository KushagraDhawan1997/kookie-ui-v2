import {
  Card,
  Heading,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "28rem" }}>
      <Stack gap="4">
        <Heading size="6">Deployments</Heading>
        <Tabs defaultValue="production">
          <Stack gap="4">
            <TabsList>
              <TabsTab value="production">Production</TabsTab>
              <TabsTab value="preview">Preview</TabsTab>
            </TabsList>
            <TabsPanel value="production">
              <Text size="2" emphasis="medium">
                Last deployed 12 minutes ago by Shruti Bhatia.
              </Text>
            </TabsPanel>
            <TabsPanel value="preview">
              <Text size="2" emphasis="medium">
                Four preview builds are running.
              </Text>
            </TabsPanel>
          </Stack>
        </Tabs>
      </Stack>
    </Card>
  );
}
