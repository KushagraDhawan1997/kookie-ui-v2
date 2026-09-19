import { Card, Grid, Stack, Text } from "@kookie-ui/react";

const PROJECTS = [
  { name: "Website redesign", meta: "Updated 2 hours ago" },
  { name: "Mobile onboarding", meta: "Updated yesterday" },
];

export default function Example() {
  return (
    <Grid columns="1fr 1fr" gap="4" style={{ maxWidth: "32rem" }}>
      {PROJECTS.map((project) => (
        <Card key={project.name} render={<a href="#project" />}>
          <Stack gap="1">
            <Text size="3" weight="medium">
              {project.name}
            </Text>
            <Text size="2" emphasis="medium">
              {project.meta}
            </Text>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}
