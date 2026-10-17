import { Card, Grid, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const PROJECTS = [{ name: "Atlas" }, { name: "Beacon" }];

export default function App() {
  return (
    <Grid columns={{ initial: "1", md: "3" }} gap="4">
      {PROJECTS.map((project) => (
        <Card key={project.name}>
          <Stack gap="2"><Text>{project.name}</Text></Stack>
        </Card>
      ))}
    </Grid>
  );
}
