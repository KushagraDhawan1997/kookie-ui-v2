import { Blockquote, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="3">
      <Blockquote size="3">
        Taste is the last layer. If the infrastructure is right, taste can be added later.
      </Blockquote>
      <Text size="1" emphasis="medium">— the standing rule</Text>
    </Stack>
  );
}
