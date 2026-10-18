import { Card, Grid, Surface, Text } from "@kushagradhawan/kookie-ui-react";

// Several cards held by a Surface, not by another Card.
export default function App() {
  return (
    <Surface>
      <Grid columns="2" gap="4">
        <Card><Text>Alpha</Text></Card>
        <Card><Text>Beta</Text></Card>
      </Grid>
    </Surface>
  );
}
