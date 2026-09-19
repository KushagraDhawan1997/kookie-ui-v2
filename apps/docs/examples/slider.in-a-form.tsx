import { Button, Field, FieldDescription, FieldLabel, Slider, Stack } from "@kookie-ui/react";

// Inside a Field, the FieldLabel names the Slider, so it needs no `aria-label`. Give it a
// `name` and the value is sent with the form.
export default function Example() {
  return (
    <Stack render={<form />} gap="5" style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <Field>
        <FieldLabel>Image quality</FieldLabel>
        <Slider name="quality" defaultValue={80} min={10} max={100} step={10} />
        <FieldDescription>Higher quality makes larger files.</FieldDescription>
      </Field>
      <Button type="submit" emphasis="loud">
        Export images
      </Button>
    </Stack>
  );
}
