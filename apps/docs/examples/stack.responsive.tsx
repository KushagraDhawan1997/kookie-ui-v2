import { Button, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap={{ initial: "3", md: "5" }} align={{ initial: "stretch", md: "flex-start" }}>
      <Text size="3">Your trial ends in three days.</Text>
      <Button emphasis="loud">Choose a plan</Button>
      <Button>Talk to sales</Button>
    </Stack>
  );
}
