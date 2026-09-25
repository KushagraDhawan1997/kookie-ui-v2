import { Button, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const aligns = ["flex-start", "center", "flex-end", "stretch"] as const;

export default function Example() {
  return (
    <Flex gap="6" wrap="wrap">
      {aligns.map((align) => (
        <Stack key={align} gap="2" align={align} style={{ width: "10rem" }}>
          <Text size="2" emphasis="medium">
            {align}
          </Text>
          <Button>Upgrade</Button>
          <Button>Compare plans</Button>
        </Stack>
      ))}
    </Flex>
  );
}
