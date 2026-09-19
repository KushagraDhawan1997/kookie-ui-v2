import { NumberField, Stack } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "12rem" }}>
      <NumberField size="1" defaultValue={2} min={0} aria-label="Replicas at size 1" />
      <NumberField size="2" defaultValue={2} min={0} aria-label="Replicas at size 2" />
      <NumberField size="3" defaultValue={2} min={0} aria-label="Replicas at size 3" />
      <NumberField size="4" defaultValue={2} min={0} aria-label="Replicas at size 4" />
    </Stack>
  );
}
