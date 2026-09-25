import { Avatar, AvatarGroup, Stack } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4", "5"] as const;

// Set `size` once on the group. Every avatar inside that has no size of its own takes it.
export default function Example() {
  return (
    <Stack gap="4" align="start">
      {sizes.map((size) => (
        <AvatarGroup key={size} size={size}>
          <Avatar src="/backdrop.jpg" alt="Shruti Bhatia" fallback="SB" />
          <Avatar fallback="KD" />
          <Avatar fallback="AR" />
          <Avatar fallback="+2" />
        </AvatarGroup>
      ))}
    </Stack>
  );
}
