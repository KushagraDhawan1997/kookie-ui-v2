import { Box, Grid, Stack, Surface, Text } from "@kookie-ui/react";

// Add `container` to make a Box measurable. Responsive values inside it then follow the Box's
// width, not the window's. A container cannot size itself from its content, so give it a
// width, or put it where the layout sets one.
export default function Example() {
  return (
    <Stack gap="3">
      {[
        { width: "18rem", label: "An 18rem container" },
        { width: "36rem", label: "A 36rem container" },
      ].map(({ width, label }) => (
        <Box key={width} container width={width}>
          <Surface>
            <Grid columns={{ initial: "1fr", sm: "1fr 1fr" }} gap="3">
              <Text size="2" weight="medium">
                {label}
              </Text>
              <Text size="2" emphasis="medium">
                One column below sm, two from sm up.
              </Text>
            </Grid>
          </Surface>
        </Box>
      ))}
    </Stack>
  );
}
