import { Flex, Radio, RadioGroup, Stack, Text } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <RadioGroup defaultValue="b">
      <Stack gap="5">
        {["a", "b", "c"].map((v) => (
          <Flex key={v} gap="3" align="center">
            <Radio size={size} value={v} id={`r-${v}`} />
            <Text size="2" render={<label htmlFor={`r-${v}`} />}>Option {v.toUpperCase()}</Text>
          </Flex>
        ))}
      </Stack>
    </RadioGroup>
  );
}
