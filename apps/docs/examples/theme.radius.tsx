import { Button, Flex, Stack, Text, TextField, Theme } from "@kookie-ui/react";

const RADII = ["none", "small", "medium", "large", "full"] as const;

export default function Example() {
  return (
    <Stack gap="4" style={{ minWidth: "26rem" }}>
      {RADII.map((radius) => (
        <Theme key={radius} radius={radius}>
          <Flex gap="3" align="center">
            <Text size="2" emphasis="medium" style={{ width: "4rem" }}>
              {radius}
            </Text>
            <TextField placeholder="Project name" aria-label={`Project name, ${radius}`} />
            <Button>Rename</Button>
          </Flex>
        </Theme>
      ))}
    </Stack>
  );
}
