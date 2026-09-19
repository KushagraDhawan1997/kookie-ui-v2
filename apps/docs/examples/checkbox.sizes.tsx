import { Checkbox, Flex, Stack, Text } from "@kookie-ui/react";

const SIZES = [
  { size: "1", text: "2" },
  { size: "2", text: "3" },
  { size: "3", text: "4" },
  { size: "4", text: "5" },
] as const;

export default function Example() {
  return (
    <Stack gap="5">
      {SIZES.map(({ size, text }) => (
        <Flex key={size} gap="3" align="center">
          <Checkbox size={size} defaultChecked id={`size-${size}`} />
          <Text size={text} render={<label htmlFor={`size-${size}`} />}>
            Email me a weekly summary
          </Text>
        </Flex>
      ))}
    </Stack>
  );
}
