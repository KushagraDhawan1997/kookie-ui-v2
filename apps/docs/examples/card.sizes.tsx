import { Card, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Flex gap="4" align="flex-start" wrap="wrap">
      {SIZES.map((size) => (
        <Card key={size} size={size}>
          <Stack gap="1">
            <Text size="2" emphasis="medium">
              Storage used
            </Text>
            <Text size="3" weight="medium">
              42 GB of 100 GB
            </Text>
          </Stack>
        </Card>
      ))}
    </Flex>
  );
}
