import { Card, Grid, Stack, Surface, Text } from "@kushagradhawan/kookie-ui-react";

const projects = [
  ["Website redesign", "Due Friday"],
  ["Q4 campaign", "In review"],
  ["Mobile onboarding", "Blocked"],
] as const;

export default function Example() {
  return (
    <Surface size="3" style={{ maxWidth: "40rem" }}>
      <Grid columns="repeat(auto-fill, minmax(10rem, 1fr))" gap="3">
        {projects.map(([name, status]) => (
          <Card key={name} size="2">
            <Stack gap="1">
              <Text size="3" weight="medium">
                {name}
              </Text>
              <Text size="2" emphasis="medium">
                {status}
              </Text>
            </Stack>
          </Card>
        ))}
      </Grid>
    </Surface>
  );
}
