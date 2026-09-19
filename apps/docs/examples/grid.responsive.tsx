import { Card, Grid, Heading, Stack, Text } from "@kookie-ui/react";

const projects = [
  { name: "Billing service", meta: "Deployed 2 hours ago" },
  { name: "Marketing site", meta: "Deployed yesterday" },
  { name: "Mobile API", meta: "Build failed" },
  { name: "Design tokens", meta: "Deployed 3 days ago" },
  { name: "Docs", meta: "Deployed last week" },
  { name: "Status page", meta: "No deploys yet" },
];

// One column on a narrow container, two from `sm`, three from `md`.
// The tiers follow the width of the nearest container, not the window.
export default function Example() {
  return (
    <Grid
      gap="4"
      columns={{
        initial: "minmax(0, 1fr)",
        sm: "repeat(2, minmax(0, 1fr))",
        md: "repeat(3, minmax(0, 1fr))",
      }}
    >
      {projects.map((project) => (
        <Card key={project.name}>
          <Stack gap="1">
            <Heading size="4" render={<h3 />}>
              {project.name}
            </Heading>
            <Text size="2" emphasis="medium">
              {project.meta}
            </Text>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}
