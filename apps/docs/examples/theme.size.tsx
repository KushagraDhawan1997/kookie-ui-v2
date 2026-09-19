import { Button, Flex, Stack, Text, TextField, Theme } from "@kookie-ui/react";

const SIZES = ["2", "3"] as const;

export default function Example() {
  return (
    <Stack gap="5" style={{ minWidth: "26rem" }}>
      {SIZES.map((size) => (
        <Theme key={size} size={size}>
          <Stack gap="2">
            <Text size="2" emphasis="medium">
              Theme size {size}
            </Text>
            <Flex gap="2">
              <TextField placeholder="Coupon code" aria-label={`Coupon code, theme size ${size}`} />
              <Button>Apply</Button>
              <Button size="2">Remove</Button>
            </Flex>
          </Stack>
        </Theme>
      ))}
    </Stack>
  );
}
