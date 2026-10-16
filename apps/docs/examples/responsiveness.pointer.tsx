import { Button, Flex, Grid, Stack, Text, TextField, Theme } from "@kushagradhawan/kookie-ui-react";

const POINTERS = ["fine", "coarse"] as const;

// The same code under each pointer. Only the measurements change: control height, padding,
// icon size and body text. The gap between the two controls stays the same.
export default function Example() {
  return (
    <Grid columns={{ initial: "1", sm: "2" }} gap="6">
      {POINTERS.map((pointer) => (
        <Theme key={pointer} pointer={pointer}>
          <Stack gap="2">
            <Text size="2" emphasis="medium">
              pointer="{pointer}"
            </Text>
            <Flex gap="2">
              <TextField placeholder="Email" aria-label={`Email, ${pointer} pointer`} />
              <Button>Invite</Button>
            </Flex>
          </Stack>
        </Theme>
      ))}
    </Grid>
  );
}
