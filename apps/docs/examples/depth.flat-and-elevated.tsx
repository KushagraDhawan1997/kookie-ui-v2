import { Button, Grid, Slider, Stack, Text, Theme } from "@kushagradhawan/kookie-ui-react";

// The same controls in an elevated region and in a flat one. In the flat region the loud button
// loses its shadow, while the slider handle keeps a small one.
function Panel({ label }: { label: string }) {
  return (
    <Stack gap="4">
      <Text size="3" weight="medium">
        {label}
      </Text>
      <Slider defaultValue={40} aria-label={`Volume, ${label}`} />
      <Button emphasis="loud">Save</Button>
    </Stack>
  );
}

export default function Example() {
  return (
    <Grid columns="repeat(auto-fit, minmax(12rem, 1fr))" gap="5" style={{ flexGrow: 1 }}>
      <Theme depth="elevated">
        <Panel label="Elevated" />
      </Theme>
      <Theme depth="flat">
        <Panel label="Flat" />
      </Theme>
    </Grid>
  );
}
