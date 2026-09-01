import { Button, type Emphasis, type Size, type Tone } from "@kookie-ui/react";

export default function Example({
  size = "2",
  tone = "accent",
  emphasis = "loud",
  bordered = false,
  loading = false,
}: {
  size?: Size;
  tone?: Tone;
  emphasis?: Emphasis;
  bordered?: boolean;
  loading?: boolean;
}) {
  return (
    <Button size={size} tone={tone} emphasis={emphasis} bordered={bordered} loading={loading}>
      Save changes
    </Button>
  );
}
