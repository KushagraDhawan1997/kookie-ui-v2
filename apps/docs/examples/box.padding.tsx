import { Box, Grid, Surface, Text } from "@kushagradhawan/kookie-ui-react";

const steps = ["2", "4", "6"] as const;

// `p` sets padding on all four sides. `px` sets the left and right, `py` sets the top and
// bottom, and `pt`, `pr`, `pb` and `pl` set one side. Every value is a step on the space scale.
export default function Example() {
  return (
    <Grid columns="repeat(3, minmax(0, 1fr))" gap="3" style={{ minWidth: "28rem" }}>
      {steps.map((step) => (
        <Surface key={step}>
          <Box p={step}>
            <Text size="2">Padding {step}</Text>
          </Box>
        </Surface>
      ))}
    </Grid>
  );
}
