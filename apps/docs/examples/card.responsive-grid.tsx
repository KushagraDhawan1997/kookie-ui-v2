import { Card, Grid, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const STATS = [
  { label: "Active members", value: "24" },
  { label: "Open invoices", value: "3" },
  { label: "Storage used", value: "42 GB" },
];

export default function Example() {
  return (
    <Grid columns={{ initial: "1fr", sm: "repeat(3, 1fr)" }} gap="4">
      {STATS.map((stat) => (
        <Card key={stat.label}>
          <Stack gap="1">
            <Text size="2" emphasis="medium">
              {stat.label}
            </Text>
            <Text size="5" weight="medium">
              {stat.value}
            </Text>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}
