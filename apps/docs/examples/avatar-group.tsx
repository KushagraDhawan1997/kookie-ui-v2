import { Avatar, AvatarGroup, type AvatarSize } from "@kookie-ui/react";

export default function Example({
  size = "3",
  backdrop = false,
}: {
  size?: AvatarSize;
  backdrop?: boolean;
}) {
  return (
    <AvatarGroup size={size}>
      <Avatar src="/backdrop.jpg" alt="Shruti Bhatia" fallback="SB" backdrop={backdrop} />
      <Avatar fallback="KD" backdrop={backdrop} />
      <Avatar fallback="AR" backdrop={backdrop} />
      <Avatar fallback="+3" backdrop={backdrop} />
    </AvatarGroup>
  );
}
