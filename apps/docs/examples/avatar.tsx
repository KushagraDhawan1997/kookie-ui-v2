import { Avatar, Badge, type AvatarSize } from "@kookie-ui/react";

export default function Example({
  size = "4",
  backdrop = false,
  badge = true,
}: {
  size?: AvatarSize;
  backdrop?: boolean;
  badge?: boolean;
}) {
  return (
    <Avatar
      size={size}
      backdrop={backdrop}
      fallback="KD"
      badge={badge ? <Badge>3</Badge> : undefined}
    />
  );
}
