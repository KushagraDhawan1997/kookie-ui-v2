import { Button, Grid } from "@kookie-ui/react";

export default function Example() {
  return (
    <Grid columns="repeat(3, minmax(0, 1fr))" gap="3">
      <Button size="1">A</Button>
      <Button size="1">B</Button>
      <Button size="1">C</Button>
    </Grid>
  );
}
