import { Flex, Toggle, ToggleGroup } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="4" wrap="wrap" align="center">
      <Toggle disabled>Auto-save</Toggle>
      <Toggle disabled defaultPressed>
        Auto-save
      </Toggle>
      <ToggleGroup aria-label="Export formats" disabled defaultValue={["csv"]} render={<Flex gap="1" />}>
        <Toggle value="csv">CSV</Toggle>
        <Toggle value="json">JSON</Toggle>
      </ToggleGroup>
    </Flex>
  );
}
