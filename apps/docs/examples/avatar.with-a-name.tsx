import { Avatar, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// When the name is written next to the avatar, leave `alt` empty. The picture is then
// decorative, and a screen reader does not say the name twice.
export default function Example() {
  return (
    <Flex gap="3" align="center">
      <Avatar size="4" src="/backdrop.jpg" fallback="SB" />
      <Stack gap="1">
        <Text weight="medium">Shruti Bhatia</Text>
        <Text size="2" emphasis="medium">
          Product designer · Owner
        </Text>
      </Stack>
    </Flex>
  );
}
