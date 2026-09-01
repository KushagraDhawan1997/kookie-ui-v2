import { Button, Flex, Stack, Switch, Text, TextField, Theme } from "@kookie-ui/react";

export default function Example({
  density = "default",
  radius = "full",
  depth = "elevated",
}: {
  density?: "compact" | "default" | "comfortable";
  radius?: "none" | "small" | "medium" | "large" | "full";
  depth?: "flat" | "elevated";
}) {
  return (
    <Theme density={density} radius={radius} depth={depth}>
      <Stack gap="4" style={{ minWidth: "18rem" }}>
        <Text size="2" emphasis="medium">Every control below takes these three from the theme.</Text>
        <TextField placeholder="A field" aria-label="A field" />
        <Flex gap="3" align="center" justify="space-between">
          <Switch defaultChecked aria-label="A switch" />
          <Button emphasis="loud">Save</Button>
        </Flex>
      </Stack>
    </Theme>
  );
}
