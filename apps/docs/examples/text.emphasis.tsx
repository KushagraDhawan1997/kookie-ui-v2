import { Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="1" style={{ maxWidth: "28rem" }}>
      <Text size="3" weight="medium">
        Website redesign
      </Text>
      <Text size="3" emphasis="medium">
        Due Friday. Shruti Bhatia is reviewing the last three screens.
      </Text>
      <Text size="2" emphasis="quiet">
        Archived drafts are hidden
      </Text>
    </Stack>
  );
}
