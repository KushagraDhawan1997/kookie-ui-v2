import { Avatar, Badge, Flex } from "@kushagradhawan/kookie-ui-react";

// Pass the badge to the Avatar's `badge` prop. The avatar places it at the top-end corner and
// cuts a ring around it. The badge scales with the avatar.
export default function Example() {
  return (
    <Flex gap="5" align="center">
      <Avatar size="3" fallback="SB" badge={<Badge>2</Badge>} />
      <Avatar size="5" fallback="SB" badge={<Badge>2</Badge>} />
      <Avatar size="7" fallback="SB" badge={<Badge aria-label="Online" tone="success" />} />
    </Flex>
  );
}
