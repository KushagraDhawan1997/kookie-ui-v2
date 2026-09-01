import { TextField, type Size } from "@kookie-ui/react";

export default function Example({
  size = "2",
  backdrop = false,
}: {
  size?: Size;
  backdrop?: boolean;
}) {
  return (
    <TextField
      size={size}
      backdrop={backdrop}
      placeholder="Search"
      aria-label="Search"
      style={{ maxWidth: "22rem" }}
    />
  );
}
