import { Avatar, AvatarGroup, type TypeSize } from "@kookie-ui/react";

export default function Example({ size = "6" }: { size?: TypeSize }) {
  return (
    <AvatarGroup size={size}>
      <Avatar src="/backdrop.jpg" alt="Mira Chen" fallback="MC" />
      <Avatar fallback="KD" />
      <Avatar fallback="AR" />
      <Avatar fallback="+3" />
    </AvatarGroup>
  );
}
