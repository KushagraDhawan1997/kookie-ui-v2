import { Avatar, Badge, Flex } from "@kushagradhawan/kookie-ui-react";

// Pass a `Badge` to `badge` to pin it to the top-end corner. A count shows as a pill. A bare
// badge is a dot, and it needs an `aria-label`.
export default function Example() {
  return (
    <Flex gap="5" align="center">
      <Avatar size="5" fallback="SB" badge={<Badge>4</Badge>} />
      <Avatar size="5" fallback="SB" badge={<Badge tone="success" aria-label="Online" />} />
      <Avatar size="5" fallback="SB" badge={<Badge tone="destructive" aria-label="Needs attention" />} />
    </Flex>
  );
}
