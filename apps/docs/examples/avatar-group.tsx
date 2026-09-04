import { Avatar, AvatarGroup, type TypeSize } from "@kookie-ui/react";

export default function Example({
  size = "6",
  backdrop = false,
}: {
  size?: TypeSize;
  backdrop?: boolean;
}) {
  return (
    <AvatarGroup size={size}>
      <Avatar src="/backdrop.jpg" alt="Mira Chen" fallback="MC" backdrop={backdrop} />
      <Avatar fallback="KD" backdrop={backdrop} />
      <Avatar fallback="AR" backdrop={backdrop} />
      <Avatar fallback="+3" backdrop={backdrop} />
    </AvatarGroup>
  );
}
