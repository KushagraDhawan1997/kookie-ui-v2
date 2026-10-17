import { Card, Grid, Text } from "@kushagradhawan/kookie-ui-react";

const PROJECTS = [{ name: "Atlas" }, { name: "Beacon" }];

// Three columns at every width, so a phone gets three slivers.
export default function App() {
  return (
    <Grid columns="3" gap="4">
      {PROJECTS.map((project) => (
        <Card key={project.name}><Text>{project.name}</Text></Card>
      ))}
    </Grid>
  );
}
