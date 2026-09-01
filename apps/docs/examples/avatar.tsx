import { Avatar, Badge, type TypeSize } from "@kookie-ui/react";

export default function Example({
  size = "7",
  backdrop = false,
  badge = true,
}: {
  size?: TypeSize;
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
