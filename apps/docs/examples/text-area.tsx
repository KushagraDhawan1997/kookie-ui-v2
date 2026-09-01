import { TextArea } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({
  size = "2",
  backdrop = false,
}: {
  size?: Size;
  backdrop?: boolean;
}) {
  return (
    <TextArea
      size={size}
      backdrop={backdrop}
      rows={3}
      defaultValue="A textarea is a paragraph."
      aria-label="Notes"
    />
  );
}
