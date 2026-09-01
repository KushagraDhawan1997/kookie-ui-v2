import { Button, type Emphasis, type Size, type Tone } from "@kookie-ui/react";

export default function Example({
  size = "2",
  tone = "accent",
  emphasis = "loud",
  bordered = false,
  loading = false,
  backdrop = false,
}: {
  size?: Size;
  tone?: Tone;
  emphasis?: Emphasis;
  bordered?: boolean;
  loading?: boolean;
  backdrop?: boolean;
}) {
  return (
    <Button
      size={size}
      tone={tone}
      emphasis={emphasis}
      bordered={bordered}
      loading={loading}
      backdrop={backdrop}
    >
      Save changes
    </Button>
  );
}
