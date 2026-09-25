import { Avatar, Flex } from "@kushagradhawan/kookie-ui-react";

// With a picture, the picture shows. Until it loads, or if it fails, the `fallback` shows
// instead. Without a `fallback`, a generic person glyph shows.
export default function Example() {
  return (
    <Flex gap="4" align="center">
      <Avatar size="6" src="/backdrop.jpg" alt="Shruti Bhatia" fallback="SB" />
      <Avatar size="6" fallback="SB" />
      <Avatar size="6" />
      <Avatar size="6" src="/missing-photo.jpg" alt="Shruti Bhatia" fallback="SB" />
    </Flex>
  );
}
