import { Avatar, Badge, Flex, Text, type TypeSize } from "@kookie-ui/react";

export default function Example({ size = "3" }: { size?: TypeSize }) {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      <Text size={size}>
        Inbox <Badge>3</Badge>
      </Text>
      <Text size={size}>
        Updates <Badge aria-label="New" />
      </Text>
      <Text size={size}>
        Alerts <Badge tone="destructive">128</Badge>
      </Text>
      <Avatar size="7" fallback="KD" badge={<Badge>3</Badge>} />
      <Avatar size="7" fallback="MC" badge={<Badge aria-label="Online" />} />
    </Flex>
  );
}
